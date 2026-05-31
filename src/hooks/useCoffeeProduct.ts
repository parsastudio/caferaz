import { useMemo } from "react";
import { useCoffeeSelection } from "./useCoffeeSelection";
import {
  getBlendProfile,
  calculatePriceMetrics,
  calculateRemainingStock,
} from "@/lib/coffee-calculations";

export interface ProductPricing {
  pricePerKgArabica: number;
  pricePerKgRobusta: number;
}

export interface CoffeeProduct {
  id: string;
  name: string;
  description: string;
  stock_grams: number;
  pricing: ProductPricing | null;
}

export function useCoffeeProduct(initialProduct: CoffeeProduct) {
  const selection = useCoffeeSelection();

  const blendProfile = useMemo(() => {
    return getBlendProfile(selection.selectedBlend);
  }, [selection.selectedBlend]);

  const computedWeight = useMemo(() => {
    return selection.isCustomWeight
      ? selection.customWeightVal
      : selection.selectedWeight;
  }, [
    selection.isCustomWeight,
    selection.selectedWeight,
    selection.customWeightVal,
  ]);

  const priceMetrics = useMemo(() => {
    return calculatePriceMetrics(
      initialProduct.pricing,
      blendProfile,
      computedWeight,
      selection.quantity,
    );
  }, [
    initialProduct.pricing,
    blendProfile,
    computedWeight,
    selection.quantity,
  ]);

  const remainingStockCount = useMemo(() => {
    return calculateRemainingStock(initialProduct.stock_grams, computedWeight);
  }, [initialProduct.stock_grams, computedWeight]);

  const isOutOfStock = selection.quantity > remainingStockCount;

  const variantDetailsSnapshot = useMemo(() => {
    return `ترکیب: ${selection.selectedBlend} | آسیاب: ${selection.selectedGrind}`;
  }, [selection.selectedBlend, selection.selectedGrind]);

  return {
    ...selection,
    blendProfile,
    computedWeight,
    priceMetrics,
    remainingStockCount,
    isOutOfStock,
    variantDetailsSnapshot,
  };
}
