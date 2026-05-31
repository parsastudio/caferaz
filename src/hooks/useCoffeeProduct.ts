import { useState, useMemo } from "react";

interface ProductPricing {
  pricePerKgArabica: number;
  pricePerKgRobusta: number;
}

interface Product {
  pricing?: ProductPricing;
  stock_grams?: number;
}

export function useCoffeeProduct(initialProduct: Product) {
  const [selectedWeight, setSelectedWeight] = useState<number>(250);
  const [isCustomWeight, setIsCustomWeight] = useState<boolean>(false);
  const [customWeightVal, setCustomWeightVal] = useState<number>(300);
  const [selectedBlend, setSelectedBlend] = useState<string>(
    "۵۰٪ روبوستا / ۵۰٪ عربیکا",
  );
  const [selectedGrind, setSelectedGrind] = useState<string>(
    "دانه کامل (آسیاب نشده)",
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const blendProfile = useMemo(() => {
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
  }, [selectedBlend]);

  const computedWeight = useMemo(() => {
    return isCustomWeight ? customWeightVal : selectedWeight;
  }, [isCustomWeight, selectedWeight, customWeightVal]);

  const priceMetrics = useMemo(() => {
    const pricing = initialProduct.pricing || {
      pricePerKgArabica: 2200000,
      pricePerKgRobusta: 1800000,
    };

    const arabicaRatio = blendProfile.arabica / 100;
    const robustaRatio = blendProfile.robusta / 100;

    const pricePerKg =
      pricing.pricePerKgArabica * arabicaRatio +
      pricing.pricePerKgRobusta * robustaRatio;

    const pricePerGram = pricePerKg / 1000;
    const finalPrice = Math.round(pricePerGram * computedWeight * quantity);

    return { originalPrice: finalPrice, finalPrice };
  }, [initialProduct, blendProfile, computedWeight, quantity]);

  const remainingStockCount = useMemo(() => {
    return Math.floor((initialProduct.stock_grams || 150000) / computedWeight);
  }, [initialProduct.stock_grams, computedWeight]);

  const isOutOfStock = quantity > remainingStockCount;

  const variantDetailsSnapshot = useMemo(() => {
    return `ترکیب: ${selectedBlend} | آسیاب: ${selectedGrind}`;
  }, [selectedBlend, selectedGrind]);

  return {
    selectedWeight,
    setSelectedWeight,
    isCustomWeight,
    setIsCustomWeight,
    customWeightVal,
    setCustomWeightVal,
    selectedBlend,
    setSelectedBlend,
    selectedGrind,
    setSelectedGrind,
    quantity,
    setQuantity,
    isCheckoutOpen,
    setIsCheckoutOpen,
    blendProfile,
    computedWeight,
    priceMetrics,
    remainingStockCount,
    isOutOfStock,
    variantDetailsSnapshot,
  };
}
