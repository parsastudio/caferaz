import { getTehranTodayString } from "@/lib/date/formatters";
import { Coupon, CouponUsage } from "@/types";
import { BlendProfile } from "@/lib/constants";

export interface AdvancedPriceMetrics {
  basePrice: number;
  directDiscountAmount: number;
  conditionalDiscountAmount: number;
  userCouponDiscountAmount: number;
  finalPrice: number;
}

function isDateWithinRange(coupon: Coupon, targetDateStr: string): boolean {
  const targetDate = new Date(`${targetDateStr}T12:00:00.000Z`).getTime();

  if (coupon.validFrom) {
    const fromDate = new Date(coupon.validFrom);
    fromDate.setUTCHours(0, 0, 0, 0);
    if (targetDate < fromDate.getTime()) return false;
  }

  if (coupon.validTo) {
    const toDate = new Date(coupon.validTo);
    toDate.setUTCHours(23, 59, 59, 999);
    if (targetDate > toDate.getTime()) return false;
  }

  return true;
}

function calculateDiscountValue(coupon: Coupon, price: number): number {
  if (coupon.discountType === "percentage") {
    const calculated = Math.round((price * coupon.discountValue) / 100);
    return coupon.maxDiscountAmount
      ? Math.min(calculated, coupon.maxDiscountAmount)
      : calculated;
  }
  return coupon.discountValue;
}

export function calculateAdvancedPriceMetrics(params: {
  productId: string;
  pricing: { pricePerKgArabica: number; pricePerKgRobusta: number } | null;
  blendProfile: BlendProfile;
  weightGrams: number;
  quantity: number;
  activeCoupons: Coupon[];
  appliedUserCouponCode?: string | null;
  userPhone?: string | null;
  couponUsages?: CouponUsage[];
  serverTodayStr?: string;
}): AdvancedPriceMetrics {
  const pricing = params.pricing ?? {
    pricePerKgArabica: 2200000,
    pricePerKgRobusta: 1800000,
  };

  const arabicaRatio = params.blendProfile.arabica / 100;
  const robustaRatio = params.blendProfile.robusta / 100;
  const pricePerKg =
    pricing.pricePerKgArabica * arabicaRatio +
    pricing.pricePerKgRobusta * robustaRatio;

  const basePrice = Math.round(
    (pricePerKg * params.weightGrams * params.quantity) / 1000,
  );
  const targetDateStr = params.serverTodayStr ?? getTehranTodayString();

  const directDiscount = params.activeCoupons
    .filter(
      (c) =>
        c.isActive &&
        !c.deletedAt &&
        c.type === "product_direct" &&
        (!c.productId || c.productId === params.productId) &&
        isDateWithinRange(c, targetDateStr),
    )
    .reduce((max, c) => Math.max(max, calculateDiscountValue(c, basePrice)), 0);

  const conditionalDiscount = params.activeCoupons
    .filter(
      (c) =>
        c.isActive &&
        !c.deletedAt &&
        c.type === "conditional" &&
        (!c.productId || c.productId === params.productId) &&
        (!c.minWeightGrams || params.weightGrams >= c.minWeightGrams) &&
        isDateWithinRange(c, targetDateStr),
    )
    .reduce((max, c) => Math.max(max, calculateDiscountValue(c, basePrice)), 0);

  let userCouponDiscount = 0;
  let allowsStacking = false;

  if (params.appliedUserCouponCode) {
    const searchCode = params.appliedUserCouponCode.trim().toUpperCase();
    const matchedCoupon = params.activeCoupons.find(
      (c) =>
        c.isActive &&
        !c.deletedAt &&
        c.type === "user_code" &&
        c.code.toUpperCase() === searchCode &&
        (!c.productId || c.productId === params.productId) &&
        isDateWithinRange(c, targetDateStr),
    );

    if (matchedCoupon) {
      const isAlreadyUsed =
        params.userPhone &&
        params.couponUsages?.some(
          (u) =>
            u.couponId === matchedCoupon.id &&
            u.phone === params.userPhone?.trim(),
        );

      if (!isAlreadyUsed) {
        userCouponDiscount = calculateDiscountValue(matchedCoupon, basePrice);
        allowsStacking = Boolean(matchedCoupon.allowStacking);
      }
    }
  }

  let finalDirect = 0;
  let finalConditional = 0;
  let finalUser = 0;

  if (allowsStacking) {
    finalUser = userCouponDiscount;
    if (directDiscount >= conditionalDiscount) {
      finalDirect = directDiscount;
    } else {
      finalConditional = conditionalDiscount;
    }
  } else {
    const highestDiscount = Math.max(
      directDiscount,
      conditionalDiscount,
      userCouponDiscount,
    );

    if (highestDiscount === userCouponDiscount && userCouponDiscount > 0) {
      finalUser = userCouponDiscount;
    } else if (highestDiscount === directDiscount && directDiscount > 0) {
      finalDirect = directDiscount;
    } else if (
      highestDiscount === conditionalDiscount &&
      conditionalDiscount > 0
    ) {
      finalConditional = conditionalDiscount;
    }
  }

  const totalDiscount = Math.min(
    finalDirect + finalConditional + finalUser,
    basePrice,
  );
  const finalPrice = Math.max(0, basePrice - totalDiscount);

  return {
    basePrice,
    directDiscountAmount: finalDirect,
    conditionalDiscountAmount: finalConditional,
    userCouponDiscountAmount: finalUser,
    finalPrice,
  };
}
