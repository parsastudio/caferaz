"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { FAQ } from "@/components/landing/FAQSection";

interface FAQDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (faq: FAQ) => void;
  initialFAQ?: FAQ | null;
}

export default function FAQDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  initialFAQ,
}: FAQDialogProps) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialFAQ) {
        setQuestion(initialFAQ.question);
        setAnswer(initialFAQ.answer);
      } else {
        setQuestion("");
        setAnswer("");
      }
      setError(null);
    }
  }, [isOpen, initialFAQ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!question.trim() || !answer.trim()) {
      setError("لطفاً هم عنوان سوال و هم پاسخ آن را وارد کنید.");
      return;
    }

    onSubmit({
      question: question.trim(),
      answer: answer.trim(),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        dir="rtl"
        className="sm:max-w-lg bg-stone-900 border border-stone-800 text-stone-100 p-6 md:p-8 rounded-2xl text-right animate-in fade-in zoom-in-95 duration-200"
      >
        <DialogHeader className="space-y-2 text-right">
          <DialogTitle className="text-lg font-bold text-gold-500 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-gold-500" />
            {initialFAQ ? "ویرایش سوال متداول" : "افزودن سوال متداول جدید"}
          </DialogTitle>
          <DialogDescription className="text-xs text-stone-400">
            سوال کاربر و پاسخی که در بخش لندینگ نمایش داده می‌شود را در این فرم
            تکمیل نمایید.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-3" dir="rtl">
          <div className="space-y-1.5 text-right">
            <label className="text-xs font-bold text-stone-300">
              صورت سوال <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full bg-stone-950 border border-stone-850 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 rounded-xl px-4 py-3 text-sm text-stone-100 outline-none text-right font-medium"
              placeholder="مثال: روش اصولی دم‌آوری قهوه چیست؟"
            />
          </div>

          <div className="space-y-1.5 text-right">
            <label className="text-xs font-bold text-stone-300">
              پاسخ سوال <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="w-full bg-stone-950 border border-stone-850 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 rounded-xl px-4 py-3 text-sm text-stone-100 outline-none text-right resize-none leading-relaxed font-medium"
              placeholder="پاسخ دقیق، روشن و مختصر را بنویسید..."
            />
          </div>

          {error && (
            <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-right font-bold">
              {error}
            </div>
          )}

          <div className="border-t border-stone-800 pt-4 mt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-stone-400 hover:text-stone-200 cursor-pointer text-xs font-bold"
            >
              انصراف
            </Button>
            <Button
              type="submit"
              className="bg-gold-500 hover:bg-gold-600 text-stone-950 font-bold px-5 py-2.5 rounded-xl cursor-pointer text-xs"
            >
              {initialFAQ ? "اعمال تغییرات" : "افزودن به لیست"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
