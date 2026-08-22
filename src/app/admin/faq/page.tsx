import React from "react";
import { FaqService } from "@/services/faq.service";
import AdminFaqClient from "@/components/features/admin/faq/AdminFaqClient";

export default async function AdminFaqPage() {
  const faqs = await FaqService.getAllFaqs();

  return (
    <div className="space-y-8 text-right max-w-4xl" dir="rtl">
      <div>
        <h1 className="text-2xl font-black text-stone-100">
          مدیریت سوالات متداول
        </h1>
        <p className="text-xs text-stone-400 mt-1">
          پرسش‌ها و پاسخ‌هایی که در انتهای صفحه اصلی نمایش داده می‌شوند را
          مدیریت کنید.
        </p>
      </div>

      <AdminFaqClient initialFaqs={faqs} />
    </div>
  );
}
