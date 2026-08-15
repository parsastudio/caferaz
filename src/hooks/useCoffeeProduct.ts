import { useMemo } from "react";
import { useCoffeeSelection } from "@/hooks/useCoffeeSelection";
import {
  getBlendProfile,
  calculateAdvancedPriceMetrics,
  calculateRemainingStock,
} from "@/lib/coffee-calculations";
import { Coupon } from "@/types";

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

export function useCoffeeProduct(
  initialProduct: CoffeeProduct,
  activeCoupons: Coupon[],
  serverTodayStr?: string,
) {
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
    return calculateAdvancedPriceMetrics({
      productId: initialProduct.id,
      pricing: initialProduct.pricing,
      blendProfile,
      weightGrams: computedWeight,
      quantity: selection.quantity,
      activeCoupons,
      serverTodayStr,
    });
  }, [
    initialProduct.id,
    initialProduct.pricing,
    blendProfile,
    computedWeight,
    selection.quantity,
    activeCoupons,
    serverTodayStr,
  ]);

  const remainingStockCount = useMemo(() => {
    return calculateRemainingStock(initialProduct.stock_grams, computedWeight);
  }, [initialProduct.stock_grams, computedWeight]);

  const isOutOfStock = selection.quantity > remainingStockCount;

  return {
    ...selection,
    blendProfile,
    computedWeight,
    priceMetrics,
    remainingStockCount,
    isOutOfStock,
  };
}
