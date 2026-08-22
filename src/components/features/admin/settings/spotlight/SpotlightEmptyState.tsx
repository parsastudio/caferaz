"use client";

import React from "react";
import { Layers } from "lucide-react";

interface SpotlightEmptyStateProps {
  isFilterActive: boolean;
}

export default function SpotlightEmptyState({
  isFilterActive,
}: SpotlightEmptyStateProps) {
  if (!isFilterActive) {
    return (
      <div className="text-center py-16 border border-dashed border-stone-850/80 bg-stone-900/10 rounded-3xl p-8 space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-gold-500/10 border border-gold-500/20 text-gold-500 flex items-center justify-center mx-auto">
          <Layers className="w-6 h-6" />
        </div>
        <p className="text-sm font-bold text-stone-300">
          برای ویرایش، کلمه مورد نظر را جستجو کنید یا یکی از برچسب‌های بالا را
          انتخاب نمایید.
        </p>
        <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
          با انتخاب هر برچسب، تمامی عبارات و متون مربوط به آن بخش از سایت یکجا
          نمایش داده خواهند شد.
        </p>
      </div>
    );
  }

  return (
    <div className="text-center py-16 border border-dashed border-stone-850 bg-stone-900/10 rounded-3xl p-8 space-y-2">
      <p className="text-xs text-stone-400 font-bold">
        متنی مطابق با فیلتر یا عبارت انتخابی پیدا نشد.
      </p>
      <p className="text-[11px] text-stone-600">
        عبارت جستجو را تغییر دهید یا برچسب دیگری را انتخاب نمایید.
      </p>
    </div>
  );
}
