import React from "react";
import { ContentService } from "@/services/content.service";
import AdminSettingsClient from "@/components/features/admin/AdminSettingsClient";

export default async function AdminSettingsPage() {
  const siteContent = await ContentService.getSiteContent();

  return (
    <div className="space-y-8 text-right max-w-4xl" dir="rtl">
      <div>
        <h1 className="text-2xl font-black text-stone-100">
          مدیریت و ویرایش سریع متون سایت
        </h1>
        <p className="text-xs text-stone-400 mt-1">
          عبارت مورد نظر خود را در باکس زیر جستجو و مستقیماً ویرایش نمایید.
        </p>
      </div>

      <AdminSettingsClient initialSettings={{ siteContent }} />
    </div>
  );
}
