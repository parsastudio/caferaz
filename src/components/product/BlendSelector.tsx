"use client";

import React from "react";
import { Percent, Zap, Coffee, Sparkles } from "lucide-react";

interface BlendProfile {
  robusta: number;
  arabica: number;
  caffeine: number;
  body: number;
  aroma: number;
  label: string;
}

interface BlendSelectorProps {
  selectedBlend: string;
  setSelectedBlend: (blend: string) => void;
  blendProfile: BlendProfile;
}

const blendOptions = [
  {
    value: "۵۰٪ روبوستا / ۵۰٪ عربیکا",
    desc: "ترکیب متعادل، اسیدیته بسیار ملایم، بادی مناسب و عطر دلپذیر روزانه",
  },
  {
    value: "۷۰٪ روبوستا / ۳۰٪ عربیکا",
    desc: "کافئین بالا، تنواری سنگین، کرمای ضخیم و تلخی جذاب",
  },
  {
    value: "۳۰٪ روبوستا / ۷۰٪ عربیکا",
    desc: "اسیدیته ملایم رو به بالا، معطر و طعم یاد مرکباتی و شکلاتی",
  },
  {
    value: "۱۰۰٪ روبوستا",
    desc: "بسیار سنگین، خامه ضخیم، کافئین حداکثری و بدون ترشی",
  },
  {
    value: "۱۰۰٪ عربیکا",
    desc: "بسیار معطر، ترشی ظریف، طعم یاد گلی و میوه‌ای تخصصی",
  },
];

export default function BlendSelector({
  selectedBlend,
  setSelectedBlend,
  blendProfile,
}: BlendSelectorProps) {
  return (
    <div className="space-y-4">
      <label className="text-sm font-black text-stone-300 flex items-center gap-2">
        <span className="w-5 h-5 rounded-md bg-gold-500/10 border border-gold-500/20 text-gold-500 flex items-center justify-center text-xs font-black">
          ۲
        </span>
        درصد ترکیب دانه‌ها (بلند):
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {blendOptions.map((blend) => (
          <button
            key={blend.value}
            type="button"
            onClick={() => setSelectedBlend(blend.value)}
            className={`p-4 rounded-2xl border text-right transition-all duration-150 flex flex-col justify-between gap-1.5 cursor-pointer ${
              selectedBlend === blend.value
                ? "border-gold-500 bg-gold-500/5 text-gold-400 shadow-lg"
                : "border-stone-800/80 bg-stone-900/30 hover:border-stone-700 text-stone-300"
            }`}
          >
            <span className="text-xs font-bold block">{blend.value}</span>
            <span className="text-[11px] text-stone-500 leading-normal">
              {blend.desc}
            </span>
          </button>
        ))}
      </div>

      <div className="p-5 bg-stone-900/25 border border-stone-800/60 rounded-2xl space-y-4.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
            <Percent className="w-4 h-4 text-gold-500" />
            شناسنامه طعمی و ویژگی‌های ترکیب
          </span>
          <span className="text-[11px] font-bold text-gold-400 bg-gold-500/10 px-2.5 py-1 rounded-full">
            {blendProfile.label}
          </span>
        </div>

        <div className="space-y-3">
          <div className="h-4.5 w-full bg-stone-950 rounded-full overflow-hidden flex border border-stone-800 p-[2px]">
            <div
              style={{ width: `${blendProfile.robusta}%` }}
              className="h-full bg-gradient-to-l from-stone-800 to-stone-700 rounded-r-full transition-all duration-500 ease-out flex items-center justify-center relative min-w-[20px]"
            >
              {blendProfile.robusta > 0 && (
                <span className="text-[9px] font-black text-stone-300">
                  {blendProfile.robusta}٪ روبوستا
                </span>
              )}
            </div>
            <div
              style={{ width: `${blendProfile.arabica}%` }}
              className="h-full bg-gradient-to-r from-gold-500 to-gold-400 rounded-l-full transition-all duration-500 ease-out flex items-center justify-center relative min-w-[20px]"
            >
              {blendProfile.arabica > 0 && (
                <span className="text-[9px] font-black text-stone-950">
                  {blendProfile.arabica}٪ عربیکا
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-2 border-t border-stone-800/50">
            <div className="space-y-1">
              <span className="text-[10px] text-stone-400 font-bold flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-gold-500" />
                کافئین و انرژی
              </span>
              <div className="h-2 w-full bg-stone-950 rounded-full overflow-hidden">
                <div
                  style={{ width: `${blendProfile.caffeine}%` }}
                  className="h-full bg-gold-500 transition-all duration-500 ease-out"
                />
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-stone-400 font-bold flex items-center gap-1">
                <Coffee className="w-3.5 h-3.5 text-stone-400" />
                غلظت و تنواری (Body)
              </span>
              <div className="h-2 w-full bg-stone-950 rounded-full overflow-hidden">
                <div
                  style={{ width: `${blendProfile.body}%` }}
                  className="h-full bg-stone-50 transition-all duration-500 ease-out"
                />
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-stone-400 font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                اسیدیته و عطر (Aroma)
              </span>
              <div className="h-2 w-full bg-stone-950 rounded-full overflow-hidden">
                <div
                  style={{ width: `${blendProfile.aroma}%` }}
                  className="h-full bg-gold-400 transition-all duration-500 ease-out"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
