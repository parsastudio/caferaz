"use client";

import React from "react";
import { MapPin, Check, Truck } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { Button } from "../ui/button";
import { CheckoutFormValues } from "./schema";

interface ShippingStepProps {
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
  finalPrice: number;
}

export default function ShippingStep({
  onSubmit,
  onBack,
  finalPrice,
}: ShippingStepProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext<CheckoutFormValues>();

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5 text-right">
        <label className="text-xs font-bold text-stone-300 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-stone-500" />
          آدرس دقیق محل تحویل <span className="text-red-500">*</span>
        </label>
        <textarea
          {...register("shippingAddress")}
          rows={3}
          className={`w-full bg-stone-950 border focus:ring-1 rounded-xl px-3 py-2.5 text-sm text-stone-100 outline-none transition-all resize-none leading-relaxed text-right ${
            errors.shippingAddress
              ? "border-destructive/60 focus:border-destructive focus:ring-destructive/30"
              : "border-stone-800/80 focus:border-gold-500 focus:ring-gold-500"
          }`}
          placeholder="استان، شهر، خیابان، کوچه، پلاک، واحد..."
        />
        {errors.shippingAddress && (
          <p className="text-[10px] text-destructive font-bold mt-1">
            {errors.shippingAddress.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5 text-right">
        <label className="text-xs font-bold text-stone-300">شیوه پرداخت</label>
        <div className="w-full bg-stone-950 border border-gold-500/50 bg-gold-500/5 rounded-xl px-3 py-2.5 flex items-center justify-between">
          <span className="text-xs font-bold text-gold-400">پرداخت در محل</span>
          <div className="w-4 h-4 rounded-full bg-gold-500 flex items-center justify-center">
            <Check className="w-2.5 h-2.5 text-stone-950 stroke-[3]" />
          </div>
        </div>
      </div>

      <div className="bg-stone-950/40 border border-stone-850 p-3 rounded-xl flex items-start gap-2.5 text-right">
        <Truck className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
        <p className="text-[11px] text-stone-400 leading-relaxed">
          بسته‌های فله کافه راز بلافاصله پس از رست هفتگی و پلمپ با پیک مخصوص
          ارسال شده و وجه آن را درب منزل یا محل کار پرداخت خواهید نمود.
        </p>
      </div>

      <div className="border-t border-stone-850 pt-4 mt-6 flex justify-between items-center">
        <div className="text-right">
          <span className="text-[10px] text-stone-500 block font-bold">
            مبلغ قابل پرداخت:
          </span>
          <span className="text-sm font-black text-gold-500">
            {finalPrice.toLocaleString()} تومان
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            className="text-stone-400 hover:text-stone-200 cursor-pointer text-xs"
          >
            بازگشت
          </Button>
          <Button
            type="submit"
            className="bg-gold-500 hover:bg-gold-600 text-stone-950 font-bold px-5 py-2.5 rounded-xl cursor-pointer"
          >
            دریافت کد تایید
          </Button>
        </div>
      </div>
    </form>
  );
}
