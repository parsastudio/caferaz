"use client";

import React from "react";
import { FAQItem } from "@/domain/validations/faq.schema";
import { Edit3, Trash2, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FaqCardProps {
  faq: FAQItem;
  index: number;
  onEdit: (faq: FAQItem) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export default function FaqCard({
  faq,
  index,
  onEdit,
  onDelete,
  isDeleting,
}: FaqCardProps) {
  return (
    <div className="bg-stone-900/30 border border-stone-850 hover:border-stone-800 p-5 rounded-2xl transition-all space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-850/80 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-gold-500/10 border border-gold-500/20 text-gold-400 flex items-center justify-center text-xs font-black font-sans">
            {index + 1}
          </span>
          <h3 className="text-sm font-black text-stone-100">{faq.question}</h3>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit(faq)}
            className="h-8 px-2.5 text-xs text-stone-300 hover:text-gold-400 hover:bg-gold-500/10 rounded-lg cursor-pointer flex items-center gap-1"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>ویرایش</span>
          </Button>

          <Button
            size="sm"
            variant="ghost"
            disabled={isDeleting}
            onClick={() => onDelete(faq.id)}
            className="h-8 px-2.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg cursor-pointer flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>حذف</span>
          </Button>
        </div>
      </div>

      <p className="text-xs text-stone-400 leading-relaxed font-medium pr-1">
        {faq.answer}
      </p>
    </div>
  );
}
