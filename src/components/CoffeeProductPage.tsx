"use client";

import React from "react";
import { useCoffeeProduct, CoffeeProduct } from "@/hooks/useCoffeeProduct";
import ProductVisuals from "./product/ProductVisuals";
import WeightSelector from "./product/WeightSelector";
import BlendSelector from "./product/BlendSelector";
import GrindSelector from "./product/GrindSelector";
import QuantitySelector from "./product/QuantitySelector";
import PriceSummary from "./product/PriceSummary";
import CheckoutDialog from "./CheckoutDialog";
import ProductTabsSection, { UIComment } from "./ProductTabsSection";
import { useCheckout } from "@/context/CheckoutContext";
import { Coupon } from "@/lib/mock-db";
import { STATIC_BLENDS, STATIC_GRINDS } from "@/lib/constants";

interface CoffeeProductPageProps {
  initialProduct: CoffeeProduct;
  initialComments: UIComment[];
  activeCoupons: Coupon[];
  siteSubtitle?: string;
}

export default function CoffeeProductPage({
  initialProduct,
  initialComments,
  activeCoupons,
  siteSubtitle,
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
  } = useCoffeeProduct(initialProduct, activeCoupons);

  const { openCheckout } = useCheckout();

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
            blends={STATIC_BLENDS}
          />

          <GrindSelector
            selectedGrind={selectedGrind}
            setSelectedGrind={setSelectedGrind}
            grinds={STATIC_GRINDS}
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
            onCheckout={() =>
              openCheckout({
                productId: initialProduct.id,
                selectedWeight: computedWeight,
                selectedBlend,
                selectedGrind,
                quantity,
                finalPrice: priceMetrics.finalPrice,
              })
            }
          />
        </div>
      </div>

      <ProductTabsSection
        productId={initialProduct.id}
        description={siteSubtitle || initialProduct.description}
        initialComments={initialComments}
      />

      <CheckoutDialog />
    </div>
  );
}
  