"use client";

import React from "react";
import { STATIC_GRINDS, CoffeeGrind } from "@/lib/constants";

interface GrindSelectorProps {
  selectedGrind: string;
  setSelectedGrind: (grind: string) => void;
  grinds?: CoffeeGrind[];
}

export default function GrindSelector({
  selectedGrind,
  setSelectedGrind,
  grinds = STATIC_GRINDS,
}: GrindSelectorProps) {
  return (
    <div className="space-y-3.5">
      <label className="text-sm font-black text-stone-300 flex items-center gap-2">
        <span className="w-5 h-5 rounded-md bg-gold-500/10 border border-gold-500/20 text-gold-500 flex items-center justify-center text-xs font-black">
          ۳
        </span>
        نوع آسیاب دانه قهوه:
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {grinds.map((grind) => (
          <button
            key={grind.value}
            type="button"
            onClick={() => setSelectedGrind(grind.value)}
            className={`p-3.5 rounded-xl border text-right transition-all duration-150 flex flex-col justify-between gap-1 cursor-pointer ${
              selectedGrind === grind.value
                ? "border-gold-500 bg-gold-500/5 text-gold-400 shadow-md"
                : "border-stone-800/80 bg-stone-900/30 hover:border-stone-700 text-stone-300"
            }`}
          >
            <span className="text-xs font-bold block leading-relaxed">
              {grind.value}
            </span>
            <span className="text-[10px] text-stone-500 leading-normal">
              {grind.desc}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
