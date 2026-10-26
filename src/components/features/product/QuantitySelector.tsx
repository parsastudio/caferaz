"use client";

import React from "react";
import { Flame } from "lucide-react";
import { useSiteContent } from "@/context/ContentContext";
import { toPersianDigits } from "@/lib/utils";

interface QuantitySelectorProps {
  quantity: number;
  setQuantity: React.Dispatch<React.SetStateAction<number>>;
  remainingStockCount: number;
}

export default function QuantitySelector({
  quantity,
  setQuantity,
  remainingStockCount,
}: QuantitySelectorProps) {
  const { product } = useSiteContent();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-stone-900/25 rounded-xl border border-stone-800/80 shadow-sm">
      <div className="space-y-1">
        <span className="text-xs font-black text-stone-300 block">
          ۴. {product.quantityStepTitle}
        </span>
        {remainingStockCount > 0 && remainingStockCount <= 5 && (
          <span className="text-xs text-amber-400 font-bold flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            {product.stockWarningText}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={quantity <= 1}
          onClick={() => setQuantity((q) => q - 1)}
          className="w-10 h-10 rounded-lg bg-stone-950 border border-stone-800/80 hover:border-stone-700 hover:text-stone-100 flex items-center justify-center font-bold text-lg text-stone-300 disabled:opacity-35 transition-colors cursor-pointer"
        >
          -
        </button>
        <span className="w-10 text-center font-bold text-base text-stone-100 font-sans">
          {toPersianDigits(quantity)}
        </span>
        <button
          type="button"
          disabled={quantity >= remainingStockCount}
          onClick={() => setQuantity((q) => q + 1)}
          className="w-10 h-10 rounded-lg bg-stone-950 border border-stone-800/80 hover:border-stone-700 hover:text-stone-100 flex items-center justify-center font-bold text-lg text-stone-300 disabled:opacity-35 transition-colors cursor-pointer"
        >
          +
        </button>
      </div>
    </div>
  );
}
