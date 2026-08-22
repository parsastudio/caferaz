"use client";

import React, { useState, useTransition } from "react";
import { Plus, HelpCircle, Search, X } from "lucide-react";
import { FAQItem } from "@/domain/validations/faq.schema";
import {
  createFaqAction,
  updateFaqAction,
  deleteFaqAction,
} from "@/actions/faq";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import FaqCard from "@/components/features/admin/faq/FaqCard";
import FaqModal from "@/components/features/admin/faq/FaqModal";

interface AdminFaqClientProps {
  initialFaqs: FAQItem[];
}

export default function AdminFaqClient({ initialFaqs }: AdminFaqClientProps) {
  const [faqs, setFaqs] = useState<FAQItem[]>(initialFaqs);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredFaqs = faqs.filter((item) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      item.question.toLowerCase().includes(q) ||
      item.answer.toLowerCase().includes(q)
    );
  });

  const handleOpenCreate = () => {
    setEditingFaq(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (faq: FAQItem) => {
    setEditingFaq(faq);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm("آیا از حذف این سوال متداول اطمینان دارید؟")) return;

    setDeletingId(id);
    startTransition(async () => {
      try {
        const res = await deleteFaqAction(id);
        if (res.success) {
          setFaqs((prev) => prev.filter((item) => item.id !== id));
          toast.success(res.message || "سوال متداول حذف شد.");
        } else {
          toast.error(res.error || "خطا در حذف سوال.");
        }
      } catch {
        toast.error("خطای غیرمنتظره در سرور.");
      } finally {
        setDeletingId(null);
      }
    });
  };

  const handleModalSubmit = async (data: {
    id?: string;
    question: string;
    answer: string;
  }): Promise<boolean> => {
    if (data.id) {
      const res = await updateFaqAction({
        id: data.id,
        question: data.question,
        answer: data.answer,
      });

      if (res.success && res.data) {
        setFaqs((prev) =>
          prev.map((item) => (item.id === data.id ? res.data : item)),
        );
        toast.success(res.message || "تغییرات ذخیره شد.");
        return true;
      } else {
        toast.error(res.error || "خطا در ثبت تغییرات.");
        return false;
      }
    } else {
      const res = await createFaqAction({
        question: data.question,
        answer: data.answer,
      });

      if (res.success && res.data) {
        setFaqs((prev) => [...prev, res.data]);
        toast.success(res.message || "سوال جدید اضافه شد.");
        return true;
      } else {
        toast.error(res.error || "خطا در افزودن سوال.");
        return false;
      }
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-900/40 border border-stone-800 p-6 rounded-3xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gold-500/10 border border-gold-500/20 text-gold-500 flex items-center justify-center">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-black text-stone-100">
              لیست سوالات متداول ({faqs.length} مورد)
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              پرسش‌ها و پاسخ‌های پرتکرار مشتریان را به راحتی مدیریت نمایید.
            </p>
          </div>
        </div>

        <Button
          onClick={handleOpenCreate}
          className="bg-gold-500 hover:bg-gold-600 text-stone-950 font-black px-5 py-3 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shrink-0 self-end sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          افزودن سوال جدید
        </Button>
      </div>

      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="جستجو در بین سوالات و پاسخ‌ها..."
          className="w-full bg-stone-950 border border-stone-800 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 rounded-2xl pr-11 pl-11 py-3 text-xs sm:text-sm text-stone-100 outline-none transition-all font-medium placeholder:text-stone-600"
        />
        <Search className="w-4 h-4 text-stone-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />

        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-stone-500 hover:text-stone-300 hover:bg-stone-850 rounded-lg cursor-pointer transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-stone-850 bg-stone-900/10 rounded-3xl p-8 space-y-2">
            <p className="text-xs text-stone-400 font-bold">
              {searchQuery
                ? `هیچ سوالی مطابق با عبارت «${searchQuery}» پیدا نشد.`
                : "تاکنون سوال متداولی ثبت نشده است."}
            </p>
            {!searchQuery && (
              <Button
                onClick={handleOpenCreate}
                variant="outline"
                className="mt-3 text-xs border-gold-500/30 text-gold-400 hover:bg-gold-500/10"
              >
                اولین سوال را اضافه کنید
              </Button>
            )}
          </div>
        ) : (
          filteredFaqs.map((faq, idx) => (
            <FaqCard
              key={faq.id}
              faq={faq}
              index={idx}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
              isDeleting={deletingId === faq.id && isPending}
            />
          ))
        )}
      </div>

      <FaqModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={handleModalSubmit}
        initialData={editingFaq}
        isPending={isPending}
      />
    </div>
  );
}
