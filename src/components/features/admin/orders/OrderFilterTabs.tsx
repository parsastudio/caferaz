"use client";

import React from "react";
import { OrderStatus } from "@/domain/types";
import { toPersianDigits } from "@/lib/utils";

interface OrderFilterTabsProps {
  statusFilter: "all" | OrderStatus;
  setStatusFilter: (status: "all" | OrderStatus) => void;
  totalCount: number;
  unreviewedCount: number;
  pendingCount: number;
  completedCount: number;
  cancelledCount: number;
}

export default function OrderFilterTabs({
  statusFilter,
  setStatusFilter,
  totalCount,
  unreviewedCount,
  pendingCount,
  completedCount,
  cancelledCount,
}: OrderFilterTabsProps) {
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
        همه سفارش‌ها ({toPersianDigits(totalCount)})
      </button>
      <button
        onClick={() => setStatusFilter("unreviewed")}
        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
          statusFilter === "unreviewed"
            ? "bg-gold-500 text-stone-950 font-black shadow"
            : "text-stone-400 hover:text-stone-200"
        }`}
      >
        بررسی نشده ({toPersianDigits(unreviewedCount)})
        {unreviewedCount > 0 && (
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        )}
      </button>
      <button
        onClick={() => setStatusFilter("pending")}
        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
          statusFilter === "pending"
            ? "bg-gold-500 text-stone-950 font-black shadow"
            : "text-stone-400 hover:text-stone-200"
        }`}
      >
        در حال انجام ({toPersianDigits(pendingCount)})
      </button>
      <button
        onClick={() => setStatusFilter("completed")}
        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
          statusFilter === "completed"
            ? "bg-gold-500 text-stone-950 font-black shadow"
            : "text-stone-400 hover:text-stone-200"
        }`}
      >
        تکمیل شده ({toPersianDigits(completedCount)})
      </button>
      <button
        onClick={() => setStatusFilter("cancelled")}
        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
          statusFilter === "cancelled"
            ? "bg-gold-500 text-stone-950 font-black shadow"
            : "text-stone-400 hover:text-stone-200"
        }`}
      >
        لغو شده ({toPersianDigits(cancelledCount)})
      </button>
    </div>
  );
}
