"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  getBlendProfile,
  calculateAdvancedPriceMetrics,
} from "@/lib/coffee-calculations";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { ActionResponse } from "@/types/actions";
import { toEnglishDigits } from "@/lib/utils";
import { verifyOtpInternal } from "@/lib/otp-service";
import { getCurrentUserAction } from "@/actions/user-auth";
import { mapPrismaCoupon } from "@/lib/coupon-mappers";
import { Order } from "@/types";
import crypto from "crypto";
import { createSignedToken } from "@/lib/session";

export const serverOrderSchema = z.object({
  productId: z.string().min(1, "شناسه کالا نامعتبر است."),
  weightGrams: z.number().min(250, "حداقل وزن سفارش ۲۵۰ گرم است."),
  quantity: z.number().min(1, "تعداد بسته‌ها باید حداقل ۱ عدد باشد."),
  blend: z.string().min(1, "انتخاب ترکیب دانه‌ها الزامی است."),
  grind: z.string().min(1, "انتخاب نوع آسیاب الزامی است."),
  customerName: z
    .string()
    .min(3, "نام و نام خانوادگی باید حداقل ۳ کاراکتر باشد.")
    .max(100, "نام وارد شده بیش از حد طولانی است.")
    .refine((val) => val.trim().split(/\s+/).length >= 2, {
      message: "لطفاً نام و نام خانوادگی کامل خود را وارد کنید.",
    }),
  customerPhone: z.preprocess(
    (val) => (typeof val === "string" ? toEnglishDigits(val.trim()) : val),
    z
      .string()
      .regex(
        /^09[0-9]{9}$/,
        "لطفاً یک شماره موبایل معتبر (مانند ۰۹۱۲۳۴۵۶۷۸۹) وارد کنید.",
      ),
  ),
  customerAddress: z
    .string()
    .min(10, "آدرس محل تحویل باید حداقل ۱۰ کاراکتر باشد.")
    .max(500, "آدرس وارد شده بیش از حد طولانی است."),
  otp: z
    .string()
    .length(4, "کد تایید پیامکی باید دقیقاً ۴ رقم باشد.")
    .regex(/^[0-9]+$/, "کد تایید پیامکی باید عددی باشد."),
  appliedCouponCode: z.string().nullable().optional(),
});

export type ServerOrderPayload = z.infer<typeof serverOrderSchema>;

export async function submitOrderAction(
  payload: ServerOrderPayload,
): Promise<ActionResponse<Order>> {
  try {
    const validated = serverOrderSchema.safeParse(payload);
    if (!validated.success) {
      return {
        success: false,
        error:
          validated.error.issues[0]?.message || "اطلاعات ارسالی معتبر نیست.",
      };
    }

    const {
      productId,
      weightGrams,
      quantity,
      blend,
      grind,
      customerName,
      customerPhone,
      customerAddress,
      otp,
      appliedCouponCode,
    } = validated.data;

    const currentUserRes = await getCurrentUserAction();
    const isAuth = currentUserRes.success && Boolean(currentUserRes.user);
    const securePhone = isAuth ? currentUserRes.user!.phone : customerPhone;

    if (!isAuth) {
      const isOtpValid = await verifyOtpInternal(securePhone, otp);
      if (!isOtpValid) {
        return {
          success: false,
          error:
            "کد تایید وارد شده اشتباه یا زمان اعتبار آن به پایان رسیده است.",
        };
      }
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { pricing: true },
    });

    if (!product) {
      return { success: false, error: "محصول مورد نظر یافت نشد." };
    }

    const totalWeightNeeded = weightGrams * quantity;
    if (product.stockGrams < totalWeightNeeded) {
      return {
        success: false,
        error: "موجودى فیزیکی انبار برای ثبت این مقدار سفارش کافی نیست.",
      };
    }

    let coupon = null;
    if (appliedCouponCode) {
      const cleanCode = appliedCouponCode.trim().toUpperCase();
      coupon = await prisma.coupon.findUnique({
        where: { code: cleanCode },
      });

      if (!coupon || !coupon.isActive || coupon.deletedAt) {
        return {
          success: false,
          error: "کد تخفیف وارد شده معتبر نیست یا منقضی شده است.",
        };
      }

      if (coupon.productId && coupon.productId !== productId) {
        return {
          success: false,
          error: "این کد تخفیف برای محصول انتخابی شما معتبر نیست.",
        };
      }

      const usage = await prisma.couponUsage.findUnique({
        where: {
          couponId_phone: {
            couponId: coupon.id,
            phone: securePhone,
          },
        },
      });

      if (usage) {
        return {
          success: false,
          error:
            "تراکنش مسدود شد: این کد تخفیف قبلاً توسط شما استفاده شده است.",
        };
      }
    }

    const blendProfile = getBlendProfile(blend);
    const activeCoupons = await prisma.coupon.findMany({
      where: { deletedAt: null },
    });
    const couponUsages = await prisma.couponUsage.findMany();

    const pricingBreakdown = calculateAdvancedPriceMetrics({
      productId,
      pricing: product.pricing,
      blendProfile,
      weightGrams,
      quantity,
      activeCoupons: activeCoupons.map(mapPrismaCoupon),
      appliedUserCouponCode: appliedCouponCode,
      userPhone: securePhone,
      couponUsages: couponUsages.map((u) => ({
        id: u.id,
        couponId: u.couponId,
        phone: u.phone,
        usedAt: u.usedAt.toISOString(),
      })),
    });

    const finalOrder = await prisma.$transaction(async (tx) => {
      const updateResult = await tx.product.updateMany({
        where: {
          id: productId,
          stockGrams: { gte: totalWeightNeeded },
        },
        data: {
          stockGrams: { decrement: totalWeightNeeded },
        },
      });

      if (updateResult.count === 0) {
        throw new Error(
          "موجودى فیزیکی انبار برای ثبت این مقدار سفارش کافی نیست.",
        );
      }

      const user = await tx.user.upsert({
        where: { phone: securePhone },
        update: { name: customerName, address: customerAddress },
        create: {
          phone: securePhone,
          name: customerName,
          address: customerAddress,
        },
      });

      if (coupon && pricingBreakdown.userCouponDiscountAmount > 0) {
        await tx.couponUsage.create({
          data: {
            couponId: coupon.id,
            phone: securePhone,
          },
        });
      }

      const secureRandomId = crypto.randomInt(100000000000, 1000000000000);
      const generatedId = `ORD-${secureRandomId}`;

      return tx.order.create({
        data: {
          id: generatedId,
          userId: user.id,
          couponId: coupon?.id ?? null,
          finalPrice: pricingBreakdown.finalPrice,
          customerName,
          customerPhone: securePhone,
          customerAddress,
          status: "unreviewed",
          orderItems: {
            create: {
              productId,
              weightGrams,
              quantity,
              blend,
              grind,
              grindType: `ترکیب: ${blend} | آسیاب: ${grind}`,
              price: pricingBreakdown.finalPrice,
            },
          },
        },
        include: {
          orderItems: true,
        },
      });
    });

    const cookieStore = await cookies();
    cookieStore.set("user_phone", createSignedToken(securePhone), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    revalidatePath("/");
    revalidatePath("/profile");

    const firstItem = finalOrder.orderItems[0];

    return {
      success: true,
      data: {
        id: finalOrder.id,
        productId: firstItem?.productId ?? productId,
        weightGrams: firstItem?.weightGrams ?? weightGrams,
        quantity: firstItem?.quantity ?? quantity,
        grindType: firstItem?.grindType ?? `ترکیب: ${blend} | آسیاب: ${grind}`,
        finalPrice: finalOrder.finalPrice,
        customerName: finalOrder.customerName,
        customerPhone: finalOrder.customerPhone,
        customerAddress: finalOrder.customerAddress,
        createdAt: finalOrder.createdAt.toISOString(),
        status: finalOrder.status as Order["status"],
      },
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "خطایی در فرآیند محاسبات و ثبت نهایی سفارش رخ داد.",
    };
  }
}
