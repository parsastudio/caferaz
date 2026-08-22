"use client";

import React, { useState } from "react";
import { HelpCircle, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FAQItem } from "@/domain/validations/faq.schema";

interface FaqModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    id?: string;
    question: string;
    answer: string;
  }) => Promise<boolean>;
  initialData?: FAQItem | null;
  isPending: boolean;
}

function FaqForm({
  initialData,
  onCancel,
  onSubmit,
  isPending,
}: {
  initialData?: FAQItem | null;
  onCancel: () => void;
  onSubmit: (data: {
    id?: string;
    question: string;
    answer: string;
  }) => Promise<boolean>;
  isPending: boolean;
}) {
  const [question, setQuestion] = useState(initialData?.question ?? "");
  const [answer, setAnswer] = useState(initialData?.answer ?? "");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!question.trim() || !answer.trim()) {
      setError("لطفاً هم صورت سوال و هم متن پاسخ را وارد نمایید.");
      return;
    }

    const success = await onSubmit({
      id: initialData?.id,
      question: question.trim(),
      answer: answer.trim(),
    });

    if (success) {
      onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-2" dir="rtl">
      <div className="space-y-1.5 text-right">
        <label className="text-xs font-bold text-stone-300">
          صورت سوال <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full bg-stone-950 border border-stone-800 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 rounded-xl px-4 py-3 text-sm text-stone-100 outline-none font-medium text-right"
          placeholder="مثال: زمان تحویل سفارش چقدر است؟"
        />
      </div>

      <div className="space-y-1.5 text-right">
        <label className="text-xs font-bold text-stone-300">
          پاسخ تفصیلی <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={4}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="w-full bg-stone-950 border border-stone-800 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 rounded-xl px-4 py-3 text-sm text-stone-100 outline-none resize-none leading-relaxed font-medium text-right"
          placeholder="پاسخ روشن و کامل را بنویسید..."
        />
      </div>

      {error && (
        <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl font-bold">
          {error}
        </div>
      )}

      <div className="border-t border-stone-800 pt-4 mt-4 flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          className="text-stone-400 hover:text-stone-200 cursor-pointer text-xs"
        >
          انصراف
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="bg-gold-500 hover:bg-gold-600 text-stone-950 font-black px-6 py-2.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              در حال ثبت...
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              {initialData ? "ذخیره تغییرات" : "افزودن سوال"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

export default function FaqModal({
  isOpen,
  onOpenChange,
  onSubmit,
  initialData,
  isPending,
}: FaqModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        dir="rtl"
        className="sm:max-w-lg bg-stone-900 border border-stone-800 text-stone-100 p-6 md:p-8 rounded-3xl text-right animate-in fade-in duration-150"
      >
        <DialogHeader className="space-y-2 text-right">
          <DialogTitle className="text-lg font-black text-gold-500 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-gold-500" />
            {initialData ? "ویرایش سوال متداول" : "افزودن سوال متداول جدید"}
          </DialogTitle>
          <DialogDescription className="text-xs text-stone-400">
            متن سوال و پاسخ مربوطه را وارد کنید تا در لندینگ سایت نمایش داده
            شود.
          </DialogDescription>
        </DialogHeader>

        {isOpen && (
          <FaqForm
            key={initialData?.id ?? "create_faq_key"}
            initialData={initialData}
            onCancel={() => onOpenChange(false)}
            onSubmit={onSubmit}
            isPending={isPending}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
