"use client";

import React, { useState, useTransition } from "react";
import { Plus, HelpCircle, Loader2 } from "lucide-react";
import { FAQItem } from "@/domain/validations/faq.schema";
import {
  createFaqAction,
  updateFaqAction,
  deleteFaqAction,
} from "@/actions/faq";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import FaqCard from "@/components/features/admin/faq/FaqCard";

interface AdminFaqClientProps {
  initialFaqs: FAQItem[];
}

export default function AdminFaqClient({ initialFaqs }: AdminFaqClientProps) {
  const [faqs, setFaqs] = useState<FAQItem[]>(initialFaqs);

  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [isCreating, startCreateTransition] = useTransition();

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeletingPending, startDeleteTransition] = useTransition();

  const handleCreateFaq = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newQuestion.trim() || !newAnswer.trim()) {
      toast.error("لطفاً هم صورت سوال و هم متن پاسخ را وارد نمایید.");
      return;
    }

    startCreateTransition(async () => {
      try {
        const res = await createFaqAction({
          question: newQuestion.trim(),
          answer: newAnswer.trim(),
        });

        if (res.success && res.data) {
          setFaqs((prev) => [...prev, res.data]);
          setNewQuestion("");
          setNewAnswer("");
          toast.success(res.message || "سوال جدید به لیست افزوده شد.");
        } else {
          const errorMsg = !res.success ? res.error : "خطا در افزودن سوال.";
          toast.error(errorMsg);
        }
      } catch {
        toast.error("خطای غیرمنتظره در ثبت سوال.");
      }
    });
  };

  const handleUpdateFaq = async (
    id: string,
    question: string,
    answer: string,
  ): Promise<boolean> => {
    try {
      const res = await updateFaqAction({ id, question, answer });
      if (res.success && res.data) {
        setFaqs((prev) =>
          prev.map((item) => (item.id === id ? res.data : item)),
        );
        toast.success(res.message || "تغییرات با موفقیت ذخیره شد.");
        return true;
      } else {
        const errorMsg = !res.success ? res.error : "خطا در ویرایش سوال.";
        toast.error(errorMsg);
        return false;
      }
    } catch {
      toast.error("خطای ارتباطی در ثبت تغییرات.");
      return false;
    }
  };

  const handleDeleteFaq = (id: string) => {
    if (!confirm("آیا از حذف این سوال متداول اطمینان دارید؟")) return;

    setDeletingId(id);
    startDeleteTransition(async () => {
      try {
        const res = await deleteFaqAction(id);
        if (res.success) {
          setFaqs((prev) => prev.filter((item) => item.id !== id));
          toast.success(res.message || "سوال متداول با موفقیت حذف شد.");
        } else {
          const errorMsg = !res.success ? res.error : "خطا در حذف سوال.";
          toast.error(errorMsg);
        }
      } catch {
        toast.error("خطای غیرمنتظره در سرور.");
      } finally {
        setDeletingId(null);
      }
    });
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="bg-stone-900/40 border border-gold-500/20 bg-gold-500/5 p-5 sm:p-6 rounded-3xl space-y-4">
        <div className="flex items-center gap-2.5 border-b border-gold-500/10 pb-3">
          <div className="w-9 h-9 rounded-xl bg-gold-500/10 border border-gold-500/20 text-gold-500 flex items-center justify-center">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-stone-100">
              افزودن سریع سوال متداول جدید
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              صورت سوال و پاسخ را در کادر زیر بنویسید و ثبت کنید.
            </p>
          </div>
        </div>

        <form onSubmit={handleCreateFaq} className="space-y-3">
          <input
            type="text"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="صورت سوال جدید..."
            className="w-full bg-stone-950 border border-stone-800 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 rounded-xl px-4 py-3 text-xs sm:text-sm text-stone-100 outline-none font-bold text-right transition-all placeholder:text-stone-600"
          />

          <textarea
            rows={3}
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
            placeholder="متن کامل و دقیق پاسخ..."
            className="w-full bg-stone-950 border border-stone-800 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 rounded-xl p-3.5 text-xs sm:text-sm text-stone-100 outline-none resize-none leading-relaxed font-medium text-right transition-all placeholder:text-stone-600"
          />

          <div className="flex justify-end pt-1">
            <Button
              type="submit"
              disabled={isCreating || !newQuestion.trim() || !newAnswer.trim()}
              className="bg-gold-500 hover:bg-gold-600 text-stone-950 font-black px-6 py-2.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  در حال ثبت...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  افزودن به لیست سوالات
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between bg-stone-900/30 border border-stone-800 p-4 sm:p-5 rounded-2xl">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-gold-500" />
            <h3 className="text-xs sm:text-sm font-black text-stone-200">
              لیست سوالات فعال سایت ({faqs.length} مورد)
            </h3>
          </div>
        </div>

        {faqs.length === 0 ? (
          <div className="text-center py-14 border border-dashed border-stone-850 bg-stone-900/10 rounded-2xl space-y-2">
            <p className="text-xs text-stone-400 font-bold">
              هنوز سوال متداولی تعریف نشده است. از کادر بالا اولین سوال را ثبت
              کنید.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <FaqCard
                key={faq.id}
                faq={faq}
                index={idx}
                onUpdate={handleUpdateFaq}
                onDelete={handleDeleteFaq}
                isDeleting={deletingId === faq.id && isDeletingPending}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
