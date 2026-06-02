"use client";

import React from "react";

interface CommentFilterTabsProps {
  statusFilter: "all" | "pending" | "approved" | "rejected" | "spam";
  setStatusFilter: (
    filter: "all" | "pending" | "approved" | "rejected" | "spam",
  ) => void;
  totalCount: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  spamCount: number;
}

export default function CommentFilterTabs({
  statusFilter,
  setStatusFilter,
  totalCount,
  pendingCount,
  approvedCount,
  rejectedCount,
  spamCount,
}: CommentFilterTabsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 bg-stone-900/40 p-1 rounded-2xl border border-stone-850 max-w-3xl select-none">
      <button
        onClick={() => setStatusFilter("all")}
        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
          statusFilter === "all"
            ? "bg-gold-500 text-stone-950 font-black shadow"
            : "text-stone-400 hover:text-stone-200"
        }`}
      >
        همه دیدگاه‌ها ({totalCount})
      </button>
      <button
        onClick={() => setStatusFilter("pending")}
        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
          statusFilter === "pending"
            ? "bg-gold-500 text-stone-950 font-black shadow"
            : "text-stone-400 hover:text-stone-200"
        }`}
      >
        در انتظار تایید ({pendingCount})
        {pendingCount > 0 && (
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        )}
      </button>
      <button
        onClick={() => setStatusFilter("approved")}
        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
          statusFilter === "approved"
            ? "bg-gold-500 text-stone-950 font-black shadow"
            : "text-stone-400 hover:text-stone-200"
        }`}
      >
        منتشر شده ({approvedCount})
      </button>
      <button
        onClick={() => setStatusFilter("rejected")}
        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
          statusFilter === "rejected"
            ? "bg-gold-500 text-stone-950 font-black shadow"
            : "text-stone-400 hover:text-stone-200"
        }`}
      >
        رد شده ({rejectedCount})
      </button>
      <button
        onClick={() => setStatusFilter("spam")}
        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
          statusFilter === "spam"
            ? "bg-gold-500 text-stone-950 font-black shadow"
            : "text-stone-400 hover:text-stone-200"
        }`}
      >
        اسپم ({spamCount})
      </button>
    </div>
  );
}
