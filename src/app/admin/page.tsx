import React from "react";
import { getOrdersAction } from "@/actions/admin-order";
import { getAdminCommentsAction } from "@/actions/admin-comment";
import { getMainProductAction } from "@/actions/product";
import { formatPersianNumber, toPersianDigits } from "@/lib/utils";
import {
  TrendingUp,
  Package,
  Clock,
  MessageSquare,
  Coffee,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const ordersResult = await getOrdersAction();
  const productResult = await getMainProductAction();

  const productId =
    productResult.success && productResult.data ? productResult.data.id : "";
  const commentsResult = productId
    ? await getAdminCommentsAction(productId)
    : { success: false, data: [] };

  const orders = ordersResult.success ? ordersResult.data || [] : [];
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(
    (o) => o.status === "unreviewed" || o.status === "pending",
  ).length;

  const totalComments = commentsResult.success
    ? commentsResult.data?.length || 0
    : 0;
  const totalRevenue = ordersResult.success
    ? ordersResult.data
        ?.filter((order) => order.status !== "cancelled")
        .reduce((sum, order) => sum + order.finalPrice, 0) || 0
    : 0;

  return (
    <div className="space-y-8" dir="rtl">
      <div>
        <h1 className="text-2xl font-black text-stone-100">پیشخوان سیستم</h1>
        <p className="text-xs text-stone-400 mt-1">
          خلاصه‌ای از وضعیت کلی فروش و بازخورد مشتریان
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-stone-900/40 border border-stone-800 rounded-2xl p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-stone-400 block">
              کل درآمدهای فروش
            </span>
            <span className="text-lg font-black text-gold-500 block">
              {formatPersianNumber(totalRevenue)}{" "}
              <span className="text-xs">تومان</span>
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center text-gold-500">
            <TrendingUp className="w-5 h-5" strokeWidth={1.5} />
          </div>
        </div>

        <div className="bg-stone-900/40 border border-stone-800 rounded-2xl p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-stone-400 block">
              کل سفارش‌های ثبت‌شده
            </span>
            <span className="text-lg font-black text-stone-100 block">
              {toPersianDigits(totalOrders)} سفارش
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-300">
            <Package className="w-5 h-5" strokeWidth={1.5} />
          </div>
        </div>

        <div className="bg-stone-900/40 border border-gold-500/20 bg-gold-500/5 rounded-2xl p-6 flex items-center justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-1.5 h-full bg-gold-500" />
          <div className="space-y-1">
            <span className="text-xs font-bold text-gold-400 block">
              سفارش‌های در حال انجام
            </span>
            <span className="text-lg font-black text-gold-500 block flex items-center gap-1.5">
              {toPersianDigits(pendingOrders)} مورد
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-500">
            <Clock className="w-5 h-5" strokeWidth={1.5} />
          </div>
        </div>

        <div className="bg-stone-900/40 border border-stone-800 rounded-2xl p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-stone-400 block">
              دیدگاه‌های مشتریان
            </span>
            <span className="text-lg font-black text-stone-100 block">
              {toPersianDigits(totalComments)} دیدگاه
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-300">
            <MessageSquare className="w-5 h-5" strokeWidth={1.5} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-stone-900/20 border border-stone-800/80 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-black text-stone-200">
            جزئیات موجودی انبار قهوه
          </h2>
          {productResult.success && productResult.data && (
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-400">نام تجاری کالا:</span>
                <span className="font-bold text-stone-200">
                  {productResult.data.name}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-400">موجودی فیزیکی کل:</span>
                <span className="font-bold text-gold-400">
                  {toPersianDigits((productResult.data.stockGrams / 1000).toFixed(1))} کیلوگرم
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-400">قیمت مبنای عربیکا:</span>
                <span className="font-bold text-stone-300">
                  {formatPersianNumber(productResult.data.pricing?.pricePerKgArabica ?? 0)}{" "}
                  تومان / کیلوگرم
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-400">قیمت مبنای روبوستا:</span>
                <span className="font-bold text-stone-300">
                  {formatPersianNumber(productResult.data.pricing?.pricePerKgRobusta ?? 0)}{" "}
                  تومان / کیلوگرم
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-stone-900/20 border border-stone-800/80 rounded-2xl p-6 flex flex-col justify-center items-center text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-center text-gold-500">
            <Coffee className="w-6 h-6" strokeWidth={1.5} />
          </div>
          <span className="text-xs font-black text-stone-300">
            سیستم مدیریت یکپارچه
          </span>
          <p className="text-[11px] text-stone-500 max-w-xs leading-relaxed">
            تمامی فرم‌ها، ثبت فاکتورها، تغییر قیمت‌ها و مدیریت دیدگاه‌ها به طور
            مستقیم در پایگاه داده اعمال می‌شوند.
          </p>
        </div>
      </div>
    </div>
  );
}
