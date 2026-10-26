"use client";

import React from "react";
import { Coffee, Layers, Scale, Sparkles, Flame } from "lucide-react";
import { useSiteContent } from "@/context/ContentContext";
import { formatPersianNumber, toPersianDigits } from "@/lib/utils";

interface OrderSummaryCardProps {
  blend: string;
  grind: string;
  weightGrams: number;
  quantity: number;
  roastInfo?: {
    daysAgo: number;
    formattedDate: string;
    freshnessLabel?: string;
  } | null;
}

export default function OrderSummaryCard({
  blend,
  grind,
  weightGrams,
  quantity,
  roastInfo,
}: OrderSummaryCardProps) {
  const { checkout } = useSiteContent();

  return (
    <div className="bg-stone-950/60 border border-stone-850 p-3.5 rounded-xl space-y-2.5 text-right font-sans">
      <div className="flex items-center justify-between border-b border-stone-850/80 pb-2">
        <span className="text-[11px] font-black text-gold-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-gold-500" />
          {checkout.summaryHeading}
        </span>
        <span className="text-[10px] bg-gold-500/10 text-gold-400 border border-gold-500/20 px-2 py-0.5 rounded-full font-bold">
          {toPersianDigits(quantity)} {checkout.packageCountUnit}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-300 font-bold">
        <div className="flex items-center gap-1.5 truncate">
          <Coffee className="w-3.5 h-3.5 text-stone-500 shrink-0" />
          <span className="truncate">{blend}</span>
        </div>
        <div className="flex items-center gap-1.5 truncate">
          <Layers className="w-3.5 h-3.5 text-stone-500 shrink-0" />
          <span className="truncate">{grind}</span>
        </div>
        <div className="flex items-center gap-1.5 col-span-2 text-stone-400 text-[10px]">
          <Scale className="w-3.5 h-3.5 text-stone-500 shrink-0" />
          <span>
            {checkout.totalWeightLabel}{" "}
            <b className="text-stone-200">
              {formatPersianNumber(weightGrams)} {checkout.packageWeightUnit}
            </b>{" "}
            ({toPersianDigits(((weightGrams * quantity) / 1000).toFixed(1))} کیلوگرم)
          </span>
        </div>
        {roastInfo && (
          <div className="flex items-center gap-1.5 col-span-2 text-[10px] sm:text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
            <Flame className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>
              تضمین تازگی رست: {roastInfo.freshnessLabel} • {toPersianDigits(roastInfo.formattedDate)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
