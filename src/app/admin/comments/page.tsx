import React from "react";
import { getAdminCommentsAction } from "@/actions/comment";
import { getMainProductAction } from "@/actions/product";
import AdminCommentsClientList from "@/components/features/admin/AdminCommentsClientList";

export default async function AdminCommentsPage() {
  const productResult = await getMainProductAction();
  const productId =
    productResult.success && productResult.data ? productResult.data.id : "";

  const commentsResult = productId
    ? await getAdminCommentsAction(productId)
    : { success: false, data: [] };

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
