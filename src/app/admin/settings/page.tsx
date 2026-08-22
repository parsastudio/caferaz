import React from "react";
import { getSettingsAction } from "@/actions/settings";
import { getMainProductAction } from "@/actions/product";
import { ContentService } from "@/services/content.service";
import AdminSettingsClient from "@/components/features/admin/AdminSettingsClient";

export default async function AdminSettingsPage() {
  const result = await getSettingsAction();
  const productResult = await getMainProductAction();
  const siteContent = await ContentService.getSiteContent();

  const productId =
    productResult.success && productResult.data ? productResult.data.id : "";
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
          productId,
          productName,
          productDescription,
          siteContent,
        }
      : {
          siteSubtitle: "",
          siteFaq: siteContent.faq.items,
          siteFooter: { phones: [], address: "", eitaa: "", website: "" },
          productId,
          productName,
          productDescription,
          siteContent,
        };

  return (
    <div className="space-y-8 text-right" dir="rtl">
      <div>
        <h1 className="text-2xl font-black text-stone-100">
          تنظیمات عمومی و متون پویا
        </h1>
        <p className="text-xs text-stone-400 mt-1">
          پیکربندی هوشمند و پویای تمام بخش‌های لندینگ، اطلاعات تماس فوتر، متون
          هیرو و سوالات متداول
        </p>
      </div>

      <AdminSettingsClient initialSettings={settings} />
    </div>
  );
}
