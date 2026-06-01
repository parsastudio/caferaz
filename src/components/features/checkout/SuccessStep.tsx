"use client";

import React from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "../../ui/button";

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
  const router = useRouter();

  const handleViewProfile = () => {
    onClose();
    router.push("/profile");
    router.refresh();
  };

  return (
    <div className="text-center py-4 space-y-5">
      <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center mx-auto text-2xl font-bold animate-bounce">
        ✓
      </div>

      <div className="space-y-1.5">
        <p className="text-lg font-black text-emerald-400">
          سفارش شما با موفقیت ثبت شد!
        </p>
        <p className="text-xs text-stone-400 font-bold flex items-center justify-center gap-1">
          کد پیگیری سفارش:{" "}
          <span className="text-gold-500 font-black tracking-wider font-sans">
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
          <div className="text-left text-stone-200 font-sans">
            {firstName} {lastName}
          </div>
          <div>شماره تماس:</div>
          <div className="text-left text-stone-200 font-sans">{phone}</div>
          <div>وزن بسته‌بندی:</div>
          <div className="text-left text-stone-200 font-sans">
            {selectedWeight} گرم
          </div>
          <div>تعداد بسته:</div>
          <div className="text-left text-stone-200 font-sans">
            {quantity} عدد
          </div>
          <div>هزینه پرداخت در محل:</div>
          <div className="text-left text-gold-400 font-black font-sans">
            {finalPrice.toLocaleString()} تومان
          </div>
        </div>
      </div>

      <p className="text-[11px] text-stone-400 leading-relaxed max-w-xs mx-auto">
        رست تخصصی و بسته‌بندی نهایی بر اساس ویژگی‌های سفارشی شما با موفقیت ثبت
        گردید. به زودی پشتیبانان ما جهت ارسال بسته با شما تماس خواهند گرفت.
      </p>

      <div className="flex flex-col gap-2 max-w-xs mx-auto pt-2">
        <Button
          onClick={handleViewProfile}
          className="w-full bg-gold-500 hover:bg-gold-600 text-stone-950 font-black py-4 rounded-xl cursor-pointer text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-lg shadow-gold-500/5"
        >
          مشاهده وضعیت آنلاین سفارش در پیشخوان کاربری
          <ArrowRight className="w-4 h-4" />
        </Button>
        <Button
          onClick={onClose}
          variant="ghost"
          className="w-full text-stone-400 hover:text-stone-200 text-[11px] font-bold animate-pulse"
        >
          بستن پنجره سفارش
        </Button>
      </div>
    </div>
  );
}
