"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ActionResponse } from "./comment";
import {
  getBlendProfile,
  calculateAdvancedPriceMetrics,
} from "@/lib/coffee-calculations";
import { toEnglishDigits } from "@/lib/utils";
import { getTehranTodayString } from "@/lib/jalali-converter";
import { checkAdminAuth } from "@/actions/auth";

const createCouponSchema = z.object({
  code: z.string().optional(),
  type: z.enum(["product_direct", "conditional", "user_code"]),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.number().min(1, "مقدار تخفیف نامعتبر است"),
  productId: z.string().optional(),
  minWeightGrams: z.number().optional(),
  validFrom: z.string().optional(),
  validTo: z.string().optional(),
  maxDiscountAmount: z.number().optional(),
  isActive: z.boolean().default(true),
  allowStacking: z.boolean().optional().default(false),
});

export async function validateCouponAction(payload: {
  code: string;
  phone?: string | null;
  productId: string;
  weightGrams: number;
  quantity: number;
  blend: string;
}): Promise<
  ActionResponse<{
    couponId: string;
    code: string;
    discountType: "percentage" | "fixed";
    discountValue: number;
    discountAmount: number;
    finalPrice: number;
    directDiscountAmount: number;
    conditionalDiscountAmount: number;
  }>
> {
  try {
    const { code, phone, productId, weightGrams, quantity, blend } = payload;

    if (!code) {
      return { success: false, error: "کد تخفیف نمی‌تواند خالی باشد." };
    }

    const cleanCode = code.trim().toUpperCase();
    const cleanPhone = phone ? toEnglishDigits(phone.trim()) : null;

    const { getCurrentUserAction } = await import("@/actions/auth");
    const currentUserRes = await getCurrentUserAction();
    const securePhone =
      currentUserRes.success && currentUserRes.user
        ? currentUserRes.user.phone
        : cleanPhone;

    const { getCouponByCode, getCouponUsages, getProductWithPricing } =
      await import("@/lib/mock-db");

    const coupon = getCouponByCode(cleanCode);
    if (!coupon || !coupon.isActive || coupon.deletedAt) {
      return { success: false, error: "کد تخفیف وارد شده معتبر نیست." };
    }

    if (coupon.type !== "user_code") {
      return {
        success: false,
        error: "این کد به عنوان تخفیف سیستمی و خودکار اعمال می‌گردد.",
      };
    }

    if (coupon.productId && coupon.productId !== productId) {
      return {
        success: false,
        error: "این کد تخفیف برای محصول انتخابی شما تعریف نشده است.",
      };
    }

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

    if (coupon.validFrom) {
      const fromTimestamp = normalizeDateToTimestamp(coupon.validFrom);
      if (todayTimestamp < fromTimestamp) {
        return {
          success: false,
          error: "زمان فعال‌سازی این کد تخفیف هنوز فرا نرسیده است.",
        };
      }
    }
    if (coupon.validTo) {
      const toTimestamp = normalizeDateToTimestamp(coupon.validTo);
      if (todayTimestamp > toTimestamp) {
        return {
          success: false,
          error: "اعتبار این کد تخفیف به پایان رسیده است.",
        };
      }
    }

    if (securePhone) {
      const usages = getCouponUsages();
      const alreadyUsed = usages.some(
        (u) => u.couponId === coupon.id && u.phone === securePhone,
      );
      if (alreadyUsed) {
        return {
          success: false,
          error: "شما قبلاً از این کد تخفیف استفاده کرده‌اید.",
        };
      }
    }

    const product = getProductWithPricing(productId);
    if (!product) {
      return { success: false, error: "محصول مورد نظر یافت نشد." };
    }

    const blendProfile = getBlendProfile(blend);
    const { MOCK_COUPONS, MOCK_COUPON_USAGES } = await import("@/lib/mock-db");

    const pricingBreakdown = calculateAdvancedPriceMetrics({
      productId,
      pricing: product.pricing,
      blendProfile,
      weightGrams,
      quantity,
      activeCoupons: MOCK_COUPONS,
      appliedUserCouponCode: cleanCode,
      userPhone: securePhone,
      couponUsages: MOCK_COUPON_USAGES,
    });

    if (pricingBreakdown.userCouponDiscountAmount <= 0) {
      return {
        success: false,
        error:
          "امکان اعمال این کد روی سبد خرید شما وجود ندارد. (شاید تخفیف مستقیم یا شرطی بهتری در سبد وجود دارد)",
      };
    }

    return {
      success: true,
      message: "کد تخفیف با موفقیت اعمال گردید.",
      data: {
        couponId: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: pricingBreakdown.userCouponDiscountAmount,
        finalPrice: pricingBreakdown.finalPrice,
        directDiscountAmount: pricingBreakdown.directDiscountAmount,
        conditionalDiscountAmount: pricingBreakdown.conditionalDiscountAmount,
      },
    };
  } catch (error) {
    return { success: false, error: "خطا در پردازش و اعتبارسنجی کد تخفیف." };
  }
}

export async function getCouponsAction() {
  try {
    const { getCoupons } = await import("@/lib/mock-db");
    return { success: true, data: getCoupons() };
  } catch (error) {
    return { success: false, error: "خطا در دریافت لیست تخفیف‌ها." };
  }
}

export async function createCouponAction(
  formData: z.infer<typeof createCouponSchema>,
) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return { success: false, error: "دسترسی غیرمجاز." };
    }

    const validated = createCouponSchema.safeParse(formData);
    if (!validated.success) {
      return {
        success: false,
        error:
          validated.error.issues[0]?.message || "اطلاعات ارسالی معتبر نیست.",
      };
    }

    let finalCode = validated.data.code?.trim().toUpperCase();
    if (!finalCode) {
      if (validated.data.type === "product_direct") {
        finalCode = `DIR-${validated.data.discountValue}${validated.data.discountType === "percentage" ? "PCT" : "TM"}-${Math.floor(100 + Math.random() * 900)}`;
      } else if (validated.data.type === "conditional") {
        finalCode = `COND-${validated.data.minWeightGrams ? validated.data.minWeightGrams / 1000 + "KG" : "VAL"}-${Math.floor(100 + Math.random() * 900)}`;
      } else {
        return {
          success: false,
          error: "وارد کردن کد تخفیف برای تخفیف‌های دستی کاربر الزامی است.",
        };
      }
    }

    const { createCoupon } = await import("@/lib/mock-db");
    const coupon = createCoupon({
      ...validated.data,
      code: finalCode,
    });

    revalidatePath("/");
    revalidatePath("/admin/coupons");

    return {
      success: true,
      data: coupon,
      message: "کد تخفیف با موفقیت در سیستم تعریف شد.",
    };
  } catch (error) {
    return { success: false, error: "خطا در ثبت کد تخفیف جدید." };
  }
}

export async function deleteCouponAction(id: string) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return { success: false, error: "دسترسی غیرمجاز." };
    }

    const { deleteCoupon } = await import("@/lib/mock-db");
    const isDeleted = deleteCoupon(id);

    if (!isDeleted) {
      return { success: false, error: "کد تخفیف مورد نظر یافت نشد." };
    }

    revalidatePath("/");
    revalidatePath("/admin/coupons");

    return {
      success: true,
      data: true,
      message: "کد تخفیف با موفقیت حذف گردید.",
    };
  } catch (error) {
    return { success: false, error: "خطا در حذف کد تخفیف." };
  }
}

export async function toggleCouponStatusAction(id: string) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return { success: false, error: "دسترسی غیرمجاز." };
    }

    const { toggleCouponStatus } = await import("@/lib/mock-db");
    const isToggled = toggleCouponStatus(id);

    if (!isToggled) {
      return { success: false, error: "کد تخفیف یافت نشد." };
    }

    revalidatePath("/");
    revalidatePath("/admin/coupons");

    return {
      success: true,
      data: true,
      message: "وضعیت فعال‌بودن کد تخفیف تغییر یافت.",
    };
  } catch (error) {
    return { success: false, error: "خطا در تغییر وضعیت کد تخفیف." };
  }
}
