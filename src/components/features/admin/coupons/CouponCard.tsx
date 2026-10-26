import React from "react";
import { Coupon } from "@/domain/types";
import { Badge } from "@/components/ui/badge";
import {
  Trash,
  ToggleLeft,
  ToggleRight,
  Calendar,
  Scale,
  DollarSign,
} from "lucide-react";
import {
  formatGregorianToJalaliString,
  getTehranTodayString,
} from "@/lib/date/formatters";
import { formatPersianNumber, toPersianDigits } from "@/lib/utils";

interface CouponCardProps {
  coupon: Coupon;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function CouponCard({
  coupon,
  onToggleStatus,
  onDelete,
}: CouponCardProps) {
  const tehranTodayStr = getTehranTodayString();
  const tehranTodayTimestamp = new Date(
    `${tehranTodayStr}T12:00:00.000Z`,
  ).getTime();
  const isExpired = coupon.validTo
    ? tehranTodayTimestamp >
      new Date(coupon.validTo).setUTCHours(23, 59, 59, 999)
    : false;

  return (
    <div
      className={`relative bg-stone-900/40 border border-stone-800 rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-300 ${
        coupon.isActive && !isExpired
          ? "hover:border-gold-500/40"
          : "opacity-60"
      }`}
    >
      <div className="absolute top-1/2 -left-3.5 w-7 h-7 bg-stone-950 border border-stone-800 rounded-full z-10 -translate-y-1/2" />
      <div className="absolute top-1/2 -right-3.5 w-7 h-7 bg-stone-950 border border-stone-800 rounded-full z-10 -translate-y-1/2" />

      <div className="p-5 space-y-3 pb-4">
        <div className="flex items-center justify-between">
          <Badge
            className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
              coupon.type === "product_direct"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : coupon.type === "conditional"
                  ? "bg-sky-500/10 text-sky-400 border-sky-500/20"
                  : "bg-gold-500/10 text-gold-400 border-gold-500/20"
            }`}
          >
            {coupon.type === "product_direct" && "تخفیف مستقیم کالا"}
            {coupon.type === "conditional" && "تخفیف شرطی سیستمی"}
            {coupon.type === "user_code" && "کوپن دستی خریدار"}
          </Badge>

          <div className="flex items-center gap-1.5">
            {isExpired ? (
              <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-[9px]">
                منقضی شده
              </Badge>
            ) : coupon.isActive ? (
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px]">
                فعال
              </Badge>
            ) : (
              <Badge className="bg-stone-500/10 text-stone-400 border-stone-500/20 text-[9px]">
                غیرفعال
              </Badge>
            )}
          </div>
        </div>

        <div className="text-right">
          <span className="text-lg font-black tracking-widest text-gold-500 font-sans">
            {coupon.code}
          </span>
        </div>

        <div className="text-right font-black text-2xl text-stone-100 font-sans">
          {coupon.discountType === "percentage" ? (
            <span>{toPersianDigits(coupon.discountValue)}٪ تخفیف</span>
          ) : (
            <span>{formatPersianNumber(coupon.discountValue)} تومان</span>
          )}
        </div>
      </div>

      <div className="border-t border-dashed border-stone-800 mx-4" />

      <div className="p-5 pt-4 space-y-4">
        <div className="space-y-1.5 text-xs text-stone-400">
          {coupon.minWeightGrams && coupon.minWeightGrams > 0 ? (
            <p className="flex items-center gap-1">
              <Scale className="w-3.5 h-3.5 text-stone-600" />
              <span>
                حداقل وزن خرید:{" "}
                <b>{formatPersianNumber(coupon.minWeightGrams / 1000)} کیلوگرم</b>
              </span>
            </p>
          ) : null}

          {coupon.maxDiscountAmount && coupon.maxDiscountAmount > 0 ? (
            <p className="flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-stone-600" />
              <span>
                سقف تخفیف:{" "}
                <b>{formatPersianNumber(coupon.maxDiscountAmount)} تومان</b>
              </span>
            </p>
          ) : null}

          {coupon.validTo ? (
            <p className="flex items-center gap-1 font-sans text-[11px]">
              <Calendar className="w-3.5 h-3.5 text-stone-600" />
              <span>
                معتبر تا: {toPersianDigits(formatGregorianToJalaliString(coupon.validTo))}
              </span>
            </p>
          ) : (
            <p className="flex items-center gap-1 text-[11px]">
              <Calendar className="w-3.5 h-3.5 text-stone-600" />
              <span>بدون محدودیت زمانی</span>
            </p>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-stone-850 pt-3">
          <button
            onClick={() => onToggleStatus(coupon.id)}
            className="text-stone-400 hover:text-stone-200 transition-colors flex items-center gap-1.5 cursor-pointer text-xs font-bold"
          >
            {coupon.isActive ? (
              <>
                <ToggleRight className="w-5 h-5 text-emerald-500" />
                <span>فعال</span>
              </>
            ) : (
              <>
                <ToggleLeft className="w-5 h-5 text-stone-600" />
                <span>غیرفعال</span>
              </>
            )}
          </button>

          <button
            onClick={() => onDelete(coupon.id)}
            className="p-1.5 text-stone-500 hover:text-red-400 hover:bg-red-500/5 rounded-lg border border-stone-850 hover:border-red-500/20 transition-all cursor-pointer"
          >
            <Trash className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
