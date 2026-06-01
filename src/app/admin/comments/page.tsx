import React from "react";
import { getAdminCommentsAction } from "@/actions/comment";
import AdminCommentsClientList from "@/components/features/admin/AdminCommentsClientList";

export default async function AdminCommentsPage() {
  const commentsResult = await getAdminCommentsAction("prod_coffee_bulk_01");
  const comments = commentsResult.success ? commentsResult.data || [] : [];

  return (
    <div className="space-y-8 text-right" dir="rtl">
      <div>
        <h1 className="text-2xl font-black text-stone-100">
          مدیریت نظرات و پرسش‌ها
        </h1>
        <p className="text-xs text-stone-400 mt-1">
          تایید، رد، ویرایش یا پاسخ مستقیم به نظرات کاربران
        </p>
      </div>

      <AdminCommentsClientList initialComments={comments} />
    </div>
  );
}
