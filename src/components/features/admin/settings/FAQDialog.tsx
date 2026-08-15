"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { HelpCircle } from "lucide-react";
import { FAQ } from "@/components/features/landing/FAQSection";
import FAQForm from "@/components/features/admin/settings/FAQForm";

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

        {isOpen && (
          <FAQForm
            key={initialFAQ ? `${initialFAQ.question}` : "new"}
            initialFAQ={initialFAQ}
            onSubmit={onSubmit}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
