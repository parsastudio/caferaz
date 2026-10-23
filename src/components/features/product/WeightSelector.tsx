"use client";

import React from "react";
import { Check } from "lucide-react";
import { useSiteContent } from "@/context/ContentContext";
import { toPersianDigits } from "@/lib/utils";

interface WeightSelectorProps {
  selectedWeight: number;
  setSelectedWeight: (weight: number) => void;
  isCustomWeight: boolean;
  setIsCustomWeight: (custom: boolean) => void;
  customWeightVal: number;
  setCustomWeightVal: (val: number) => void;
  setQuantity: (q: number) => void;
}

const presetWeights = [
  { value: 250, label: "۲۵۰ گرم" },
  { value: 500, label: "۵۰۰ گرم" },
  { value: 1000, label: "۱ کیلوگرم" },
  { value: 2000, label: "۲ کیلوگرم" },
  { value: 5000, label: "۵ کیلوگرم" },
];

export default function WeightSelector({
  selectedWeight,
  setSelectedWeight,
  isCustomWeight,
  setIsCustomWeight,
  customWeightVal,
  setCustomWeightVal,
  setQuantity,
}: WeightSelectorProps) {
  const { product } = useSiteContent();

  return (
    <div className="space-y-3.5">
      <label className="text-sm font-black text-stone-300 flex items-center gap-2">
        <span className="w-5 h-5 rounded-md bg-gold-500/10 border border-gold-500/20 text-gold-500 flex items-center justify-center text-xs font-black">
          ۱
        </span>
        {product.weightStepTitle}
      </label>
      <div className="flex flex-wrap gap-2.5">
        {presetWeights.map((w) => (
          <button
            key={w.value}
            type="button"
            onClick={() => {
              setIsCustomWeight(false);
              setSelectedWeight(w.value);
              setQuantity(1);
            }}
            className={`px-5 py-3 rounded-xl border text-sm font-bold transition-all duration-150 flex items-center gap-2 cursor-pointer ${
              !isCustomWeight && selectedWeight === w.value
                ? "border-gold-500 bg-gold-500/10 text-gold-400 shadow-md"
                : "border-stone-800/80 bg-stone-900/30 hover:border-stone-700 text-stone-400 hover:text-stone-200"
            }`}
          >
            {w.label}
            {!isCustomWeight && selectedWeight === w.value && (
              <Check className="w-4 h-4 text-gold-500" />
            )}
          </button>
        ))}

        <button
          type="button"
          onClick={() => {
            setIsCustomWeight(true);
            setQuantity(1);
          }}
          className={`px-5 py-3 rounded-xl border text-sm font-bold transition-all duration-150 flex items-center gap-2 cursor-pointer ${
            isCustomWeight
              ? "border-gold-500 bg-gold-500/10 text-gold-400 shadow-md"
              : "border-stone-800/80 bg-stone-900/30 hover:border-stone-700 text-stone-400 hover:text-stone-200"
          }`}
        >
          {product.customWeightLabel}
          {isCustomWeight && <Check className="w-4 h-4 text-gold-500" />}
        </button>
      </div>

      {isCustomWeight && (
        <div className="mt-3 p-4 bg-stone-900/40 rounded-2xl border border-stone-800/80 space-y-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
          <label className="text-xs font-bold text-stone-400 block">
            {product.customWeightInputLabel}
          </label>
          <div className="flex items-center gap-3">
            <input
              type="text"
              inputMode="numeric"
              value={customWeightVal === 0 ? "" : customWeightVal.toString()}
              onChange={(e) => {
                const cleanVal = e.target.value.replace(/[^0-9]/g, "");
                const numericVal = parseInt(cleanVal, 10) || 0;
                const finalVal = Math.min(numericVal, 50000);
                setCustomWeightVal(finalVal);
              }}
              onBlur={() => {
                if (customWeightVal < 250) {
                  setCustomWeightVal(250);
                }
              }}
              className="bg-stone-950 border border-stone-800 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 rounded-xl px-4 py-2.5 text-sm text-stone-100 outline-none w-32 text-center font-bold"
            />
            <span className="text-sm font-bold text-stone-300">
              {product.customWeightUnit}
            </span>
            <span className="text-xs text-stone-500 mr-auto">
              ({product.customWeightEquiv} {toPersianDigits((customWeightVal / 1000).toFixed(2))}{" "}
              کیلوگرم)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
