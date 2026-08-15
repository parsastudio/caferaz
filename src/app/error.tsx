"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Application Error:", error);
  }, [error]);

  return (
    <div
      className="min-h-screen bg-stone-950 flex flex-col justify-center items-center p-6 text-center"
      dir="rtl"
    >
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mb-6">
        <AlertTriangle className="w-8 h-8" />
      </div>

      <h1 className="text-xl font-black text-stone-100 mb-2">
        متأسفانه خطایی در پردازش رخ داد
      </h1>
      <p className="text-xs text-stone-400 max-w-sm leading-relaxed mb-6">
        ارتباط با سرویس موقتاً با اختلال مواجه شد. لطفاً دوباره تلاش فرمایید.
      </p>

      <Button
        onClick={() => reset()}
        className="bg-gold-500 hover:bg-gold-600 text-stone-950 font-black px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer"
      >
        <RotateCcw className="w-4 h-4" />
        <span>تلاش مجدد</span>
      </Button>
    </div>
  );
}
