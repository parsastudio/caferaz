"use client";

import React, { memo } from "react";
import { ShoppingBag, Percent, Sparkles, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useSiteContent } from "@/context/ContentContext";
import { formatPersianNumber, toPersianDigits } from "@/lib/utils";
import { RoastDateDisplayInfo } from "@/lib/date/formatters";

interface PriceSummaryProps {
  basePrice: number;
  finalPrice: number;
  isOutOfStock: boolean;
  onCheckout: () => void;
  roastInfo?: RoastDateDisplayInfo | null;
}

function PriceSummaryComponent({
  basePrice,
  finalPrice,
  isOutOfStock,
  onCheckout,
  roastInfo,
}: PriceSummaryProps) {
  const { product } = useSiteContent();
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
            {product.pricePayableLabel}
          </span>
          <span className="text-[10px] text-stone-500 font-medium block">
            {product.freeShippingSubLabel}
          </span>
        </div>

        <div className="text-left flex flex-col items-end gap-1">
          {hasDiscount && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500 line-through font-sans">
                {formatPersianNumber(basePrice)} {product.currency}
              </span>
              <span className="text-[10px] bg-red-500/10 border border-red-500/20 text-red-400 px-1.5 py-0.5 rounded-md font-bold flex items-center gap-0.5">
                <Percent className="w-2.5 h-2.5" />
                {toPersianDigits(discountPercent)}٪ {product.discountBadge}
              </span>
            </div>
          )}
          <motion.div
            key={finalPrice}
            initial={{ scale: 0.95, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-2xl lg:text-3xl font-black text-gold-500 font-sans tracking-tight"
          >
            {formatPersianNumber(finalPrice)}{" "}
            <span className="text-sm font-bold text-stone-400">
              {product.currency}
            </span>
          </motion.div>
        </div>
      </div>

      {roastInfo && (
        <div className="flex items-center justify-between bg-stone-950/70 border border-gold-500/20 px-3.5 py-2 rounded-xl text-xs text-stone-300 relative z-10 animate-in fade-in duration-200">
          <span className="flex items-center gap-1.5 font-bold text-gold-400">
            <Flame className="w-3.5 h-3.5 text-gold-500 fill-gold-500/20 animate-pulse" />
            {roastInfo.freshnessLabel}
          </span>
          <span className="text-[11px] text-stone-400 font-sans">
            {toPersianDigits(roastInfo.formattedDate)}
          </span>
        </div>
      )}

      <Button
        onClick={() => !isOutOfStock && onCheckout()}
        disabled={isOutOfStock}
        className="w-full py-6 text-sm md:text-base font-black rounded-2xl shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99] bg-gold-500 hover:bg-gold-600 text-stone-950 cursor-pointer disabled:bg-stone-800 disabled:text-stone-500 relative z-10"
        variant={isOutOfStock ? "secondary" : "default"}
      >
        <ShoppingBag className="w-5 h-5 ml-2" />
        {isOutOfStock ? product.outOfStockButton : product.orderCheckoutButton}
      </Button>
    </div>
  );
}

export default memo(PriceSummaryComponent);
