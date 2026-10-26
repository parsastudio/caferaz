"use client";

import React from "react";
import { Flame, Check, AlertCircle } from "lucide-react";
import { toEnglishDigits, toPersianDigits } from "@/lib/utils";
import {
  calculateGregorianDateFromDaysAgo,
  formatGregorianToJalaliString,
} from "@/lib/date/formatters";

interface RoastDateSelectorProps {
  roastDaysAgo: number | "";
  setRoastDaysAgo: (val: number | "") => void;
}

const presets = [
  { label: "امروز", days: 0 },
  { label: "۳ روز پیش", days: 3 },
  { label: "۱ هفته پیش", days: 7 },
  { label: "۲ هفته پیش", days: 14 },
];

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

  const daysNumber = roastDaysAgo === "" ? null : Number(roastDaysAgo);

  const getFreshnessStatus = (days: number) => {
    if (days === 0) return { label: "رست داغ امروز", isValid: true };
    if (days <= 3) return { label: "فوق‌العاده تازه (کمتر از ۳ روز)", isValid: true };
    if (days <= 7) return { label: "رست تازه هفته جاری", isValid: true };
    if (days <= 21) return { label: "رست تازه کارگاه", isValid: true };
    return { label: "بیش از ۲۱ روز (به خریدار نشان داده نمی‌شود)", isValid: false };
  };

  const status = daysNumber !== null ? getFreshnessStatus(daysNumber) : null;

  return (
    <div className="space-y-3.5 text-right sm:col-span-2 bg-stone-950/40 p-4 rounded-2xl border border-stone-850">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-gold-500" strokeWidth={1.5} />
          <label className="text-xs font-bold text-stone-200">
            تاریخ آخرین برشته‌کاری (رست قهوه)
          </label>
        </div>

        {roastDaysAgo !== "" && (
          <button
            type="button"
            onClick={() => setRoastDaysAgo("")}
            className="text-[11px] text-stone-400 hover:text-red-400 transition-colors font-medium cursor-pointer"
          >
            غیرفعال‌سازی برچسب رست
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {presets.map((item) => (
          <button
            key={item.days}
            type="button"
            onClick={() => setRoastDaysAgo(item.days)}
            className={`text-xs px-3 py-2 rounded-xl border transition-all cursor-pointer font-bold ${
              roastDaysAgo === item.days
                ? "bg-gold-500 text-stone-950 border-gold-500 shadow-sm"
                : "bg-stone-900/90 text-stone-300 border-stone-800 hover:border-stone-700"
            }`}
          >
            {item.label}
          </button>
        ))}

        <div className="flex items-center gap-1.5 bg-stone-900/90 border border-stone-800 px-2.5 py-1.5 rounded-xl">
          <input
            type="text"
            inputMode="numeric"
            value={
              roastDaysAgo === "" ? "" : toPersianDigits(roastDaysAgo.toString())
            }
            onChange={(e) => {
              const clean = toEnglishDigits(e.target.value).replace(/[^0-9]/g, "");
              setRoastDaysAgo(clean === "" ? "" : parseInt(clean, 10));
            }}
            placeholder="دستی"
            className="w-14 text-center bg-stone-950 border border-stone-800 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 rounded-lg py-1 text-xs text-gold-400 outline-none font-bold font-sans"
          />
          <span className="text-[11px] text-stone-400 font-bold">روز پیش</span>
        </div>
      </div>

      {daysNumber !== null && currentJalaliDisplay && status ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-stone-900/40 border border-stone-800 text-xs">
          <div className="flex items-center gap-1.5 text-stone-300">
            <span className="text-stone-400">تاریخ درج‌شده برای خریدار:</span>
            <b className="text-gold-400 font-sans">{toPersianDigits(currentJalaliDisplay)}</b>
          </div>

          <div>
            {status.isValid ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                <Check className="w-3.5 h-3.5" />
                {status.label}
              </span>
            ) : (
              <span className="text-amber-400 font-bold flex items-center gap-1 text-[11px]">
                <AlertCircle className="w-3.5 h-3.5" />
                {status.label}
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="p-2.5 rounded-xl bg-stone-900/20 border border-dashed border-stone-850 text-center text-[11px] text-stone-500">
          تاریخ رستی ثبت نشده است (در صفحه اصلی بدون برچسب نمایش می‌یابد).
        </div>
      )}
    </div>
  );
}
