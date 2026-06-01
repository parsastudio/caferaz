"use client";

import React from "react";
import { Percent, Zap, Coffee, Sparkles } from "lucide-react";
import { CoffeeBlend } from "@/lib/constants";

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
  blends?: CoffeeBlend[];
}

const fallbackBlends: CoffeeBlend[] = [
  {
    value: "۵۰٪ روبوستا / ۵۰٪ عربیکا",
    desc: "ترکیب متعادل، اسیدیته بسیار ملایم، بادی مناسب و عطر دلپذیر روزانه",
    profile: {
      robusta: 50,
      arabica: 50,
      caffeine: 60,
      body: 60,
      aroma: 65,
      label: "بالانس عالی از عطر عربیکا و گیرایی روبوستا",
    },
  },
  {
    value: "۷۰٪ روبوستا / ۳۰٪ عربیکا",
    desc: "کافئین بالا، تنواری سنگین، کرمای ضخیم و تلخی جذاب",
    profile: {
      robusta: 70,
      arabica: 30,
      caffeine: 80,
      body: 80,
      aroma: 45,
      label: "کافئین بالا، غلظت سنگین و تلخی جذاب",
    },
  },
  {
    value: "۳۰٪ روبوستا / ۷۰٪ عربیکا",
    desc: "اسیدیته ملایم رو به بالا، معطر و طعم یاد مرکباتی و شکلاتی",
    profile: {
      robusta: 30,
      arabica: 70,
      caffeine: 45,
      body: 45,
      aroma: 80,
      label: "بسیار خوش‌عطر، ترشی ملایم و طعم یاد مرکباتی",
    },
  },
  {
    value: "۱۰۰٪ روبوستا",
    desc: "بسیار سنگین، خامه ضخیم، کافئین حداکثری و بدون ترشی",
    profile: {
      robusta: 100,
      arabica: 0,
      caffeine: 95,
      body: 95,
      aroma: 25,
      label: "کافئین فوق‌العاده بالا و خامه (کرما) ضخیم",
    },
  },
  {
    value: "۱۰۰٪ عربیکا",
    desc: "بسیار معطر، ترشی ظریف، طعم یاد گلی و میوه‌ای تخصصی",
    profile: {
      robusta: 0,
      arabica: 100,
      caffeine: 25,
      body: 25,
      aroma: 98,
      label: "رایحه گلی بی‌نظیر، اسیدیته شفاف و طعم تخصصی",
    },
  },
];

export default function BlendSelector({
  selectedBlend,
  setSelectedBlend,
  blendProfile,
  blends = [],
}: BlendSelectorProps) {
  const finalBlends = blends.length > 0 ? blends : fallbackBlends;

  return (
    <div className="space-y-4">
      <label className="text-sm font-black text-stone-300 flex items-center gap-2">
        <span className="w-5 h-5 rounded-md bg-gold-500/10 border border-gold-500/20 text-gold-500 flex items-center justify-center text-xs font-black">
          ۲
        </span>
        درصد ترکیب دانه‌ها (بلند):
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {finalBlends.map((blend) => (
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

      <div className="p-4 sm:p-5 bg-stone-900/25 border border-stone-800/60 rounded-2xl space-y-4">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
            <Percent className="w-4 h-4 text-gold-500 shrink-0" />
            شناسنامه طعمی و ویژگی‌های ترکیب
          </span>
          <span className="text-[11px] font-bold text-gold-400 bg-gold-500/10 px-2.5 py-1.5 rounded-full w-fit max-w-full leading-normal">
            {blendProfile.label}
          </span>
        </div>

        <div className="space-y-4">
          <div
            className="h-5 w-full bg-stone-950 rounded-full overflow-hidden flex border border-stone-800 p-[2px]"
            dir="rtl"
          >
            {blendProfile.robusta > 0 && (
              <div
                style={{
                  width: `${blendProfile.robusta}%`,
                }}
                className={`h-full bg-gradient-to-l from-stone-800 to-stone-700 transition-all duration-500 ease-out flex items-center justify-center relative text-center min-w-[50px] ${
                  blendProfile.arabica === 0 ? "rounded-full" : "rounded-r-full"
                }`}
              >
                <span className="text-[9px] font-black text-stone-300 px-1 truncate select-none">
                  {blendProfile.robusta}٪ روبوستا
                </span>
              </div>
            )}
            {blendProfile.arabica > 0 && (
              <div
                style={{
                  width: `${blendProfile.arabica}%`,
                }}
                className={`h-full bg-gradient-to-r from-gold-500 to-gold-400 transition-all duration-500 ease-out flex items-center justify-center relative text-center min-w-[50px] ${
                  blendProfile.robusta === 0 ? "rounded-full" : "rounded-l-full"
                }`}
              >
                <span className="text-[9px] font-black text-stone-950 px-1 truncate select-none">
                  {blendProfile.arabica}٪ عربیکا
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-stone-800/50">
            <div className="space-y-1.5">
              <span className="text-[10px] text-stone-400 font-bold flex items-center justify-between gap-1">
                <span className="flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                  کافئین و انرژی
                </span>
                <span className="text-gold-400 font-black text-[10px]">
                  {blendProfile.caffeine}٪
                </span>
              </span>
              <div className="h-2 w-full bg-stone-950 rounded-full overflow-hidden">
                <div
                  style={{ width: `${blendProfile.caffeine}%` }}
                  className="h-full bg-gold-500 transition-all duration-500 ease-out"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] text-stone-400 font-bold flex items-center justify-between gap-1">
                <span className="flex items-center gap-1">
                  <Coffee className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  غلظت و تنواری (Body)
                </span>
                <span className="text-stone-300 font-black text-[10px]">
                  {blendProfile.body}٪
                </span>
              </span>
              <div className="h-2 w-full bg-stone-950 rounded-full overflow-hidden">
                <div
                  style={{ width: `${blendProfile.body}%` }}
                  className="h-full bg-stone-50 transition-all duration-500 ease-out"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] text-stone-400 font-bold flex items-center justify-between gap-1">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                  اسیدیته و عطر (Aroma)
                </span>
                <span className="text-gold-300 font-black text-[10px]">
                  {blendProfile.aroma}٪
                </span>
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
