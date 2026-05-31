"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { Button } from "../ui/button";

interface SuccessStepProps {
  firstName: string;
  lastName: string;
  phone: string;
  selectedWeight: number;
  quantity: number;
  finalPrice: number;
  trackingCode: string;
  onClose: () => void;
}

export default function SuccessStep({
  firstName,
  lastName,
  phone,
  selectedWeight,
  quantity,
  finalPrice,
  trackingCode,
  onClose,
}: SuccessStepProps) {
  return (
    <div className="text-center py-6 space-y-5">
      <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center mx-auto text-2xl font-bold animate-bounce">
        ✓
      </div>

      <div className="space-y-1.5">
        <p className="text-lg font-black text-emerald-400">
          سفارش شما با موفقیت ثبت شد!
        </p>
        <p className="text-xs text-stone-400 font-bold flex items-center justify-center gap-1">
          کد پیگیری شبیه‌سازی شده:{" "}
          <span className="text-gold-500 font-black tracking-wider">
            {trackingCode}
          </span>
        </p>
      </div>

      <div className="bg-stone-950/50 p-4 border border-stone-850/80 rounded-2xl max-w-sm mx-auto space-y-3 text-right">
        <span className="text-[10px] text-stone-500 font-black block border-b border-stone-850/80 pb-2 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-gold-500" /> خلاصه فاکتور سفارش
        </span>
        <div className="grid grid-cols-2 gap-y-2 text-xs font-bold text-stone-300">
          <div>تحویل‌گیرنده:</div>
          <div className="text-left text-stone-200">
            {firstName} {lastName}
          </div>
          <div>شماره تماس:</div>
          <div className="text-left text-stone-200">{phone}</div>
          <div>وزن بسته‌بندی:</div>
          <div className="text-left text-stone-200">{selectedWeight} گرم</div>
          <div>تعداد بسته:</div>
          <div className="text-left text-stone-200">{quantity} عدد</div>
          <div>هزینه پرداخت در محل:</div>
          <div className="text-left text-gold-400 font-black">
            {finalPrice.toLocaleString()} تومان
          </div>
        </div>
      </div>

      <p className="text-[11px] text-stone-400 leading-relaxed max-w-xs mx-auto">
        آماده‌سازی، رست تخصصی و بسته‌بندی نهایی قهوه شما بر اساس اولویت‌ها
        شبیه‌سازی شد. به زودی پشتیبانان ما جهت هماهنگی نهایی ارسال با شما تماس
        خواهند گرفت.
      </p>

      <Button
        onClick={onClose}
        className="w-full max-w-xs bg-stone-850 hover:bg-stone-800 text-stone-100 font-bold py-3 rounded-xl cursor-pointer text-xs"
      >
        متوجه شدم، بستن پنجره
      </Button>
    </div>
  );
}
