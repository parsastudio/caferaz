import { useMemo } from "react";
import { useCoffeeSelection } from "@/hooks/useCoffeeSelection";
import { getBlendProfile } from "@/lib/pricing/blend";
import { calculateAdvancedPriceMetrics } from "@/lib/pricing/discount-engine";
import { calculateRemainingStock } from "@/lib/pricing/stock";
import { Coupon, ProductWithPricing } from "@/domain/types";
import { useSiteContent } from "@/context/ContentContext";

export function useCoffeeProduct(
  initialProduct: ProductWithPricing,
  activeCoupons: Coupon[],
  serverTodayStr?: string,
) {
  const selection = useCoffeeSelection();
  const { product } = useSiteContent();

  const blendProfile = useMemo(() => {
    return getBlendProfile(selection.selectedBlend, product.blends);
  }, [selection.selectedBlend, product.blends]);

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
