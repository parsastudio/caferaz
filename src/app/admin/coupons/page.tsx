import React from "react";
import { getCouponsAction } from "@/app/actions/coupon";
import AdminCouponsClientList from "@/components/admin/coupons/AdminCouponsClientList";

export default async function AdminCouponsPage() {
  const couponsResult = await getCouponsAction();
  const coupons = couponsResult.success ? couponsResult.data || [] : [];

  return (
    <div className="space-y-8 text-right" dir="rtl">
      <div>
        <h1 className="text-2xl font-black text-stone-100">
          مدیریت هوشمند کوپن‌ها و تخفیف‌ها
        </h1>
        <p className="text-xs text-stone-400 mt-1">
          تعریف انواع تخفیف‌های مستقیم، شرطی (وزن و زمان) و کدهای هدیه دستی
          کاربران
        </p>
      </div>

      <AdminCouponsClientList initialCoupons={coupons} />
    </div>
  );
}
