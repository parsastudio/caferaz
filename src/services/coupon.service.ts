import "server-only";
import { prisma } from "@/lib/prisma";
import { Coupon } from "@/domain/types";
import {
  CreateCouponInput,
  ValidateCouponInput,
} from "@/domain/validations/coupon.schema";
import { mapPrismaCoupon } from "@/lib/coupon-mappers";
import {
  getBlendProfile,
  calculateAdvancedPriceMetrics,
} from "@/lib/coffee-calculations";
import { parseJalaliString } from "@/lib/jalali-converter";

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

export class CouponService {
  static async getAllCoupons(): Promise<Coupon[]> {
    const coupons = await prisma.coupon.findMany({
      where: { deletedAt: null },
      orderBy: { id: "desc" },
    });
    return coupons.map(mapPrismaCoupon);
  }

  static async createCoupon(input: CreateCouponInput): Promise<Coupon> {
    let finalCode = input.code?.trim().toUpperCase();
    if (!finalCode) {
      if (input.type === "product_direct") {
        finalCode = `DIR-${input.discountValue}${input.discountType === "percentage" ? "PCT" : "TM"}-${Math.floor(100 + Math.random() * 900)}`;
      } else if (input.type === "conditional") {
        finalCode = `COND-${input.minWeightGrams ? input.minWeightGrams / 1000 + "KG" : "VAL"}-${Math.floor(100 + Math.random() * 900)}`;
      } else {
        throw new Error(
          "وارد کردن کد تخفیف برای تخفیف‌های دستی کاربر الزامی است.",
        );
      }
    }

    let validFromDate: Date | null = null;
    let validToDate: Date | null = null;

    if (input.validFrom && input.validFrom.trim() !== "") {
      const parsed = parseJalaliString(input.validFrom);
      if (parsed) {
        validFromDate = new Date(
          `${parsed.gy}-${String(parsed.gm).padStart(2, "0")}-${String(parsed.gd).padStart(2, "0")}T00:00:00.000Z`,
        );
      }
    }

    if (input.validTo && input.validTo.trim() !== "") {
      const parsed = parseJalaliString(input.validTo);
      if (parsed) {
        validToDate = new Date(
          `${parsed.gy}-${String(parsed.gm).padStart(2, "0")}-${String(parsed.gd).padStart(2, "0")}T23:59:59.999Z`,
        );
      }
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: finalCode,
        type: input.type,
        discountType: input.discountType,
        discountValue: input.discountValue,
        productId: input.productId || null,
        minWeightGrams: input.minWeightGrams || null,
        validFrom: validFromDate,
        validTo: validToDate,
        maxDiscountAmount: input.maxDiscountAmount || null,
        isActive: input.isActive,
        allowStacking: input.allowStacking,
      },
    });

    return mapPrismaCoupon(coupon);
  }

  static async deleteCoupon(id: string): Promise<boolean> {
    await prisma.coupon.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
    return true;
  }

  static async toggleCouponStatus(id: string): Promise<boolean> {
    const existing = await prisma.coupon.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error("کد تخفیف یافت نشد.");
    }

    await prisma.coupon.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });

    return true;
  }

  static async validateUserCoupon(
    input: ValidateCouponInput,
    securePhone: string | null,
  ): Promise<ValidatedCouponResult> {
    const cleanCode = input.code.trim().toUpperCase();

    const coupon = await prisma.coupon.findFirst({
      where: {
        code: cleanCode,
        deletedAt: null,
      },
    });

    if (!coupon || !coupon.isActive) {
      throw new Error("کد تخفیف وارد شده معتبر نیست.");
    }

    if (coupon.type !== "user_code") {
      throw new Error("این کد به عنوان تخفیف سیستمی و خودکار اعمال می‌گردد.");
    }

    if (coupon.productId && coupon.productId !== input.productId) {
      throw new Error("این کد تخفیف برای محصول انتخابی شما تعریف نشده است.");
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
        throw new Error("شما قبلاً از این کد تخفیف استفاده کرده‌اید.");
      }
    }

    const productFromDb = await prisma.product.findUnique({
      where: { id: input.productId },
      include: { pricing: true },
    });

    if (!productFromDb) {
      throw new Error("محصول مورد نظر یافت نشد.");
    }

    const blendProfile = getBlendProfile(input.blend);
    const activeCouponsFromDb = await prisma.coupon.findMany({
      where: { deletedAt: null, isActive: true },
    });
    const couponUsagesFromDb = await prisma.couponUsage.findMany();

    const pricingBreakdown = calculateAdvancedPriceMetrics({
      productId: input.productId,
      pricing: productFromDb.pricing,
      blendProfile,
      weightGrams: input.weightGrams,
      quantity: input.quantity,
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
      throw new Error("امکان اعمال این کد روی سبد خرید شما وجود ندارد.");
    }

    return {
      couponId: coupon.id,
      code: coupon.code,
      discountType: coupon.discountType as "percentage" | "fixed",
      discountValue: coupon.discountValue,
      discountAmount: pricingBreakdown.userCouponDiscountAmount,
      finalPrice: pricingBreakdown.finalPrice,
      directDiscountAmount: pricingBreakdown.directDiscountAmount,
      conditionalDiscountAmount: pricingBreakdown.conditionalDiscountAmount,
    };
  }
}
