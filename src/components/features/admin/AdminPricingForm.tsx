"use client";

import React, { useState } from "react";
import { updateProductDetailsAction } from "@/actions/product";
import { ProductWithPricing } from "@/types";
import { toast } from "sonner";
import { Loader2, Coffee } from "lucide-react";
import { toEnglishDigits, toPersianDigits } from "@/lib/utils";
import { DEFAULT_PRODUCT_PRICING, DEFAULT_STOCK_GRAMS } from "@/lib/constants";
import {
  calculateGregorianDateFromDaysAgo,
  calculateDaysAgoFromGregorian,
  formatGregorianToJalaliString,
} from "@/lib/jalali-converter";

interface AdminPricingFormProps {
  initialProduct: ProductWithPricing;
}

export default function AdminPricingForm({
  initialProduct,
}: AdminPricingFormProps) {
  const [arabicaRaw, setArabicaRaw] = useState<number>(
    initialProduct.pricing?.pricePerKgArabica ||
      DEFAULT_PRODUCT_PRICING.pricePerKgArabica,
  );
  const [robustaRaw, setRobustaRaw] = useState<number>(
    initialProduct.pricing?.pricePerKgRobusta ||
      DEFAULT_PRODUCT_PRICING.pricePerKgRobusta,
  );

  const [stockKg, setStockKg] = useState<number>(
    (initialProduct.stockGrams || DEFAULT_STOCK_GRAMS) / 1000,
  );
  const [deliveryFee, setDeliveryFee] = useState<number>(
    initialProduct.tehranDeliveryFee ?? 70000,
  );

  const initialDaysAgo = calculateDaysAgoFromGregorian(
    initialProduct.lastRoastDate,
  );
  const [roastDaysAgo, setRoastDaysAgo] = useState<number | "">(
    initialDaysAgo !== null && initialDaysAgo >= 0 ? initialDaysAgo : "",
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatPersianNumberWithCommas = (value: number) => {
    if (value === 0) return "";
    return toPersianDigits(value.toLocaleString("en-US"));
  };

  const handleNumberChange = (
    rawValue: string,
    setter: React.Dispatch<React.SetStateAction<number>>,
  ) => {
    const cleanValue = toEnglishDigits(rawValue).replace(/[^0-9]/g, "");
    const numericValue = cleanValue === "" ? 0 : parseInt(cleanValue, 10);
    setter(numericValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (arabicaRaw <= 0 || robustaRaw <= 0 || stockKg < 0 || deliveryFee < 0) {
      toast.error("لطفاً مقادیر قیمت، موجودی و کرایه معتبر وارد کنید.");
      return;
    }

    setIsSubmitting(true);
    try {
      const computedGregorianDate =
        roastDaysAgo === ""
          ? null
          : calculateGregorianDateFromDaysAgo(Number(roastDaysAgo));

      const result = await updateProductDetailsAction({
        productId: initialProduct.id,
        pricePerKgArabica: arabicaRaw,
        pricePerKgRobusta: robustaRaw,
        stockGrams: stockKg * 1000,
        tehranDeliveryFee: deliveryFee,
        lastRoastDate: computedGregorianDate,
      });

      if (result.success) {
        toast.success(
          "نرخ‌های پایه، موجودی انبار، کرایه پیک و تاریخ رست ذخیره شدند.",
        );
      } else {
        toast.error(result.error || "خطا در ثبت تغییرات.");
      }
    } catch {
      toast.error("خطای سیستمی رخ داد.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentGregorianDate =
    roastDaysAgo === ""
      ? null
      : calculateGregorianDateFromDaysAgo(Number(roastDaysAgo));

  const currentJalaliDisplay = currentGregorianDate
    ? formatGregorianToJalaliString(currentGregorianDate)
    : null;

  return (
    <div className="bg-stone-900/30 border border-stone-800 p-6 rounded-3xl space-y-6">
      <div className="bg-gold-500/5 border border-gold-500/20 p-4 rounded-2xl flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gold-500/10 text-gold-500 flex items-center justify-center text-lg shrink-0">
          <Coffee className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] text-stone-400 block font-bold">
            تنظیمات نرخ‌های پایه، موجودی انبار و کرایه پیک:
          </span>
          <span className="text-sm font-black text-stone-200">
            {initialProduct.name}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2 text-right">
            <label className="text-xs font-bold text-stone-300 block">
              قیمت هر کیلوگرم عربیکا (تومان):
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={formatPersianNumberWithCommas(arabicaRaw)}
              onChange={(e) =>
                handleNumberChange(e.target.value, setArabicaRaw)
              }
              className="w-full bg-stone-950 border border-stone-800 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 rounded-2xl px-4 py-3 text-base text-gold-400 outline-none transition-all font-black text-center font-sans"
            />
          </div>

          <div className="space-y-2 text-right">
            <label className="text-xs font-bold text-stone-300 block">
              قیمت هر کیلوگرم روبوستا (تومان):
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={formatPersianNumberWithCommas(robustaRaw)}
              onChange={(e) =>
                handleNumberChange(e.target.value, setRobustaRaw)
              }
              className="w-full bg-stone-950 border border-stone-800 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 rounded-2xl px-4 py-3 text-base text-gold-400 outline-none transition-all font-black text-center font-sans"
            />
          </div>

          <div className="space-y-2 text-right">
            <label className="text-xs font-bold text-stone-300 block">
              موجودی فیزیکی کل انبار (کیلوگرم):
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={formatPersianNumberWithCommas(stockKg)}
              onChange={(e) => handleNumberChange(e.target.value, setStockKg)}
              className="w-full bg-stone-950 border border-stone-800 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 rounded-2xl px-4 py-3 text-base text-gold-400 outline-none transition-all font-black text-center font-sans"
            />
          </div>

          <div className="space-y-2 text-right">
            <label className="text-xs font-bold text-stone-300 block">
              کرایه پیک سایر مناطق تهران (تومان):
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={formatPersianNumberWithCommas(deliveryFee)}
              onChange={(e) =>
                handleNumberChange(e.target.value, setDeliveryFee)
              }
              className="w-full bg-stone-950 border border-stone-800 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 rounded-2xl px-4 py-3 text-base text-gold-400 outline-none transition-all font-black text-center font-sans"
            />
            <span className="text-[10px] text-stone-500 block">
              💡 پیروزی و حکیمیه رایگان بوده و این کرایه ثابت برای سایر مناطق تهران اعمال می‌شود.
            </span>
          </div>

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
                  roastDaysAgo === ""
                    ? ""
                    : toPersianDigits(roastDaysAgo.toString())
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
              <button
                type="button"
                onClick={() => setRoastDaysAgo(0)}
                className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer font-bold ${
                  roastDaysAgo === 0
                    ? "bg-gold-500 text-stone-950 border-gold-500"
                    : "bg-stone-900 text-stone-300 border-stone-800 hover:border-gold-500/30"
                }`}
              >
                امروز (۰ روز)
              </button>
              <button
                type="button"
                onClick={() => setRoastDaysAgo(3)}
                className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer font-bold ${
                  roastDaysAgo === 3
                    ? "bg-gold-500 text-stone-950 border-gold-500"
                    : "bg-stone-900 text-stone-300 border-stone-800 hover:border-gold-500/30"
                }`}
              >
                ۳ روز پیش
              </button>
              <button
                type="button"
                onClick={() => setRoastDaysAgo(7)}
                className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer font-bold ${
                  roastDaysAgo === 7
                    ? "bg-gold-500 text-stone-950 border-gold-500"
                    : "bg-stone-900 text-stone-300 border-stone-800 hover:border-gold-500/30"
                }`}
              >
                ۷ روز پیش (۱ هفته)
              </button>
              <button
                type="button"
                onClick={() => setRoastDaysAgo(14)}
                className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer font-bold ${
                  roastDaysAgo === 14
                    ? "bg-gold-500 text-stone-950 border-gold-500"
                    : "bg-stone-900 text-stone-300 border-stone-800 hover:border-gold-500/30"
                }`}
              >
                ۱۴ روز پیش (۲ هفته)
              </button>
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
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gold-500 hover:bg-gold-600 text-stone-950 font-black py-3.5 px-6 rounded-2xl transition-colors cursor-pointer text-xs flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                در حال ذخیره‌سازی...
              </>
            ) : (
              "به‌روزرسانی نرخ‌ها، موجودی انبار و کرایه پیک"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
