"use server";

import { ActionResponse } from "@/types/actions";
import { prisma } from "@/lib/prisma";
import {
  getBlendProfile,
  calculateAdvancedPriceMetrics,
} from "@/lib/coffee-calculations";
import { toEnglishDigits } from "@/lib/utils";
import { getCurrentUserAction } from "@/actions/user-auth";
import { mapPrismaCoupon } from "@/lib/coupon-mappers";

export interface ValidatedCouponResult {
  couponId: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  discountAmount: number;
  finalPrice: number;
  directDiscountAmount: number;
  conditionalDiscountAmount: number;
}

export async function validateCouponAction(payload: {
  code: string;
  phone?: string | null;
  productId: string;
  weightGrams: number;
  quantity: number;
  blend: string;
}): Promise<ActionResponse<ValidatedCouponResult>> {
  try {
    const { code, phone, productId, weightGrams, quantity, blend } = payload;

    if (!code) {
      return { success: false, error: "کد تخفیف نمی‌تواند خالی باشد." };
    }

    const cleanCode = code.trim().toUpperCase();
    const cleanPhone = phone ? toEnglishDigits(phone.trim()) : null;

    const currentUserRes = await getCurrentUserAction();
    const securePhone =
      currentUserRes.success && currentUserRes.user
        ? currentUserRes.user.phone
        : cleanPhone;

    const coupon = await prisma.coupon.findFirst({
      where: {
        code: cleanCode,
        deletedAt: null,
      },
    });

    if (!coupon || !coupon.isActive) {
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

    if (securePhone) {
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
          error: "شما قبلاً از این کد تخفیف استفاده کرده‌اید.",
        };
      }
    }

    const productFromDb = await prisma.product.findUnique({
      where: { id: productId },
      include: { pricing: true },
    });
    if (!productFromDb) {
      return { success: false, error: "محصول مورد نظر یافت نشد." };
    }

    const blendProfile = getBlendProfile(blend);
    const activeCouponsFromDb = await prisma.coupon.findMany({
      where: { deletedAt: null },
    });
    const couponUsagesFromDb = await prisma.couponUsage.findMany();

    const pricingBreakdown = calculateAdvancedPriceMetrics({
      productId,
      pricing: productFromDb.pricing,
      blendProfile,
      weightGrams,
      quantity,
      activeCoupons: activeCouponsFromDb.map(mapPrismaCoupon),
      appliedUserCouponCode: cleanCode,
      userPhone: securePhone,
      couponUsages: couponUsagesFromDb.map((u) => ({
        id: u.id,
        couponId: u.couponId,
        phone: u.phone,
        usedAt: u.usedAt.toISOString(),
      })),
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
        discountType: coupon.discountType as "percentage" | "fixed",
        discountValue: coupon.discountValue,
        discountAmount: pricingBreakdown.userCouponDiscountAmount,
        finalPrice: pricingBreakdown.finalPrice,
        directDiscountAmount: pricingBreakdown.directDiscountAmount,
        conditionalDiscountAmount: pricingBreakdown.conditionalDiscountAmount,
      },
    };
  } catch {
    return { success: false, error: "خطا در پردازش و اعتبارسنجی کد تخفیف." };
  }
}
