"use client";

import React, { memo } from "react";
import { Percent, Zap, Coffee, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { BlendProfile } from "@/lib/constants";
import { useSiteContent } from "@/context/ContentContext";
import { toPersianDigits } from "@/lib/utils";

interface BlendSelectorProps {
  selectedBlend: string;
  setSelectedBlend: (blend: string) => void;
  blendProfile: BlendProfile;
}

function BlendSelectorComponent({
  selectedBlend,
  setSelectedBlend,
  blendProfile,
}: BlendSelectorProps) {
  const { product } = useSiteContent();

  return (
    <div className="space-y-4">
      <label className="text-sm font-black text-stone-300 flex items-center gap-2">
        <span className="w-5 h-5 rounded-md bg-gold-500/10 border border-gold-500/20 text-gold-500 flex items-center justify-center text-xs font-black">
          ۲
        </span>
        {product.blendStepTitle}
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {product.blends.map((blend) => {
          const isSelected = selectedBlend === blend.value;
          return (
            <button
              key={blend.value}
              type="button"
              onClick={() => setSelectedBlend(blend.value)}
              className={`p-3.5 rounded-xl border text-right transition-all duration-200 flex flex-col justify-between gap-1 cursor-pointer relative overflow-hidden ${
                isSelected
                  ? "border-gold-500 bg-gold-500/10 text-gold-400 shadow-sm ring-1 ring-gold-500/25"
                  : "border-stone-800/80 bg-stone-900/30 hover:border-stone-700 text-stone-300"
              }`}
            >
              <span className="text-xs font-bold block z-10">
                {blend.value}
              </span>
              <span className="text-[11px] text-stone-500 leading-normal z-10">
                {blend.desc}
              </span>
              {isSelected && (
                <motion.div
                  layoutId="selected-blend-bg"
                  className="absolute inset-0 bg-gold-500/5 pointer-events-none"
                  transition={{ type: "spring", stiffness: 120, damping: 20 }}
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="p-4 sm:p-5 bg-stone-900/25 border border-stone-800/60 rounded-2xl space-y-4">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
            <Percent className="w-4 h-4 text-gold-500 shrink-0" />
            {product.blendProfileTitle}
          </span>
          <motion.span
            key={blendProfile.label}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="text-[11px] font-bold text-gold-400 bg-gold-500/10 px-2.5 py-1.5 rounded-full w-fit max-w-full leading-normal"
          >
            {blendProfile.label}
          </motion.span>
        </div>

        <div className="space-y-4">
          <div
            className="h-5 w-full bg-stone-950 rounded-full overflow-hidden flex border border-stone-800 p-[2px]"
            dir="rtl"
          >
            {blendProfile.robusta > 0 && (
              <motion.div
                initial={false}
                animate={{ width: `${blendProfile.robusta}%` }}
                transition={{ type: "spring", stiffness: 100, damping: 18 }}
                className={`h-full bg-gradient-to-l from-stone-800 to-stone-700 flex items-center justify-center relative text-center min-w-[50px] ${
                  blendProfile.arabica === 0 ? "rounded-full" : "rounded-r-full"
                }`}
              >
                <span className="text-[9px] font-black text-stone-300 px-1 truncate select-none">
                  {toPersianDigits(blendProfile.robusta)}٪ {product.robustaLabel}
                </span>
              </motion.div>
            )}
            {blendProfile.arabica > 0 && (
              <motion.div
                initial={false}
                animate={{ width: `${blendProfile.arabica}%` }}
                transition={{ type: "spring", stiffness: 100, damping: 18 }}
                className={`h-full bg-gradient-to-r from-gold-500 to-gold-400 flex items-center justify-center relative text-center min-w-[50px] ${
                  blendProfile.robusta === 0 ? "rounded-full" : "rounded-l-full"
                }`}
              >
                <span className="text-[9px] font-black text-stone-950 px-1 truncate select-none">
                  {toPersianDigits(blendProfile.arabica)}٪ {product.arabicaLabel}
                </span>
              </motion.div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-stone-800/50">
            <div className="space-y-1.5">
              <span className="text-[10px] text-stone-400 font-bold flex items-center justify-between gap-1">
                <span className="flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                  {product.caffeineLabel}
                </span>
                <span className="text-gold-400 font-black text-[10px] font-sans">
                  {toPersianDigits(blendProfile.caffeine)}٪
                </span>
              </span>
              <div className="h-2 w-full bg-stone-950 rounded-full overflow-hidden">
                <motion.div
                  initial={false}
                  animate={{ width: `${blendProfile.caffeine}%` }}
                  transition={{ type: "spring", stiffness: 100, damping: 18 }}
                  className="h-full bg-gold-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] text-stone-400 font-bold flex items-center justify-between gap-1">
                <span className="flex items-center gap-1">
                  <Coffee className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  {product.bodyLabel}
                </span>
                <span className="text-stone-300 font-black text-[10px] font-sans">
                  {toPersianDigits(blendProfile.body)}٪
                </span>
              </span>
              <div className="h-2 w-full bg-stone-950 rounded-full overflow-hidden">
                <motion.div
                  initial={false}
                  animate={{ width: `${blendProfile.body}%` }}
                  transition={{ type: "spring", stiffness: 100, damping: 18 }}
                  className="h-full bg-stone-50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] text-stone-400 font-bold flex items-center justify-between gap-1">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                  {product.aromaLabel}
                </span>
                <span className="text-gold-300 font-black text-[10px] font-sans">
                  {toPersianDigits(blendProfile.aroma)}٪
                </span>
              </span>
              <div className="h-2 w-full bg-stone-950 rounded-full overflow-hidden">
                <motion.div
                  initial={false}
                  animate={{ width: `${blendProfile.aroma}%` }}
                  transition={{ type: "spring", stiffness: 100, damping: 18 }}
                  className="h-full bg-gold-400"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(BlendSelectorComponent);
