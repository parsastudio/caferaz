import React from "react";
import { getMainProductAction } from "@/actions/product";
import AdminPricingForm from "@/components/features/admin/AdminPricingForm";

export default async function AdminPricingPage() {
  const productResult = await getMainProductAction();

  if (!productResult.success || !productResult.data) {
    return (
      <div className="text-center py-20 text-stone-400" dir="rtl">
        خطا در بارگذاری اطلاعات محصول.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-right" dir="rtl">
      <div>
        <h1 className="text-2xl font-black text-stone-100">
          تنظیمات تخصصی و قیمت‌گذاری
        </h1>
        <p className="text-xs text-stone-400 mt-1">
          به‌روزرسانی مشخصات کالا و نرخ‌های مرجع عربیکا و روبوستا
        </p>
      </div>

      <AdminPricingForm initialProduct={productResult.data} />

      <div className="bg-stone-950/40 p-4 border border-stone-850 rounded-2xl">
        <p className="text-[11px] text-stone-400 leading-relaxed">
          🔒 تغییر این فیلدها بلافاصله مشخصات کالا را در پایگاه داده به‌روزرسانی
          کرده و مشتریان در صفحه اصلی جدیدترین نرخ‌ها را مشاهده خواهند کرد.
        </p>
      </div>
    </div>
  );
}
