import React from "react";
import Link from "next/link";
import { logoutAdminAction } from "@/actions/admin-auth";
import {
  ShieldCheck,
  MessageSquare,
  ShoppingCart,
  DollarSign,
  LogOut,
  Home,
} from "lucide-react";
import { formatPersianNumber, toPersianDigits } from "@/lib/utils";

interface AdminStatusBarProps {
  monthSales: number;
  pendingOrdersCount: number;
  pendingCommentsCount: number;
}

export default function AdminStatusBar({
  monthSales,
  pendingOrdersCount,
  pendingCommentsCount,
}: AdminStatusBarProps) {
  return (
    <div
      className="w-full bg-stone-900/95 border-b border-gold-500/25 text-stone-200 py-3 px-4 sticky top-0 z-50 backdrop-blur-md transition-all duration-300 shadow-lg shadow-black/20"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 font-sans text-xs">
        <div className="flex flex-col md:hidden w-full gap-2">
          <div className="flex items-center justify-between w-full">
            <Link
              href="/admin"
              className="flex items-center gap-1.5 bg-gold-500/10 hover:bg-gold-500/20 text-gold-400 px-2.5 py-1 rounded-lg border border-gold-500/20 font-black text-xs shrink-0 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-gold-500" />
              <span>پنل مدیریت</span>
            </Link>

            <div className="flex items-center gap-1.5">
              <Link
                href="/"
                className="bg-stone-800/80 hover:bg-stone-750 text-stone-300 border border-stone-800 font-bold px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 text-[11px]"
              >
                <Home className="w-3 h-3 text-stone-400" />
                <span>مشاهده سایت</span>
              </Link>

              <form action={logoutAdminAction} className="inline-block">
                <button
                  type="submit"
                  className="p-1 text-stone-400 hover:text-red-400 rounded-lg border border-stone-800 transition-all cursor-pointer flex items-center justify-center"
                  title="خروج از حساب مدیریت"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>

          <div className="flex items-center justify-between gap-1 w-full pt-1.5 border-t border-stone-800/60 text-[10px]">
            <div className="flex items-center gap-1 text-gold-400 font-sans font-bold">
              <DollarSign className="w-3 h-3 text-gold-500 shrink-0" />
              <span>{formatPersianNumber(monthSales)} ت</span>
            </div>

            <div className="flex items-center gap-1 font-bold">
              <ShoppingCart className="w-3 h-3 text-stone-400 shrink-0" />
              <span className={pendingOrdersCount > 0 ? "text-red-400" : "text-stone-400"}>
                {toPersianDigits(pendingOrdersCount)} سفارش
              </span>
            </div>

            <div className="flex items-center gap-1 font-bold">
              <MessageSquare className="w-3 h-3 text-stone-400 shrink-0" />
              <span className={pendingCommentsCount > 0 ? "text-amber-400" : "text-stone-400"}>
                {toPersianDigits(pendingCommentsCount)} نظر معلق
              </span>
            </div>
          </div>
        </div>

        <div className="hidden md:flex md:flex-row md:items-center md:justify-between w-full">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5 bg-gold-500/10 text-gold-400 px-2.5 py-1 rounded-full border border-gold-500/20 font-black">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>پنل مدیریت کافه راز</span>
            </div>

            <div className="flex items-center gap-4 text-stone-300">
              <div className="flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-gold-500" />
                <span>فروش این ماه:</span>
                <span className="font-sans font-bold text-gold-400">
                  {formatPersianNumber(monthSales)} تومان
                </span>
              </div>

              <div className="flex items-center gap-1">
                <ShoppingCart className="w-3.5 h-3.5 text-stone-500" />
                <span>سفارش جدید:</span>
                <span
                  className={`font-sans font-bold ${
                    pendingOrdersCount > 0
                      ? "text-red-400 animate-pulse"
                      : "text-stone-400"
                  }`}
                >
                  {toPersianDigits(pendingOrdersCount)} مورد
                </span>
              </div>

              <div className="flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-stone-500" />
                <span>نظرات در انتظار:</span>
                <span
                  className={`font-sans font-bold ${
                    pendingCommentsCount > 0
                      ? "text-red-400 animate-pulse"
                      : "text-stone-400"
                  }`}
                >
                  {toPersianDigits(pendingCommentsCount)} مورد
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="bg-stone-800 hover:bg-stone-750 text-stone-300 border border-stone-800 hover:border-stone-700 font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5 text-stone-400" />
              <span>صفحه اصلی</span>
            </Link>

            <Link
              href="/admin"
              className="bg-gold-500 hover:bg-gold-600 text-stone-950 font-black px-4 py-1.5 rounded-lg transition-colors duration-150 shadow shadow-gold-500/10 flex items-center gap-1"
            >
              <span>ورود به پنل ادمین</span>
            </Link>

            <form action={logoutAdminAction} className="inline-block">
              <button
                type="submit"
                className="p-1.5 text-stone-400 hover:text-red-400 hover:bg-red-500/5 rounded-lg border border-stone-800 transition-all cursor-pointer flex items-center justify-center"
                title="خروج از مدیریت"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
