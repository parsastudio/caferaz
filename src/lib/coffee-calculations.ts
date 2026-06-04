import { getTehranTodayString } from "./jalali-converter";
import { Coupon, CouponUsage } from "@/types";
import { STATIC_BLENDS, BlendProfile } from "./constants";

export interface PriceMetrics {
  originalPrice: number;
  finalPrice: number;
}

export interface AdvancedPriceMetrics {
  basePrice: number;
  directDiscountAmount: number;
  conditionalDiscountAmount: number;
  userCouponDiscountAmount: number;
  finalPrice: number;
}

export function getBlendProfile(selectedBlend: string): BlendProfile {
  const found = STATIC_BLENDS.find((b) => b.value === selectedBlend);
  if (found && found.profile) {
    return found.profile;
  }

  return {
    robusta: 50,
    arabica: 50,
    caffeine: 60,
    body: 60,
    aroma: 65,
    label: "بالانس متعادل",
  };
}

export function calculatePriceMetrics(
  pricing: { pricePerKgArabica: number; pricePerKgRobusta: number } | null,
  blendProfile: BlendProfile,
  weight: number,
  quantity: number,
): PriceMetrics {
  const activePricing = pricing || {
    pricePerKgArabica: 2200000,
    pricePerKgRobusta: 1800000,
  };

  const arabicaRatio = blendProfile.arabica / 100;
  const robustaRatio = blendProfile.robusta / 100;

  const pricePerKg =
    activePricing.pricePerKgArabica * arabicaRatio +
    activePricing.pricePerKgRobusta * robustaRatio;

  const pricePerGram = pricePerKg / 1000;
  const finalPrice = Math.round(pricePerGram * weight * quantity);

  return { originalPrice: finalPrice, finalPrice };
}

export function calculateRemainingStock(
  stockGrams: number | undefined,
  weight: number,
): number {
  const stock = stockGrams !== undefined ? stockGrams : 150000;
  return Math.floor(stock / weight);
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
}): AdvancedPriceMetrics {
  const activePricing = params.pricing || {
    pricePerKgArabica: 2200000,
    pricePerKgRobusta: 1800000,
  };

  const arabicaRatio = params.blendProfile.arabica / 100;
  const robustaRatio = params.blendProfile.robusta / 100;

  const pricePerKg =
    activePricing.pricePerKgArabica * arabicaRatio +
    activePricing.pricePerKgRobusta * robustaRatio;

  const pricePerGram = pricePerKg / 1000;
  const basePrice = Math.round(
    pricePerGram * params.weightGrams * params.quantity,
  );

  const tehranTodayStr = getTehranTodayString();

  const normalizeDateToTimestamp = (dateStr: string): number => {
    const normalized = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
    const [year, month, day] = normalized.split(/[-/]/).map(Number);
    return Date.UTC(year, month - 1, day);
  };

  const [ty, tm, td] = tehranTodayStr.split("-").map(Number);
  const todayTimestamp = Date.UTC(ty, tm - 1, td);

  const isCouponDateValid = (coupon: Coupon): boolean => {
    if (coupon.validFrom) {
      const fromTimestamp = normalizeDateToTimestamp(coupon.validFrom);
      if (todayTimestamp < fromTimestamp) return false;
    }
    if (coupon.validTo) {
      const toTimestamp = normalizeDateToTimestamp(coupon.validTo);
      if (todayTimestamp > toTimestamp) return false;
    }
    return true;
  };

  const getStandaloneDiscount = (
    coupon: Coupon,
    originalPrice: number,
  ): number => {
    if (coupon.discountType === "percentage") {
      const val = Math.round((originalPrice * coupon.discountValue) / 100);
      return coupon.maxDiscountAmount
        ? Math.min(val, coupon.maxDiscountAmount)
        : val;
    } else {
      return coupon.discountValue;
    }
  };

  const directCoupons = params.activeCoupons.filter(
    (c) =>
      c.isActive &&
      !c.deletedAt &&
      c.type === "product_direct" &&
      (!c.productId || c.productId === params.productId) &&
      isCouponDateValid(c),
  );

  let bestDirect: Coupon | null = null;
  let directDiscountAmount = 0;
  if (directCoupons.length > 0) {
    directCoupons.forEach((c) => {
      const disc = getStandaloneDiscount(c, basePrice);
      if (disc > directDiscountAmount) {
        directDiscountAmount = disc;
        bestDirect = c;
      }
    });
  }

  const conditionalCoupons = params.activeCoupons.filter((c) => {
    if (!c.isActive || c.deletedAt || c.type !== "conditional") return false;
    if (c.productId && c.productId !== params.productId) return false;
    if (c.minWeightGrams && params.weightGrams < c.minWeightGrams) return false;
    return isCouponDateValid(c);
  });

  let bestConditional: Coupon | null = null;
  let conditionalDiscountAmount = 0;
  if (conditionalCoupons.length > 0) {
    conditionalCoupons.forEach((c) => {
      const disc = getStandaloneDiscount(c, basePrice);
      if (disc > conditionalDiscountAmount) {
        conditionalDiscountAmount = disc;
        bestConditional = c;
      }
    });
  }

  let eligibleUserCoupon: Coupon | null = null;
  let userCouponDiscountAmount = 0;
  if (params.appliedUserCouponCode) {
    const code = params.appliedUserCouponCode.trim().toUpperCase();
    const userCoupon = params.activeCoupons.find(
      (c) =>
        c.isActive &&
        !c.deletedAt &&
        c.type === "user_code" &&
        c.code.toUpperCase() === code &&
        (!c.productId || c.productId === params.productId) &&
        isCouponDateValid(c),
    );

    if (userCoupon) {
      let isUsageValid = true;
      if (params.userPhone && params.couponUsages) {
        const normalizedPhone = params.userPhone.trim();
        const alreadyUsed = params.couponUsages.some(
          (u) => u.couponId === userCoupon.id && u.phone === normalizedPhone,
        );
        if (alreadyUsed) isUsageValid = false;
      }

      if (isUsageValid) {
        eligibleUserCoupon = userCoupon;
        userCouponDiscountAmount = getStandaloneDiscount(userCoupon, basePrice);
      }
    }
  }

  let finalDiscount = 0;
  let finalDirect = 0;
  let finalConditional = 0;
  let finalUser = 0;

  if (eligibleUserCoupon && eligibleUserCoupon.allowStacking) {
    const bestAutoDiscount = Math.max(
      directDiscountAmount,
      conditionalDiscountAmount,
    );
    finalDiscount = userCouponDiscountAmount + bestAutoDiscount;

    finalUser = userCouponDiscountAmount;
    if (bestAutoDiscount > 0) {
      if (directDiscountAmount >= conditionalDiscountAmount) {
        finalDirect = directDiscountAmount;
      } else {
        finalConditional = conditionalDiscountAmount;
      }
    }
  } else {
    finalDiscount = Math.max(
      directDiscountAmount,
      conditionalDiscountAmount,
      userCouponDiscountAmount,
    );

    if (
      finalDiscount === userCouponDiscountAmount &&
      userCouponDiscountAmount > 0
    ) {
      finalUser = userCouponDiscountAmount;
    } else if (
      finalDiscount === directDiscountAmount &&
      directDiscountAmount > 0
    ) {
      finalDirect = directDiscountAmount;
    } else if (
      finalDiscount === conditionalDiscountAmount &&
      conditionalDiscountAmount > 0
    ) {
      finalConditional = conditionalDiscountAmount;
    }
  }

  finalDiscount = Math.min(finalDiscount, basePrice);
  const finalPrice = basePrice - finalDiscount;

  if (finalDiscount === basePrice) {
    const totalAllocated = finalDirect + finalConditional + finalUser;
    if (totalAllocated > 0) {
      finalDirect = Math.round((finalDirect / totalAllocated) * basePrice);
      finalConditional = Math.round(
        (finalConditional / totalAllocated) * basePrice,
      );
      finalUser = basePrice - finalDirect - finalConditional;
    }
  }

  return {
    basePrice,
    directDiscountAmount: finalDirect,
    conditionalDiscountAmount: finalConditional,
    userCouponDiscountAmount: finalUser,
    finalPrice,
  };
}
