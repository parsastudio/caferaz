"use client";

import React, { useState } from "react";
import { updateProductDetailsAction } from "@/app/actions/product";
import { ProductWithPricing } from "@/lib/mock-db";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";

interface AdminPricingFormProps {
  initialProduct: ProductWithPricing;
}

export default function AdminPricingForm({
  initialProduct,
}: AdminPricingFormProps) {
  const [name, setName] = useState(initialProduct.name || "");
  const [description, setDescription] = useState(
    initialProduct.description || "",
  );

  const [arabicaRaw, setArabicaRaw] = useState<number>(
    initialProduct.pricing?.pricePerKgArabica || 2200000,
  );
  const [robustaRaw, setRobustaRaw] = useState<number>(
    initialProduct.pricing?.pricePerKgRobusta || 1800000,
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
    if (
      !name.trim() ||
      !description.trim() ||
      arabicaRaw <= 0 ||
      robustaRaw <= 0
    ) {
      toast.error("لطفاً تمامی فیلدها را با مقادیر معتبر تکمیل کنید.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await updateProductDetailsAction({
        productId: initialProduct.id,
        name,
        description,
        pricePerKgArabica: arabicaRaw,
        pricePerKgRobusta: robustaRaw,
      });

      if (result.success) {
        toast.success("تنظیمات و قیمت‌ها با موفقیت به‌روزرسانی شدند.");
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
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-xs font-bold text-stone-300 block">
            نام تجاری و عنوان کالا:
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-stone-950 border border-stone-800 focus:border-gold-500 focus:ring-1 rounded-xl px-4 py-3 text-sm text-stone-100 outline-none transition-all font-bold"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-stone-300 block">
            توضیحات تخصصی و معرفی محصول:
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-stone-950 border border-stone-800 focus:border-gold-500 focus:ring-1 rounded-xl px-4 py-3 text-sm text-stone-100 outline-none transition-all resize-none leading-relaxed"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
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

          <div className="space-y-2">
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
              "ثبت نهایی و به‌روزرسانی کل کالا"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
