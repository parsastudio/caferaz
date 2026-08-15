import React from "react";
import Link from "next/link";
import { Coffee, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div
      className="min-h-screen bg-stone-950 flex flex-col justify-center items-center p-6 text-center"
      dir="rtl"
    >
      <div className="w-20 h-20 rounded-3xl bg-gold-500/10 border border-gold-500/20 text-gold-500 flex items-center justify-center text-4xl mb-6 animate-pulse">
        <Coffee className="w-10 h-10" />
      </div>

      <span className="text-sm font-black text-gold-500 tracking-widest uppercase mb-2">
        خطای ۴۰۴
      </span>
      <h1 className="text-2xl md:text-3xl font-black text-stone-100 mb-3">
        صفحه مورد نظر شما پیدا نشد!
      </h1>
      <p className="text-xs md:text-sm text-stone-400 max-w-sm leading-relaxed mb-8">
        آدرسی که به دنبال آن هستید تغییر یافته یا به طور کلی از فروشگاه کافه راز
        حذف شده است.
      </p>

      <Link
        href="/"
        className="bg-gold-500 hover:bg-gold-600 active:scale-95 text-stone-950 font-black px-6 py-3 rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-gold-500/10 cursor-pointer"
      >
        <Home className="w-4 h-4" />
        <span>بازگشت به صفحه اصلی</span>
      </Link>
    </div>
  );
}
