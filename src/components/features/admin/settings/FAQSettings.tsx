"use client";

import React, { useState, useTransition } from "react";
import { HelpCircle, Plus, Trash, Edit3, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateSettingsAction } from "@/actions/settings";
import { FAQ } from "@/components/features/landing/FAQSection";
import FAQDialog from "./FAQDialog";

interface FAQSettingsProps {
  initialFaqs: FAQ[];
}

export default function FAQSettings({ initialFaqs }: FAQSettingsProps) {
  const [faqs, setFaqs] = useState<FAQ[]>(initialFaqs);
  const [isPending, startTransition] = useTransition();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);

  const handleAddClick = () => {
    setEditingIndex(null);
    setEditingFAQ(null);
    setIsDialogOpen(true);
  };

  const handleEditClick = (index: number) => {
    setEditingIndex(index);
    setEditingFAQ(faqs[index]);
    setIsDialogOpen(true);
  };

  const handleDelete = (index: number) => {
    if (!confirm("آیا از حذف این سوال متداول اطمینان دارید؟")) return;
    const updated = faqs.filter((_, i) => i !== index);
    setFaqs(updated);
    saveFAQList(updated);
  };

  const handleDialogSubmit = (faq: FAQ) => {
    let updated: FAQ[];
    if (editingIndex !== null) {
      updated = faqs.map((f, i) => (i === editingIndex ? faq : f));
    } else {
      updated = [...faqs, faq];
    }
    setFaqs(updated);
    setIsDialogOpen(false);
    saveFAQList(updated);
  };

  const saveFAQList = (updatedList: FAQ[]) => {
    startTransition(async () => {
      const res = await updateSettingsAction({
        key: "site_faq",
        value: updatedList,
      });
      if (res.success) {
        toast.success("لیست سوالات متداول با موفقیت به‌روزرسانی شد.");
      } else {
        toast.error(res.error || "خطایی در ذخیره‌سازی رخ داد.");
      }
    });
  };

  return (
    <div
      className="space-y-6 text-right animate-in fade-in duration-200"
      dir="rtl"
    >
      <div className="flex justify-between items-center bg-stone-900/10 p-4 rounded-2xl border border-stone-800">
        <div>
          <h3 className="text-sm font-black text-stone-200">
            مدیریت لیست سوالات متداول کاربران
          </h3>
          <p className="text-[11px] text-stone-500 mt-1">
            سوالات متداول را به همراه پاسخ‌های آن‌ها اضافه، ویرایش یا حذف کنید.
          </p>
        </div>
        <Button
          onClick={handleAddClick}
          className="bg-gold-500 hover:bg-gold-600 text-stone-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4 ml-1" />
          افزودن سوال جدید
        </Button>
      </div>

      {faqs.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-stone-850 bg-stone-900/10 rounded-2xl">
          <p className="text-xs text-stone-500">
            تاکنون سوال متداولی ثبت نشده است.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-stone-900/30 border border-stone-800 p-5 rounded-2xl space-y-3 relative group"
            >
              <div className="flex items-center justify-between border-b border-stone-800/50 pb-2">
                <span className="text-[10px] bg-gold-500/10 text-gold-400 border border-gold-500/20 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <HelpCircle className="w-3 h-3 text-gold-500" />
                  سوال {index + 1}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditClick(index)}
                    className="p-1.5 text-stone-400 hover:text-gold-500 hover:bg-gold-500/5 rounded-lg border border-stone-800 hover:border-gold-500/20 transition-all cursor-pointer"
                    title="ویرایش"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(index)}
                    className="p-1.5 text-stone-400 hover:text-red-400 hover:bg-red-500/5 rounded-lg border border-stone-800 hover:border-red-500/20 transition-all cursor-pointer"
                    title="حذف"
                  >
                    <Trash className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="text-xs font-bold text-stone-200">
                  {faq.question}
                </h4>
                <p className="text-[11px] text-stone-400 leading-relaxed pr-1 font-medium">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {isPending && (
        <div className="flex items-center justify-center gap-2 text-gold-500 text-xs font-bold">
          <Loader2 className="w-4 h-4 animate-spin" />
          در حال به‌روزرسانی نهایی روی سرور...
        </div>
      )}

      <FAQDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleDialogSubmit}
        initialFAQ={editingFAQ}
      />
    </div>
  );
}
