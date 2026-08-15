import { useMemo } from "react";
import { useCoffeeSelection } from "@/hooks/useCoffeeSelection";
import {
  getBlendProfile,
  calculateAdvancedPriceMetrics,
  calculateRemainingStock,
} from "@/lib/coffee-calculations";
import { Coupon, ProductWithPricing } from "@/types";

export function useCoffeeProduct(
  initialProduct: ProductWithPricing,
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
    return calculateRemainingStock(initialProduct.stockGrams, computedWeight);
  }, [initialProduct.stockGrams, computedWeight]);

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
