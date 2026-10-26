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
} from "@/lib/jalali-converter";
import RoastDateSelector from "@/components/features/admin/pricing/RoastDateSelector";

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

          <RoastDateSelector
            roastDaysAgo={roastDaysAgo}
            setRoastDaysAgo={setRoastDaysAgo}
          />
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
