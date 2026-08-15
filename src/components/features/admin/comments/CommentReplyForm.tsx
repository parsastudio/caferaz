"use client";

import React, { useState } from "react";
import { Check, X } from "lucide-react";

interface CommentReplyFormProps {
  onCancel: () => void;
  onSubmit: (name: string, text: string) => Promise<boolean>;
  isSubmitting: boolean;
}

export default function CommentReplyForm({
  onCancel,
  onSubmit,
  isSubmitting,
}: CommentReplyFormProps) {
  const [adminName, setAdminName] = useState("پشتیبان کافه راز");
  const [replyText, setReplyText] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onSubmit(adminName, replyText);
    if (success) {
      setReplyText("");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mr-0 sm:mr-12 bg-stone-950/40 p-4 rounded-xl border border-stone-800 space-y-3"
    >
      <div className="flex items-center justify-between border-b border-stone-800 pb-2">
        <span className="text-[10px] font-bold text-stone-400">
          ثبت پاسخ به دیدگاه
        </span>
        <button
          type="button"
          onClick={onCancel}
          className="text-stone-500 hover:text-stone-300 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-stone-400">
            نام پاسخ‌دهنده:
          </label>
          <input
            type="text"
            value={adminName}
            onChange={(e) => setAdminName(e.target.value)}
            className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-1.5 text-xs text-stone-200 focus:border-gold-500 outline-none"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-bold text-stone-400">
          متن پاسخ شما:
        </label>
        <textarea
          rows={2}
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder="پاسخ خود را بنویسید..."
          className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-1.5 text-xs text-stone-200 focus:border-gold-500 outline-none resize-none leading-relaxed"
        />
      </div>

      <div className="flex justify-end pt-1">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-gold-500 hover:bg-gold-600 text-stone-950 font-black text-[10px] px-4 py-2 rounded-lg cursor-pointer transition-colors flex items-center gap-1"
        >
          <Check className="w-3.5 h-3.5" />
          <span>{isSubmitting ? "در حال ثبت..." : "ارسال نهایی پاسخ"}</span>
        </button>
      </div>
    </form>
  );
}
