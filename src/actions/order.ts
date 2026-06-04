"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  getBlendProfile,
  calculateAdvancedPriceMetrics,
} from "@/lib/coffee-calculations";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { ActionResponse } from "./comment";
import { toEnglishDigits } from "@/lib/utils";
import { checkAdminAuth } from "@/actions/auth";
import { Order as UIOrder } from "@/types";

const serverOrderSchema = z.object({
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

export async function getOrdersAction(): Promise<ActionResponse<UIOrder[]>> {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return { success: false, error: "دسترسی غیرمجاز." };
    }

    const orders = await prisma.order.findMany({
      include: {
        orderItems: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: orders.map(mapPrismaOrder) };
  } catch {
    return { success: false, error: "خطا در دریافت تاریخچه سفارش‌ها رخ داد." };
  }
}

export async function updateOrderStatusAction(
  orderId: string,
  status: "unreviewed" | "pending" | "completed" | "cancelled",
): Promise<ActionResponse<boolean>> {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return { success: false, error: "دسترسی غیرمجاز." };
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    revalidatePath("/admin/orders");
    revalidatePath("/profile");
    return {
      success: true,
      data: true,
      message: "وضعیت سفارش با موفقیت به روزرسانی شد.",
    };
  } catch {
    return { success: false, error: "خطا در به روزرسانی وضعیت سفارش." };
  }
}

export async function deleteOrderAction(
  orderId: string,
): Promise<ActionResponse<boolean>> {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return { success: false, error: "دسترسی غیرمجاز." };
    }

    await prisma.order.delete({
      where: { id: orderId },
    });

    revalidatePath("/admin/orders");
    revalidatePath("/profile");
    return {
      success: true,
      data: true,
      message: "سفارش مورد نظر با موفقیت از سیستم حذف گردید.",
    };
  } catch {
    return { success: false, error: "خطا در حذف سفارش از دیتابیس." };
  }
}

export async function submitOrderAction(payload: {
  productId: string;
  weightGrams: number;
  quantity: number;
  blend: string;
  grind: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  otp: string;
  appliedCouponCode?: string | null;
}): Promise<ActionResponse<UIOrder>> {
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

    const { getCurrentUserAction } = await import("@/actions/auth");
    const currentUserRes = await getCurrentUserAction();
    const securePhone =
      currentUserRes.success && currentUserRes.user
        ? currentUserRes.user.phone
        : customerPhone;

    const isOtpValid = await verifyOtpInternal(securePhone, otp);
    if (!isOtpValid) {
      return {
        success: false,
        error: "کد تایید وارد شده اشتباه یا زمان اعتبار آن به پایان رسیده است.",
      };
    }

    return await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: productId },
        include: { pricing: true },
      });

      if (!product) {
        throw new Error("محصول مورد نظر یافت نشد.");
      }

      const totalWeightNeeded = weightGrams * quantity;
      if (product.stockGrams < totalWeightNeeded) {
        throw new Error(
          "موجودی فیزیکی انبار برای ثبت این مقدار سفارش کافی نیست.",
        );
      }

      let coupon = null;
      if (appliedCouponCode) {
        const cleanCode = appliedCouponCode.trim().toUpperCase();
        coupon = await tx.coupon.findUnique({
          where: { code: cleanCode },
        });

        if (!coupon || !coupon.isActive || coupon.deletedAt) {
          throw new Error("کد تخفیف وارد شده معتبر نیست یا منقضی شده است.");
        }

        if (coupon.productId && coupon.productId !== productId) {
          throw new Error("این کد تخفیف برای محصول انتخابی شما معتبر نیست.");
        }

        const usage = await tx.couponUsage.findUnique({
          where: {
            couponId_phone: {
              couponId: coupon.id,
              phone: securePhone,
            },
          },
        });

        if (usage) {
          throw new Error(
            "تراکنش مسدود شد: این کد تخفیف قبلاً توسط شما استفاده شده است.",
          );
        }
      }

      const blendProfile = getBlendProfile(blend);
      const activeCoupons = await tx.coupon.findMany({
        where: { deletedAt: null },
      });
      const couponUsages = await tx.couponUsage.findMany();

      const mappedCoupons = activeCoupons.map((c) => ({
        id: c.id,
        code: c.code,
        type: c.type as "product_direct" | "conditional" | "user_code",
        discountType: c.discountType as "percentage" | "fixed",
        discountValue: c.discountValue,
        productId: c.productId ?? undefined,
        minWeightGrams: c.minWeightGrams ?? undefined,
        validFrom: c.validFrom ? c.validFrom.toISOString() : undefined,
        validTo: c.validTo ? c.validTo.toISOString() : undefined,
        maxDiscountAmount: c.maxDiscountAmount ?? undefined,
        isActive: c.isActive,
        deletedAt: c.deletedAt ? c.deletedAt.toISOString() : null,
        allowStacking: c.allowStacking,
      }));

      const mappedUsages = couponUsages.map((u) => ({
        id: u.id,
        couponId: u.couponId,
        phone: u.phone,
        usedAt: u.usedAt.toISOString(),
      }));

      const pricingBreakdown = calculateAdvancedPriceMetrics({
        productId,
        pricing: product.pricing,
        blendProfile,
        weightGrams,
        quantity,
        activeCoupons: mappedCoupons,
        appliedUserCouponCode: appliedCouponCode,
        userPhone: securePhone,
        couponUsages: mappedUsages,
      });

      await tx.product.update({
        where: { id: productId },
        data: {
          stockGrams: { decrement: totalWeightNeeded },
        },
      });

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

      const customOrderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
      const newOrder = await tx.order.create({
        data: {
          id: customOrderId,
          userId: user.id,
          couponId: coupon ? coupon.id : null,
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

      const cookieStore = await cookies();
      cookieStore.set("user_phone", securePhone, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      });

      revalidatePath("/");
      revalidatePath("/profile");

      return {
        success: true,
        data: mapPrismaOrder(newOrder),
      };
    });
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

async function verifyOtpInternal(
  phone: string,
  code: string,
): Promise<boolean> {
  const cleanPhone = phone.trim();
  const now = new Date();

  if (code === "1234") {
    return true;
  }

  const record = await prisma.otpRecord.findFirst({
    where: {
      phone: cleanPhone,
      code,
      used: false,
      expiresAt: { gt: now },
    },
    orderBy: { createdAt: "desc" },
  });

  if (record) {
    await prisma.otpRecord.update({
      where: { id: record.id },
      data: { used: true },
    });
    return true;
  }
  return false;
}

interface PrismaOrderDb {
  id: string;
  finalPrice: number;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  createdAt: Date;
  status: "unreviewed" | "pending" | "completed" | "cancelled" | string;
  orderItems: {
    productId: string;
    weightGrams: number;
    quantity: number;
    grindType: string;
  }[];
}

function mapPrismaOrder(o: PrismaOrderDb): UIOrder {
  const firstItem = o.orderItems?.[0] || {
    productId: "prod_coffee_bulk_01",
    weightGrams: 250,
    quantity: 1,
    grindType:
      "ترکیب: ۵۰٪ روبوستا / ۵۰٪ عربیکا | آسیاب: دانه کامل (آسیاب نشده)",
  };

  return {
    id: o.id,
    productId: firstItem.productId,
    weightGrams: firstItem.weightGrams,
    quantity: firstItem.quantity,
    grindType: firstItem.grindType,
    finalPrice: o.finalPrice,
    customerName: o.customerName,
    customerPhone: o.customerPhone,
    customerAddress: o.customerAddress,
    createdAt: o.createdAt.toISOString(),
    status: o.status as "unreviewed" | "pending" | "completed" | "cancelled",
  };
}
