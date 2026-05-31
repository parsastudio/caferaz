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
