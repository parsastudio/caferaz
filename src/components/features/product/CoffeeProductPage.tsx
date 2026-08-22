"use client";

import React from "react";
import { useCoffeeProduct } from "@/hooks/useCoffeeProduct";
import ProductVisuals from "@/components/features/product/ProductVisuals";
import WeightSelector from "@/components/features/product/WeightSelector";
import BlendSelector from "@/components/features/product/BlendSelector";
import GrindSelector from "@/components/features/product/GrindSelector";
import QuantitySelector from "@/components/features/product/QuantitySelector";
import PriceSummary from "@/components/features/product/PriceSummary";
import MobileStickyBar from "@/components/features/product/MobileStickyBar";
import CheckoutDialog from "@/components/features/checkout/CheckoutDialog";
import ProductTabsSection, {
  UIComment,
} from "@/components/features/product/ProductTabsSection";
import { useCheckout } from "@/context/CheckoutContext";
import { Coupon, ProductWithPricing } from "@/types";

interface CoffeeProductPageProps {
  initialProduct: ProductWithPricing;
  initialComments: UIComment[];
  activeCoupons: Coupon[];
  siteSubtitle?: string;
  serverTodayStr?: string;
}

export default function CoffeeProductPage({
  initialProduct,
  initialComments,
  activeCoupons,
  siteSubtitle,
  serverTodayStr,
}: CoffeeProductPageProps) {
  const {
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
    blendProfile,
    computedWeight,
    priceMetrics,
    remainingStockCount,
    isOutOfStock,
  } = useCoffeeProduct(initialProduct, activeCoupons, serverTodayStr);

  const { openCheckout } = useCheckout();

  const handleOpenCheckoutModal = () => {
    openCheckout({
      productId: initialProduct.id,
      selectedWeight: computedWeight,
      selectedBlend,
      selectedGrind,
      quantity,
      finalPrice: priceMetrics.finalPrice,
      basePrice: priceMetrics.basePrice,
      directDiscountAmount: priceMetrics.directDiscountAmount,
      conditionalDiscountAmount: priceMetrics.conditionalDiscountAmount,
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12" dir="rtl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-5 space-y-6">
          <ProductVisuals productName={initialProduct.name} />
        </div>

        <div className="lg:col-span-7 space-y-8 lg:pl-2">
          <div>
            <h1 className="text-2xl lg:text-4xl font-black text-stone-100 tracking-tight mb-3">
              {initialProduct.name}
            </h1>
            <p className="text-sm text-stone-400 leading-relaxed max-w-2xl">
              {siteSubtitle || initialProduct.description}
            </p>
          </div>

          <WeightSelector
            selectedWeight={selectedWeight}
            setSelectedWeight={setSelectedWeight}
            isCustomWeight={isCustomWeight}
            setIsCustomWeight={setIsCustomWeight}
            customWeightVal={customWeightVal}
            setCustomWeightVal={setCustomWeightVal}
            setQuantity={setQuantity}
          />

          <BlendSelector
            selectedBlend={selectedBlend}
            setSelectedBlend={setSelectedBlend}
            blendProfile={blendProfile}
          />

          <GrindSelector
            selectedGrind={selectedGrind}
            setSelectedGrind={setSelectedGrind}
          />

          <QuantitySelector
            quantity={quantity}
            setQuantity={setQuantity}
            remainingStockCount={remainingStockCount}
          />

          <PriceSummary
            basePrice={priceMetrics.basePrice}
            finalPrice={priceMetrics.finalPrice}
            isOutOfStock={isOutOfStock}
            onCheckout={handleOpenCheckoutModal}
          />
        </div>
      </div>

      <ProductTabsSection
        productId={initialProduct.id}
        description={siteSubtitle || initialProduct.description}
        initialComments={initialComments}
      />

      <MobileStickyBar
        basePrice={priceMetrics.basePrice}
        finalPrice={priceMetrics.finalPrice}
        isOutOfStock={isOutOfStock}
        onCheckout={handleOpenCheckoutModal}
      />

      <CheckoutDialog />
    </div>
  );
}
