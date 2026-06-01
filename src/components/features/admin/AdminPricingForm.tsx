"use client";

import React, { useState } from "react";
import { updateProductDetailsAction } from "@/actions/product";
import { ProductWithPricing } from "@/lib/mock-db";
import { toast } from "sonner";
import { Loader2, Sparkles, Coffee } from "lucide-react";

interface AdminPricingFormProps {
  initialProduct: ProductWithPricing;
}

export default function AdminPricingForm({
  initialProduct,
}: AdminPricingFormProps) {
  const [arabicaRaw, setArabicaRaw] = useState<number>(
    initialProduct.pricing?.pricePerKgArabica || 2200000,
  );
  const [robustaRaw, setRobustaRaw] = useState<number>(
    initialProduct.pricing?.pricePerKgRobusta || 1800000,
  );

  const [stockKg, setStockKg] = useState<number>(
    (initialProduct.stock_grams || 150000) / 1000,
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatNumberWithCommas = (value: number) => {
    if (value === 0) return "";
    return value.toLocaleString("en-US");
  };

  const handleNumberChange = (
    rawValue: string,
    setter: React.Dispatch<React.SetStateAction<number>>,
  ) => {
    const cleanValue = rawValue.replace(/[^0-9]/g, "");
    const numericValue = cleanValue === "" ? 0 : parseInt(cleanValue, 10);
    setter(numericValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (arabicaRaw <= 0 || robustaRaw <= 0 || stockKg < 0) {
      toast.error("لطفاً مقادیر قیمت و موجودی معتبر وارد کنید.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await updateProductDetailsAction({
        productId: initialProduct.id,
        pricePerKgArabica: arabicaRaw,
        pricePerKgRobusta: robustaRaw,
        stockGrams: stockKg * 1000,
      });

      if (result.success) {
        toast.success(
          "نرخ‌های پایه و موجودی انبار با موفقیت به‌روزرسانی شدند.",
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
    <div className="bg-stone-900/30 border border-stone-800 p-6 rounded-2xl space-y-6">
      <div className="bg-gold-500/5 border border-gold-500/20 p-4 rounded-xl flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gold-500/10 text-gold-500 flex items-center justify-center text-lg shrink-0">
          <Coffee className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] text-stone-400 block font-bold">
            تغییرات قیمت و موجودی زیر برای کالا اعمال می‌گردد:
          </span>
          <span className="text-sm font-black text-stone-200">
            {initialProduct.name}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2 text-right">
            <label className="text-xs font-bold text-stone-300 block">
              قیمت هر کیلوگرم عربیکا (تومان):
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={formatNumberWithCommas(arabicaRaw)}
              onChange={(e) =>
                handleNumberChange(e.target.value, setArabicaRaw)
              }
              className="w-full bg-stone-950 border border-stone-800 focus:border-gold-500 focus:ring-1 rounded-xl px-4 py-3 text-sm text-gold-400 outline-none transition-all font-bold text-left"
              dir="ltr"
            />
            {arabicaRaw > 0 && (
              <span className="text-[10px] text-stone-500 font-bold flex items-center gap-1 mt-1 pr-1">
                <Sparkles className="w-3 h-3 text-gold-500" />
                معادل:{" "}
                <span className="text-stone-300">
                  {arabicaRaw.toLocaleString("fa-IR")} تومان
                </span>
              </span>
            )}
          </div>

          <div className="space-y-2 text-right">
            <label className="text-xs font-bold text-stone-300 block">
              قیمت هر کیلوگرم روبوستا (تومان):
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={formatNumberWithCommas(robustaRaw)}
              onChange={(e) =>
                handleNumberChange(e.target.value, setRobustaRaw)
              }
              className="w-full bg-stone-950 border border-stone-800 focus:border-gold-500 focus:ring-1 rounded-xl px-4 py-3 text-sm text-gold-400 outline-none transition-all font-bold text-left"
              dir="ltr"
            />
            {robustaRaw > 0 && (
              <span className="text-[10px] text-stone-500 font-bold flex items-center gap-1 mt-1 pr-1">
                <Sparkles className="w-3 h-3 text-gold-500" />
                معادل:{" "}
                <span className="text-stone-300">
                  {robustaRaw.toLocaleString("fa-IR")} تومان
                </span>
              </span>
            )}
          </div>

          <div className="space-y-2 text-right">
            <label className="text-xs font-bold text-stone-300 block">
              موجودی فیزیکی کل انبار (کیلوگرم):
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={formatNumberWithCommas(stockKg)}
              onChange={(e) => handleNumberChange(e.target.value, setStockKg)}
              className="w-full bg-stone-950 border border-stone-800 focus:border-gold-500 focus:ring-1 rounded-xl px-4 py-3 text-sm text-gold-400 outline-none transition-all font-bold text-left"
              dir="ltr"
            />
            {stockKg >= 0 && (
              <span className="text-[10px] text-stone-500 font-bold flex items-center gap-1 mt-1 pr-1">
                <Sparkles className="w-3 h-3 text-gold-500" />
                معادل:{" "}
                <span className="text-stone-300">
                  {(stockKg * 1000).toLocaleString("fa-IR")} گرم قهوه فله
                </span>
              </span>
            )}
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gold-500 hover:bg-gold-600 text-stone-950 font-black py-3 px-6 rounded-xl transition-colors cursor-pointer text-xs flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                در حال ذخیره‌سازی...
              </>
            ) : (
              "به‌روزرسانی نرخ‌ها و موجودی انبار"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
