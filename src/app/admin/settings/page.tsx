import React from "react";
import { getSettingsAction } from "@/actions/settings";
import { getProductAction } from "@/actions/product";
import AdminSettingsClient from "@/components/admin/AdminSettingsClient";

export default async function AdminSettingsPage() {
  const result = await getSettingsAction();
  const productResult = await getProductAction("prod_coffee_bulk_01");

  const productName =
    productResult.success && productResult.data ? productResult.data.name : "";
  const productDescription =
    productResult.success && productResult.data
      ? productResult.data.description
      : "";

  const settings =
    result.success && result.data
      ? {
          ...result.data,
          productName,
          productDescription,
        }
      : {
          siteSubtitle: "",
          siteFaq: [],
          siteFooter: { phones: [], address: "", eitaa: "", website: "" },
          productName,
          productDescription,
        };

  return (
    <div className="space-y-8 text-right" dir="rtl">
      <div>
        <h1 className="text-2xl font-black text-stone-100">
          تنظیمات عمومی و متون پویا
        </h1>
        <p className="text-xs text-stone-400 mt-1">
          پیکربندی هوشمند و پویای تمام بخش‌های لندینگ، اطلاعات تماس فوتر و
          سوالات متداول
        </p>
      </div>

      <AdminSettingsClient initialSettings={settings} />
    </div>
  );
}
