import React from "react";
import { getOrdersAction } from "@/actions/order";
import AdminOrdersClientList from "@/components/features/admin/AdminOrdersClientList";

export default async function AdminOrdersPage() {
  const ordersResult = await getOrdersAction();
  const orders = ordersResult.success ? ordersResult.data || [] : [];

  return (
    <div className="space-y-8 text-right" dir="rtl">
      <div>
        <h1 className="text-2xl font-black text-stone-100">
          مدیریت و پیگیری سفارش‌ها
        </h1>
        <p className="text-xs text-stone-400 mt-1">
          پیگیری سفارشات دریافتی و مدیریت وضعیت آماده‌سازی و ارسال قهوه‌های
          سفارشی
        </p>
      </div>

      <AdminOrdersClientList initialOrders={orders} />
    </div>
  );
}
