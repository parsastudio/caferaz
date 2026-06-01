import { getTehranTodayString } from "./jalali-converter";

export interface BlendProfile {
  robusta: number;
  arabica: number;
  caffeine: number;
  body: number;
  aroma: number;
  label: string;
}

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
  switch (selectedBlend) {
    case "۱۰۰٪ روبوستا":
      return {
        robusta: 100,
        arabica: 0,
        caffeine: 95,
        body: 95,
        aroma: 25,
        label: "کافئین فوق‌العاده بالا و خامه (کرما) ضخیم",
      };
    case "۷۰٪ روبوستا / ۳۰٪ عربیکا":
      return {
        robusta: 70,
        arabica: 30,
        caffeine: 80,
        body: 80,
        aroma: 45,
        label: "کافئین بالا، غلظت سنگین و تلخی جذاب",
      };
    case "۵۰٪ روبوستا / ۵۰٪ عربیکا":
      return {
        robusta: 50,
        arabica: 50,
        caffeine: 60,
        body: 60,
        aroma: 65,
        label: "بالانس عالی از عطر عربیکا و گیرایی روبوستا",
      };
    case "۳۰٪ روبوستا / ۷۰٪ عربیکا":
      return {
        robusta: 30,
        arabica: 70,
        caffeine: 45,
        body: 45,
        aroma: 80,
        label: "بسیار خوش‌عطر، ترشی ملایم و طعم یاد مرکباتی",
      };
    case "۱۰۰٪ عربیکا":
      return {
        robusta: 0,
        arabica: 100,
        caffeine: 25,
        body: 25,
        aroma: 98,
        label: "رایحه گلی بی‌نظیر، اسیدیته شفاف و طعم تخصصی",
      };
    default:
      return {
        robusta: 50,
        arabica: 50,
        caffeine: 60,
        body: 60,
        aroma: 65,
        label: "",
      };
  }
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
  activeCoupons: any[];
  appliedUserCouponCode?: string | null;
  userPhone?: string | null;
  couponUsages?: any[];
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

  // تبدیل تاریخ به زمان محلی تهران برای همگام‌سازی زمان و جلوگیری از تفاوت منطقه زمانی سرورهای ابری
  const normalizeDateToTimestamp = (dateStr: string): number => {
    const normalized = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
    const [year, month, day] = normalized.split(/[-/]/).map(Number);
    return new Date(year, month - 1, day).getTime();
  };

  const [ty, tm, td] = tehranTodayStr.split("-").map(Number);
  const todayTimestamp = new Date(ty, tm - 1, td).getTime();

  const isCouponDateValid = (coupon: any): boolean => {
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
    coupon: any,
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

  // ۱. ارزیابی و انتخاب بهترین کوپن تخفیف مستقیم فعال
  const directCoupons = params.activeCoupons.filter(
    (c) =>
      c.isActive &&
      !c.deletedAt &&
      c.type === "product_direct" &&
      (!c.productId || c.productId === params.productId) &&
      isCouponDateValid(c),
  );

  let bestDirect: any = null;
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

  // ۲. ارزیابی و انتخاب بهترین کوپن تخفیف شرطی فعال (مثلاً حجم خرید)
  const conditionalCoupons = params.activeCoupons.filter((c) => {
    if (!c.isActive || c.deletedAt || c.type !== "conditional") return false;
    if (c.productId && c.productId !== params.productId) return false;
    if (c.minWeightGrams && params.weightGrams < c.minWeightGrams) return false;
    return isCouponDateValid(c);
  });

  let bestConditional: any = null;
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

  // ۳. ارزیابی کوپن کاربر دستی در صورت وجود و مجاز بودن
  let eligibleUserCoupon: any = null;
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

  // ۴. مدیریت همپوشانی افزودنی (Additive) و یا انتخاب بهترین کوپن (Best-value Selector)
  let finalDiscount = 0;
  let finalDirect = 0;
  let finalConditional = 0;
  let finalUser = 0;

  if (eligibleUserCoupon && eligibleUserCoupon.allowStacking) {
    // کوپن همپوشانی دارد: کوپن کاربر + بهترین تخفیف سیستمی موجود به صورت افزایشی (نه مرکب ضربدر هم)
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
    // کوپن همپوشانی ندارد (پیش‌فرض): انتخاب بیشترین تخفیف مستقل تک کوپنی جهت حفظ سود خریدار
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

  // ممانعت از منفی شدن فاکتور
  finalDiscount = Math.min(finalDiscount, basePrice);
  const finalPrice = basePrice - finalDiscount;

  // همسان‌سازی مقادیر سهمی تخفیف در صورت پر شدن سقف فاکتور
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
