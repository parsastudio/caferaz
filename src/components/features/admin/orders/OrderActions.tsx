"use client";

import React from "react";
import { Clock, Check, Trash, X } from "lucide-react";
import { OrderStatus } from "@/domain/types";

interface OrderActionsProps {
  orderId: string;
  currentStatus: OrderStatus;
  isUpdating: boolean;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
  onDelete: (orderId: string) => void;
}

export default function OrderActions({
  orderId,
  currentStatus,
  isUpdating,
  onStatusChange,
  onDelete,
}: OrderActionsProps) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2 pt-2.5 border-t border-stone-800/40">
      <span className="text-[11px] text-stone-500 font-bold ml-auto">
        تغییر وضعیت سفارش:
      </span>
      <button
        onClick={() => onStatusChange(orderId, "unreviewed")}
        disabled={isUpdating}
        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer border flex items-center gap-1 ${
          currentStatus === "unreviewed"
            ? "bg-red-500/10 border-red-500/30 text-red-400 font-black"
            : "bg-stone-950/40 border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700"
        }`}
      >
        <Clock className="w-3 h-3" />
        <span>بررسی نشده</span>
      </button>
      <button
        onClick={() => onStatusChange(orderId, "pending")}
        disabled={isUpdating}
        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer border flex items-center gap-1 ${
          currentStatus === "pending"
            ? "bg-gold-500/10 border-gold-500/30 text-gold-400 font-black"
            : "bg-stone-950/40 border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700"
        }`}
      >
        <Clock className="w-3 h-3" />
        <span>در حال انجام</span>
      </button>
      <button
        onClick={() => onStatusChange(orderId, "completed")}
        disabled={isUpdating}
        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer border flex items-center gap-1 ${
          currentStatus === "completed"
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-black"
            : "bg-stone-950/40 border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700"
        }`}
      >
        <Check className="w-3 h-3" />
        <span>تکمیل شده</span>
      </button>
      <button
        onClick={() => onStatusChange(orderId, "cancelled")}
        disabled={isUpdating}
        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer border flex items-center gap-1 ${
          currentStatus === "cancelled"
            ? "bg-stone-500/10 border-stone-500/30 text-stone-400 font-black"
            : "bg-stone-950/40 border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700"
        }`}
      >
        <X className="w-3 h-3" />
        <span>لغو شده</span>
      </button>
      <button
        onClick={() => onDelete(orderId)}
        disabled={isUpdating}
        className="px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer border border-red-500/20 text-red-400 bg-red-500/5 hover:bg-red-500/10 flex items-center gap-1"
      >
        <Trash className="w-3 h-3" />
        <span>حذف سفارش</span>
      </button>
    </div>
  );
}
