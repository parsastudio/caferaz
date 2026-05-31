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

interface CoffeeProductPageProps {
  initialProduct: CoffeeProduct;
  initialComments: UIComment[];
}

export default function CoffeeProductPage({
  initialProduct,
  initialComments,
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
    isCheckoutOpen,
    setIsCheckoutOpen,
    blendProfile,
    computedWeight,
    priceMetrics,
    remainingStockCount,
    isOutOfStock,
  } = useCoffeeProduct(initialProduct);

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
              {initialProduct.description}
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
            finalPrice={priceMetrics.finalPrice}
            isOutOfStock={isOutOfStock}
            onCheckout={() => setIsCheckoutOpen(true)}
          />
        </div>
      </div>

      <ProductTabsSection
        productId={initialProduct.id}
        description={initialProduct.description}
        initialComments={initialComments}
      />

      <CheckoutDialog
        isOpen={isCheckoutOpen}
        onOpenChange={setIsCheckoutOpen}
        productId={initialProduct.id}
        selectedWeight={computedWeight}
        selectedBlend={selectedBlend}
        selectedGrind={selectedGrind}
        quantity={quantity}
        finalPrice={priceMetrics.finalPrice}
      />
    </div>
  );
}
