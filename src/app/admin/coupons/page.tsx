import React from "react";
import { getCouponsAction } from "@/actions/coupon";
import { ProductService } from "@/services/product.service";
import AdminCouponsClientList from "@/components/features/admin/coupons/AdminCouponsClientList";

export default async function AdminCouponsPage() {
  const couponsResult = await getCouponsAction();
  const coupons = couponsResult.success ? couponsResult.data || [] : [];
  const products = await ProductService.getAllActiveProducts();

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

      <AdminCouponsClientList initialCoupons={coupons} products={products} />
    </div>
  );
}
