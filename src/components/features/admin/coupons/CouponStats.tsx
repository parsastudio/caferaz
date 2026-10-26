import React from "react";
import { Coupon } from "@/domain/types";
import { toPersianDigits } from "@/lib/utils";
import { Ticket, Zap, Key, Percent } from "lucide-react";

interface CouponStatsProps {
  coupons: Coupon[];
}

export default function CouponStats({ coupons }: CouponStatsProps) {
  const totalCoupons = coupons.length;
  const activeCouponsCount = coupons.filter((c) => c.isActive).length;
  const directCouponsCount = coupons.filter(
    (c) => c.type === "product_direct",
  ).length;
  const codeCouponsCount = coupons.filter((c) => c.type === "user_code").length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-stone-900/30 border border-stone-800 p-5 rounded-2xl flex items-center justify-between text-right">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-stone-400 block">
            کل تخفیف‌ها
          </span>
          <span className="text-xl font-black text-stone-100 font-sans">
            {toPersianDigits(totalCoupons)}
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-stone-950 border border-stone-850 flex items-center justify-center text-stone-400">
          <Ticket className="w-4 h-4" strokeWidth={1.5} />
        </div>
      </div>
      <div className="bg-stone-900/30 border border-stone-800 p-5 rounded-2xl flex items-center justify-between text-right">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-stone-400 block">
            کوپن‌های فعال
          </span>
          <span className="text-xl font-black text-emerald-400 font-sans">
            {toPersianDigits(activeCouponsCount)}
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
          <Zap className="w-4 h-4" strokeWidth={1.5} />
        </div>
      </div>
      <div className="bg-stone-900/30 border border-stone-800 p-5 rounded-2xl flex items-center justify-between text-right">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-stone-400 block">
            کدهای هدیه دستی
          </span>
          <span className="text-xl font-black text-gold-400 font-sans">
            {toPersianDigits(codeCouponsCount)}
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-400">
          <Key className="w-4 h-4" strokeWidth={1.5} />
        </div>
      </div>
      <div className="bg-stone-900/30 border border-stone-800 p-5 rounded-2xl flex items-center justify-between text-right">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-stone-400 block">
            تخفیف‌های خط‌خورده
          </span>
          <span className="text-xl font-black text-stone-100 font-sans">
            {toPersianDigits(directCouponsCount)}
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-stone-950 border border-stone-850 flex items-center justify-center text-stone-400">
          <Percent className="w-4 h-4" strokeWidth={1.5} />
        </div>
      </div>
    </div>
  );
}
