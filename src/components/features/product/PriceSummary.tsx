"use client";

import React from "react";
import { ShoppingBag, Percent, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

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
    <div className="relative overflow-hidden p-6 border border-stone-800 bg-stone-900/25 rounded-3xl space-y-4 shadow-xl">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between relative z-10">
        <div className="space-y-0.5 text-right">
          <span className="text-xs font-bold text-stone-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-gold-500" />
            مبلغ قابل پرداخت نهایی:
          </span>
          <span className="text-[10px] text-stone-500 font-medium block">
            همراه با ارسال رایگان و پرداخت در محل
          </span>
        </div>

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
          <motion.div
            key={finalPrice}
            initial={{ scale: 0.95, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-2xl lg:text-3xl font-black text-gold-500 font-sans tracking-tight"
          >
            {finalPrice.toLocaleString()}{" "}
            <span className="text-sm font-bold text-stone-400">تومان</span>
          </motion.div>
        </div>
      </div>

      <Button
        onClick={() => !isOutOfStock && onCheckout()}
        disabled={isOutOfStock}
        className="w-full py-6 text-sm md:text-base font-black rounded-2xl shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99] bg-gold-500 hover:bg-gold-600 text-stone-950 cursor-pointer disabled:bg-stone-800 disabled:text-stone-500 relative z-10"
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
