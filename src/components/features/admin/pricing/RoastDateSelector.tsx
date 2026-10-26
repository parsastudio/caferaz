"use client";

import React from "react";
import { toEnglishDigits, toPersianDigits } from "@/lib/utils";
import {
  calculateGregorianDateFromDaysAgo,
  formatGregorianToJalaliString,
} from "@/lib/date/formatters";

interface RoastDateSelectorProps {
  roastDaysAgo: number | "";
  setRoastDaysAgo: (val: number | "") => void;
}

export default function RoastDateSelector({
  roastDaysAgo,
  setRoastDaysAgo,
}: RoastDateSelectorProps) {
  const currentGregorianDate =
    roastDaysAgo === ""
      ? null
      : calculateGregorianDateFromDaysAgo(Number(roastDaysAgo));

  const currentJalaliDisplay = currentGregorianDate
    ? formatGregorianToJalaliString(currentGregorianDate)
    : null;

  return (
    <div className="space-y-3 text-right sm:col-span-2 bg-stone-950/50 p-4 rounded-2xl border border-stone-800/80">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-stone-200 block">
          آخرین رست چند روز قبل انجام شده است؟
        </label>
        {roastDaysAgo !== "" && (
          <button
            type="button"
            onClick={() => setRoastDaysAgo("")}
            className="text-[11px] text-stone-400 hover:text-red-400 font-bold cursor-pointer"
          >
            حذف تاریخ رست
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          inputMode="numeric"
          value={
            roastDaysAgo === "" ? "" : toPersianDigits(roastDaysAgo.toString())
          }
          onChange={(e) => {
            const clean = toEnglishDigits(e.target.value).replace(
              /[^0-9]/g,
              "",
            );
            setRoastDaysAgo(clean === "" ? "" : parseInt(clean, 10));
          }}
          placeholder="مثال: ۱۴ یا ۰ برای امروز"
          className="w-36 bg-stone-900 border border-stone-800 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 rounded-xl px-4 py-2.5 text-sm text-gold-400 outline-none transition-all font-black text-center font-sans"
        />
        <span className="text-xs text-stone-400 font-bold">روز پیش</span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-[10px] text-stone-500 ml-1">انتخاب سریع:</span>
        {[
          { label: "امروز (۰ روز)", days: 0 },
          { label: "۳ روز پیش", days: 3 },
          { label: "۷ روز پیش (۱ هفته)", days: 7 },
          { label: "۱۴ روز پیش (۲ هفته)", days: 14 },
        ].map((item) => (
          <button
            key={item.days}
            type="button"
            onClick={() => setRoastDaysAgo(item.days)}
            className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer font-bold ${
              roastDaysAgo === item.days
                ? "bg-gold-500 text-stone-950 border-gold-500"
                : "bg-stone-900 text-stone-300 border-stone-800 hover:border-gold-500/30"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {roastDaysAgo !== "" && currentGregorianDate && currentJalaliDisplay && (
        <div className="bg-stone-900/90 border border-gold-500/20 p-3 rounded-xl space-y-1.5 text-xs animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-stone-300">
            <span>تاریخ شمسی محاسبه‌شده:</span>
            <span className="font-sans font-bold text-gold-400">
              {toPersianDigits(currentJalaliDisplay)}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-stone-400">
            <span>تاریخ میلادی ذخیره‌شونده در دیتابیس:</span>
            <span className="font-sans font-medium text-stone-300" dir="ltr">
              {currentGregorianDate}
            </span>
          </div>
          <div className="pt-1 border-t border-stone-800/80">
            {Number(roastDaysAgo) <= 21 ? (
              <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                ✓ در بازه مجاز تازگی (به خریداران در صفحه اصلی و حین سفارش نمایش داده می‌شود).
              </span>
            ) : (
              <span className="text-[11px] text-amber-400 font-bold flex items-center gap-1">
                ⚠️ بیش از ۲۱ روز گذشته است — جهت حفظ پرستیژ فروشگاه، این تاریخ به خریداران نشان داده نمی‌شود.
              </span>
            )}
          </div>
        </div>
      )}
      <span className="text-[10px] text-stone-500 block">
        💡 تنها کافیست تعداد روزهای سپری‌شده را وارد کنید؛ تاریخ دقیق میلادی به صورت خودکار محاسبه شده و در دیتابیس ذخیره می‌گردد.
      </span>
    </div>
  );
}
