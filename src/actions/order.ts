"use server";

import { z } from "zod";
import {
  createOrder,
  getOrders,
  getProductWithPricing,
  getOrCreateUser,
  updateOrderStatus,
  Order,
} from "@/lib/mock-db";
import {
  getBlendProfile,
  calculateAdvancedPriceMetrics,
} from "@/lib/coffee-calculations";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { ActionResponse } from "./comment";
import { toEnglishDigits } from "@/lib/utils";

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

export async function getOrdersAction(): Promise<ActionResponse<Order[]>> {
  try {
    const orders = getOrders();
    return { success: true, data: orders };
  } catch (error) {
    return { success: false, error: "خطا در دریافت تاریخچه سفارش‌ها رخ داد." };
  }
}

export async function updateOrderStatusAction(
  orderId: string,
  status: "pending" | "completed",
): Promise<ActionResponse<boolean>> {
  try {
    const updated = updateOrderStatus(orderId, status);
    if (!updated) {
      return { success: false, error: "سفارش مورد نظر یافت نشد." };
    }
    revalidatePath("/admin/orders");
    revalidatePath("/profile");
    return {
      success: true,
      data: true,
      message: "وضعیت سفارش با موفقیت به روزرسانی شد.",
    };
  } catch (error) {
    return { success: false, error: "خطا در به روزرسانی وضعیت سفارش." };
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
}): Promise<ActionResponse<Order>> {
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

    if (otp !== "1234") {
      return {
        success: false,
        error:
          "کد تایید پیامکی معتبر نیست. لطفاً مجدداً تلاش کنید. (کد تست: ۱۲۳۴)",
      };
    }

    const { getCurrentUserAction } = await import("@/actions/auth");
    const currentUserRes = await getCurrentUserAction();
    const securePhone =
      currentUserRes.success && currentUserRes.user
        ? currentUserRes.user.phone
        : customerPhone;

    const { dbTransaction } = await import("@/lib/mock-db");

    return await dbTransaction.runExclusive(async () => {
      const product = getProductWithPricing(productId);
      if (!product) {
        return {
          success: false,
          error: "محصول مورد نظر یافت نشد.",
        };
      }

      const blendProfile = getBlendProfile(blend);
      const { MOCK_COUPONS, MOCK_COUPON_USAGES, recordCouponUsage } =
        await import("@/lib/mock-db");

      if (appliedCouponCode) {
        const cleanCode = appliedCouponCode.trim().toUpperCase();
        const activeCoupon = MOCK_COUPONS.find(
          (c) =>
            c.isActive &&
            !c.deletedAt &&
            c.type === "user_code" &&
            c.code.toUpperCase() === cleanCode,
        );

        if (!activeCoupon) {
          return {
            success: false,
            error: "کد تخفیف وارد شده معتبر نیست یا منقضی شده است.",
          };
        }

        if (activeCoupon.productId && activeCoupon.productId !== productId) {
          return {
            success: false,
            error: "این کد تخفیف برای محصول انتخابی شما معتبر نیست.",
          };
        }

        const { getTehranTodayString } = await import("@/lib/jalali-converter");
        const tehranTodayStr = getTehranTodayString();
        const normalizeDateToTimestamp = (dateStr: string): number => {
          const normalized = dateStr.includes("T")
            ? dateStr.split("T")[0]
            : dateStr;
          const [year, month, day] = normalized.split(/[-/]/).map(Number);
          return Date.UTC(year, month - 1, day);
        };
        const [ty, tm, td] = tehranTodayStr.split("-").map(Number);
        const todayTimestamp = Date.UTC(ty, tm - 1, td);

        if (activeCoupon.validFrom) {
          const fromTimestamp = normalizeDateToTimestamp(
            activeCoupon.validFrom,
          );
          if (todayTimestamp < fromTimestamp) {
            return {
              success: false,
              error: "زمان فعال‌سازی این کد تخفیف هنوز فرا نرسیده است.",
            };
          }
        }
        if (activeCoupon.validTo) {
          const toTimestamp = normalizeDateToTimestamp(activeCoupon.validTo);
          if (todayTimestamp > toTimestamp) {
            return {
              success: false,
              error: "اعتبار این کد تخفیف به پایان رسیده است.",
            };
          }
        }

        const isDoubleSpendingSimulated = MOCK_COUPON_USAGES.some(
          (u) => u.couponId === activeCoupon.id && u.phone === securePhone,
        );
        if (isDoubleSpendingSimulated) {
          return {
            success: false,
            error:
              "تراکنش مسدود شد: این کد تخفیف قبلاً توسط شما استفاده شده است.",
          };
        }
      }

      const pricingBreakdown = calculateAdvancedPriceMetrics({
        productId,
        pricing: product.pricing,
        blendProfile,
        weightGrams: weightGrams,
        quantity: quantity,
        activeCoupons: MOCK_COUPONS,
        appliedUserCouponCode: appliedCouponCode,
        userPhone: securePhone,
        couponUsages: MOCK_COUPON_USAGES,
      });

      const isCouponActuallyApplied =
        appliedCouponCode && pricingBreakdown.userCouponDiscountAmount > 0;

      const secureFinalPrice = pricingBreakdown.finalPrice;

      if (isCouponActuallyApplied) {
        const appliedCoupon = MOCK_COUPONS.find(
          (c) =>
            c.isActive &&
            !c.deletedAt &&
            c.type === "user_code" &&
            c.code.toUpperCase() === appliedCouponCode.trim().toUpperCase(),
        );
        if (appliedCoupon) {
          recordCouponUsage(appliedCoupon.id, securePhone);
        }
      }

      const newOrder = createOrder({
        productId,
        weightGrams: weightGrams,
        quantity: quantity,
        grindType: `ترکیب: ${blend} | آسیاب: ${grind}`,
        finalPrice: secureFinalPrice,
        customerName,
        customerPhone: securePhone,
        customerAddress,
      });

      getOrCreateUser(securePhone, customerName);

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
        data: newOrder,
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
