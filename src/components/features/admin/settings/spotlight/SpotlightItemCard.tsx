"use client";

import React from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SpotlightItemCardProps {
  path: string;
  currentValue: string;
  isDirty: boolean;
  isMultiline: boolean;
  isSaving: boolean;
  onChange: (path: string, val: string) => void;
  onSave: (path: string) => void;
}

export default function SpotlightItemCard({
  path,
  currentValue,
  isDirty,
  isMultiline,
  isSaving,
  onChange,
  onSave,
}: SpotlightItemCardProps) {
  return (
    <div
      className={`bg-stone-900/30 border p-4 sm:p-5 rounded-2xl transition-all space-y-3 animate-in fade-in duration-150 ${
        isDirty
          ? "border-gold-500/40 bg-gold-500/5 shadow-lg shadow-gold-500/5"
          : "border-stone-850 hover:border-stone-800"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-850/80 pb-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-[11px] font-bold text-gold-400 font-sans tracking-wide bg-gold-500/10 px-2.5 py-0.5 rounded-lg border border-gold-500/20 w-fit"
            dir="ltr"
          >
            {path}
          </span>

          {isDirty && (
            <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold animate-pulse">
              تغییر ذخیره‌نشده
            </span>
          )}
        </div>

        <span className="text-[10px] text-stone-500 font-medium">
          {path.startsWith("product.")
            ? "مشخصات محصول (پایگاه داده)"
            : "تنظیمات محتوا"}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1">
          {isMultiline ? (
            <textarea
              rows={3}
              value={currentValue}
              onChange={(e) => onChange(path, e.target.value)}
              className={`w-full bg-stone-950 border rounded-xl p-3 text-xs sm:text-sm text-stone-100 outline-none resize-none leading-relaxed transition-all font-medium ${
                isDirty
                  ? "border-gold-500/50 focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
                  : "border-stone-800 focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
              }`}
            />
          ) : (
            <input
              type="text"
              value={currentValue}
              onChange={(e) => onChange(path, e.target.value)}
              className={`w-full bg-stone-950 border rounded-xl px-4 py-2.5 text-xs sm:text-sm text-stone-100 outline-none transition-all font-medium ${
                isDirty
                  ? "border-gold-500/50 focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
                  : "border-stone-800 focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
              }`}
            />
          )}
        </div>

        <Button
          onClick={() => onSave(path)}
          disabled={isSaving || !isDirty}
          className={`font-black px-5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0 self-end sm:self-auto h-10 transition-all ${
            isDirty
              ? "bg-gold-500 hover:bg-gold-600 text-stone-950 shadow-md shadow-gold-500/10"
              : "bg-stone-800 text-stone-400 opacity-60 cursor-not-allowed"
          }`}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              در حال ذخیره...
            </>
          ) : (
            <>
              <Check className="w-3.5 h-3.5" />
              ذخیره تغییر
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
