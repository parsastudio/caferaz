import React from "react";
import { getOrdersAction } from "@/app/actions/order";

export default async function AdminOrdersPage() {
  const ordersResult = await getOrdersAction();
  const orders = ordersResult.success ? ordersResult.data || [] : [];

  return (
    <div className="space-y-8 text-right" dir="rtl">
      <div>
        <h1 className="text-2xl font-black text-stone-100">مدیریت سفارش‌ها</h1>
        <p className="text-xs text-stone-400 mt-1">
          لیست کل سفارش‌های ثبت شده در سیستم
        </p>
      </div>

      {orders.length > 0 ? (
        <div className="border border-stone-800 rounded-2xl overflow-hidden bg-stone-900/10">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-stone-900/80 border-b border-stone-800 text-stone-400 text-xs font-black">
                  <th className="p-4">کد سفارش</th>
                  <th className="p-4">خریدار</th>
                  <th className="p-4">تلفن همراه</th>
                  <th className="p-4">مشخصات فنی</th>
                  <th className="p-4">بسته‌بندی</th>
                  <th className="p-4">مبلغ کل</th>
                  <th className="p-4">وضعیت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800 text-xs text-stone-300 font-bold">
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-stone-900/30 transition-colors"
                  >
                    <td className="p-4 text-gold-500 font-black">{order.id}</td>
                    <td className="p-4">{order.customerName}</td>
                    <td className="p-4" dir="ltr">
                      {order.customerPhone}
                    </td>
                    <td className="p-4 text-stone-400 leading-relaxed max-w-xs">
                      {order.grindType}
                    </td>
                    <td className="p-4">
                      {order.weightGrams} گرم (تعداد: {order.quantity})
                    </td>
                    <td className="p-4 text-stone-200">
                      {order.finalPrice.toLocaleString()} تومان
                    </td>
                    <td className="p-4">
                      {order.status === "completed" ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                          تسویه شد
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] bg-gold-500/10 border border-gold-500/20 text-gold-500 animate-pulse">
                          پرداخت در محل
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 border border-dashed border-stone-800 bg-stone-900/10 rounded-2xl">
          <p className="text-xs text-stone-500">تاکنون سفارشی ثبت نشده است.</p>
        </div>
      )}
    </div>
  );
}
