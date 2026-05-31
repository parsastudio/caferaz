import React from "react";
import { getCommentsAction } from "@/app/actions/comment";
import AdminCommentsClientList from "@/components/admin/AdminCommentsClientList";

export default async function AdminCommentsPage() {
  const commentsResult = await getCommentsAction("prod_coffee_bulk_01");
  const comments = commentsResult.success ? commentsResult.data || [] : [];

  return (
    <div className="space-y-8 text-right" dir="rtl">
      <div>
        <h1 className="text-2xl font-black text-stone-100">
          مدیریت نظرات و پرسش‌ها
        </h1>
        <p className="text-xs text-stone-400 mt-1">
          تایید، حذف یا پاسخ مستقیم به نظرات با هویت دلخواه ادمین
        </p>
      </div>

      {comments.length > 0 ? (
        <AdminCommentsClientList initialComments={comments} />
      ) : (
        <div className="text-center py-16 border border-dashed border-stone-800 bg-stone-900/10 rounded-2xl">
          <p className="text-xs text-stone-500">
            تاکنون دیدگاهی برای این محصول ثبت نشده است.
          </p>
        </div>
      )}
    </div>
  );
}
