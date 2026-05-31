import React from "react";
import { getOrdersAction } from "@/app/actions/order";
import { getCommentsAction } from "@/app/actions/comment";
import { getProductAction } from "@/app/actions/product";

export default async function AdminDashboardPage() {
  const ordersResult = await getOrdersAction();
  const commentsResult = await getCommentsAction("prod_coffee_bulk_01");
  const productResult = await getProductAction("prod_coffee_bulk_01");

  const totalOrders = ordersResult.success ? ordersResult.data?.length || 0 : 0;
  const totalComments = commentsResult.success
    ? commentsResult.data?.length || 0
    : 0;
  const totalRevenue = ordersResult.success
    ? ordersResult.data?.reduce((sum, order) => sum + order.finalPrice, 0) || 0
    : 0;

  return (
    <div className="space-y-8" dir="rtl">
      <div>
        <h1 className="text-2xl font-black text-stone-100">پیشخوان سیستم</h1>
        <p className="text-xs text-stone-400 mt-1">
          خلاصه‌ای از وضعیت کلی فروش و بازخورد مشتریان
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-stone-900/40 border border-stone-800 rounded-2xl p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-stone-400 block">
              کل درآمدهای فروش
            </span>
            <span className="text-xl font-black text-gold-500 block">
              {totalRevenue.toLocaleString()}{" "}
              <span className="text-xs">تومان</span>
            </span>
          </div>
          <span className="text-4xl">💰</span>
        </div>

        <div className="bg-stone-900/40 border border-stone-800 rounded-2xl p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-stone-400 block">
              تعداد سفارشات جاری
            </span>
            <span className="text-xl font-black text-stone-100 block">
              {totalOrders} سفارش
            </span>
          </div>
          <span className="text-4xl">📦</span>
        </div>

        <div className="bg-stone-900/40 border border-stone-800 rounded-2xl p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-stone-400 block">
              نظرات کاربران
            </span>
            <span className="text-xl font-black text-stone-100 block">
              {totalComments} دیدگاه
            </span>
          </div>
          <span className="text-4xl">💬</span>
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
                  {(productResult.data.stock_grams / 1000).toFixed(1)} کیلوگرم
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-400">قیمت مبنای عربیکا:</span>
                <span className="font-bold text-stone-300">
                  {productResult.data.pricing?.pricePerKgArabica.toLocaleString()}{" "}
                  تومان / کیلوگرم
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-400">قیمت مبنای روبوستا:</span>
                <span className="font-bold text-stone-300">
                  {productResult.data.pricing?.pricePerKgRobusta.toLocaleString()}{" "}
                  تومان / کیلوگرم
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-stone-900/20 border border-stone-800/80 rounded-2xl p-6 flex flex-col justify-center items-center text-center space-y-3">
          <span className="text-3xl">☕</span>
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
