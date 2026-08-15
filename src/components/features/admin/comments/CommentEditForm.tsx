"use client";

import React, { useState } from "react";
import { Check } from "lucide-react";

interface CommentEditFormProps {
  initialText: string;
  onCancel: () => void;
  onSave: (text: string) => Promise<boolean>;
}

export default function CommentEditForm({
  initialText,
  onCancel,
  onSave,
}: CommentEditFormProps) {
  const [text, setText] = useState(initialText);

  return (
    <div className="mr-0 sm:mr-12 bg-stone-950/40 p-4 rounded-xl border border-stone-800 space-y-3">
      <span className="text-[10px] font-bold text-stone-400 block">
        ویرایش متن دیدگاه:
      </span>
      <textarea
        rows={3}
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-200 focus:border-gold-500 outline-none resize-none leading-relaxed"
      />
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 rounded-lg text-[10px] text-stone-400 hover:bg-stone-900 cursor-pointer"
        >
          انصراف
        </button>
        <button
          type="button"
          onClick={() => onSave(text)}
          className="bg-gold-500 hover:bg-gold-600 text-stone-950 font-black text-[10px] px-4 py-1.5 rounded-lg cursor-pointer flex items-center gap-1"
        >
          <Check className="w-3.5 h-3.5" />
          <span>ذخیره تغییرات</span>
        </button>
      </div>
    </div>
  );
}
