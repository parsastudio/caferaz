"use client";

import React from "react";
import { Search, X } from "lucide-react";

interface SpotlightSearchHeaderProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  onClearSearch: () => void;
  isFilterActive: boolean;
  matchCount: number;
}

export default function SpotlightSearchHeader({
  searchQuery,
  onSearchChange,
  onClearSearch,
  isFilterActive,
  matchCount,
}: SpotlightSearchHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gold-500/10 border border-gold-500/20 text-gold-500 flex items-center justify-center">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-stone-100">
              جستجوی آنی و فیلتر برچسبی متون
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              عبارت را جستجو کنید یا یکی از برچسب‌های زیر را برای نمایش سریع
              انتخاب فرمایید.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {isFilterActive && (
            <span className="text-xs font-bold text-stone-400 bg-stone-950 px-3 py-1.5 rounded-xl border border-stone-850 font-sans animate-in fade-in duration-150">
              {matchCount} مورد یافت شد
            </span>
          )}
        </div>
      </div>

      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="جستجوی متن یا کلید (مثال: ۰۹۰۰، ارسال سریع، ایتا، قهوه...)"
          className="w-full bg-stone-950 border border-stone-800 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 rounded-2xl pr-11 pl-11 py-3.5 text-xs sm:text-sm text-stone-100 outline-none transition-all font-medium placeholder:text-stone-600"
        />
        <Search className="w-5 h-5 text-stone-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />

        {searchQuery && (
          <button
            onClick={onClearSearch}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-stone-500 hover:text-stone-300 hover:bg-stone-850 rounded-lg cursor-pointer transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
