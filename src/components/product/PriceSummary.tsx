"use client";

import React from "react";
import { ShoppingBag, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PriceSummaryProps {
  basePrice: number;
  finalPrice: number;
  isOutOfStock: boolean;
  onCheckout: () => void;
}

export default function PriceSummary({
  basePrice,
  finalPrice,
  isOutOfStock,
  onCheckout,
}: PriceSummaryProps) {
  const hasDiscount = finalPrice < basePrice;
  const discountPercent = hasDiscount
    ? Math.round(((basePrice - finalPrice) / basePrice) * 100)
    : 0;

  return (
    <div className="p-6 border border-stone-800 bg-stone-900/20 rounded-3xl space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-stone-400">
          مبلغ قابل پرداخت نهایی:
        </span>
        <div className="text-left flex flex-col items-end gap-1">
          {hasDiscount && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500 line-through font-sans">
                {basePrice.toLocaleString()} تومان
              </span>
              <span className="text-[10px] bg-red-500/10 border border-red-500/20 text-red-400 px-1.5 py-0.5 rounded-md font-bold flex items-center gap-0.5">
                <Percent className="w-2.5 h-2.5" />
                {discountPercent}٪ تخفیف
              </span>
            </div>
          )}
          <div className="text-2xl lg:text-3xl font-black text-gold-500 font-sans">
            {finalPrice.toLocaleString()}{" "}
            <span className="text-sm font-bold text-stone-400">تومان</span>
          </div>
        </div>
      </div>

      <Button
        onClick={() => !isOutOfStock && onCheckout()}
        disabled={isOutOfStock}
        className="w-full py-6 text-md font-bold rounded-2xl shadow-xl transition-all hover:scale-[1.005] active:scale-[0.99] bg-gold-500 hover:bg-gold-600 text-stone-950 cursor-pointer disabled:bg-stone-800 disabled:text-stone-500"
        variant={isOutOfStock ? "secondary" : "default"}
      >
        <ShoppingBag className="w-5 h-5 ml-2" />
        {isOutOfStock
          ? "موجودی انبار برای این وزن و تعداد کافی نیست"
          : "ثبت سفارش و تسویه حساب"}
      </Button>
    </div>
  );
}
