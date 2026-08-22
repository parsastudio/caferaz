"use client";

import React, { useState, useTransition } from "react";
import { FAQItem } from "@/domain/validations/faq.schema";
import { Trash2, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FaqCardProps {
  faq: FAQItem;
  index: number;
  onUpdate: (id: string, question: string, answer: string) => Promise<boolean>;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export default function FaqCard({
  faq,
  index,
  onUpdate,
  onDelete,
  isDeleting,
}: FaqCardProps) {
  const [question, setQuestion] = useState(faq.question);
  const [answer, setAnswer] = useState(faq.answer);
  const [isPending, startTransition] = useTransition();

  const isDirty =
    question.trim() !== faq.question || answer.trim() !== faq.answer;

  const handleSave = () => {
    if (!question.trim() || !answer.trim()) return;

    startTransition(async () => {
      await onUpdate(faq.id, question.trim(), answer.trim());
    });
  };

  return (
    <div
      className={`bg-stone-900/30 border p-5 rounded-2xl transition-all space-y-3.5 ${
        isDirty
          ? "border-gold-500/40 bg-gold-500/5 shadow-lg shadow-gold-500/5"
          : "border-stone-850 hover:border-stone-800"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-850/80 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-gold-500/10 border border-gold-500/20 text-gold-400 flex items-center justify-center text-xs font-black font-sans">
            {index + 1}
          </span>
          <span className="text-xs text-stone-400 font-bold">سوال متداول</span>
          {isDirty && (
            <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold animate-pulse">
              تغییر ذخیره‌نشده
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isPending || !isDirty}
            className={`h-8 px-3 text-xs font-black rounded-lg cursor-pointer flex items-center gap-1 transition-all ${
              isDirty
                ? "bg-gold-500 hover:bg-gold-600 text-stone-950 shadow-md shadow-gold-500/10"
                : "bg-stone-800 text-stone-500 opacity-50 cursor-not-allowed"
            }`}
          >
            {isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                در حال ذخیره...
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                ذخیره تغییر
              </>
            )}
          </Button>

          <Button
            size="sm"
            variant="ghost"
            disabled={isDeleting}
            onClick={() => onDelete(faq.id)}
            className="h-8 px-2.5 text-xs text-stone-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg cursor-pointer flex items-center gap-1"
            title="حذف این سوال"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="صورت سوال..."
          className="w-full bg-stone-950 border border-stone-800 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-stone-100 outline-none font-bold text-right transition-all"
        />

        <textarea
          rows={3}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="پاسخ سوال..."
          className="w-full bg-stone-950 border border-stone-800 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 rounded-xl p-3 text-xs sm:text-sm text-stone-200 outline-none resize-none leading-relaxed font-medium text-right transition-all"
        />
      </div>
    </div>
  );
}
