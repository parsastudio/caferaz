"use client";

import React, { useState } from "react";
import {
  Clock,
  Check,
  User,
  MapPin,
  Phone,
  Calendar,
  ShoppingBag,
  Loader2,
  Trash,
  X,
} from "lucide-react";
import { Order } from "@/types";
import { updateOrderStatusAction, deleteOrderAction } from "@/actions/order";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface AdminOrdersClientListProps {
  initialOrders: Order[];
}

export default function AdminOrdersClientList({
  initialOrders,
}: AdminOrdersClientListProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "unreviewed" | "pending" | "completed" | "cancelled"
  >("all");

  const handleStatusChange = async (
    orderId: string,
    newStatus: "unreviewed" | "pending" | "completed" | "cancelled",
  ) => {
    setUpdatingId(orderId);
    try {
      const result = await updateOrderStatusAction(orderId, newStatus);
      if (result.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
        );
        toast.success("وضعیت سفارش با موفقیت به‌روزرسانی شد.");
      } else {
        toast.error(result.error || "خطا در به‌روزرسانی وضعیت.");
      }
    } catch {
      toast.error("خطای غیرمنتظره رخ داد.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("آیا از حذف دائمی این سفارش از کل سیستم اطمینان دارید؟"))
      return;
    setUpdatingId(orderId);
    try {
      const result = await deleteOrderAction(orderId);
      if (result.success) {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
        toast.success("سفارش با موفقیت حذف گردید.");
      } else {
        toast.error(result.error || "خطا در حذف سفارش.");
      }
    } catch {
      toast.error("خطای غیرمنتظره سیستمی رخ داد.");
    } finally {
      setUpdatingId(null);
    }
  };

  const totalCount = orders.length;
  const unreviewedCount = orders.filter(
    (o) => o.status === "unreviewed",
  ).length;
  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const completedCount = orders.filter((o) => o.status === "completed").length;
  const cancelledCount = orders.filter((o) => o.status === "cancelled").length;

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === "all") return true;
    return o.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 bg-stone-900/40 p-1 rounded-2xl border border-stone-850 max-w-3xl select-none">
        <button
          onClick={() => setStatusFilter("all")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            statusFilter === "all"
              ? "bg-gold-500 text-stone-950 font-black shadow"
              : "text-stone-400 hover:text-stone-200"
          }`}
        >
          همه سفارش‌ها ({totalCount})
        </button>
        <button
          onClick={() => setStatusFilter("unreviewed")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            statusFilter === "unreviewed"
              ? "bg-gold-500 text-stone-950 font-black shadow"
              : "text-stone-400 hover:text-stone-200"
          }`}
        >
          بررسی نشده ({unreviewedCount})
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
          در حال انجام ({pendingCount})
        </button>
        <button
          onClick={() => setStatusFilter("completed")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            statusFilter === "completed"
              ? "bg-gold-500 text-stone-950 font-black shadow"
              : "text-stone-400 hover:text-stone-200"
          }`}
        >
          تکمیل شده ({completedCount})
        </button>
        <button
          onClick={() => setStatusFilter("cancelled")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            statusFilter === "cancelled"
              ? "bg-gold-500 text-stone-950 font-black shadow"
              : "text-stone-400 hover:text-stone-200"
          }`}
        >
          لغو شده ({cancelledCount})
        </button>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-stone-850 bg-stone-900/10 rounded-2xl">
          <p className="text-xs text-stone-500">
            سفارشی در این بخش ثبت نشده است.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-stone-900/30 border border-stone-800 rounded-2xl p-5 space-y-4 text-right animate-in fade-in duration-200"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-850 pb-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm font-black text-gold-500 font-sans">
                    {order.id}
                  </span>
                  <span
                    className="text-xs text-stone-500 font-sans flex items-center gap-1.5"
                    suppressHydrationWarning
                  >
                    <Calendar className="w-3.5 h-3.5 text-stone-600" />
                    {new Date(order.createdAt).toLocaleDateString("fa-IR")}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {updatingId === order.id ? (
                    <span className="text-[10px] text-stone-500 flex items-center gap-1">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-gold-500" />
                      در حال بروزرسانی...
                    </span>
                  ) : order.status === "completed" ? (
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                      تکمیل شده
                    </Badge>
                  ) : order.status === "pending" ? (
                    <Badge className="bg-gold-500/10 text-gold-500 border-gold-500/20 text-[10px] font-bold px-2.5 py-0.5 rounded-full animate-pulse">
                      در حال انجام
                    </Badge>
                  ) : order.status === "unreviewed" ? (
                    <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-[10px] font-bold px-2.5 py-0.5 rounded-full animate-pulse">
                      بررسی نشده
                    </Badge>
                  ) : (
                    <Badge className="bg-stone-500/10 text-stone-400 border-stone-500/20 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                      لغو شده
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <span className="text-[10px] text-stone-500 font-black block">
                    اطلاعات خریدار:
                  </span>
                  <div className="space-y-1.5 text-xs text-stone-300 font-bold">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-stone-500" />
                      <span>{order.customerName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-sans">
                      <Phone className="w-3.5 h-3.5 text-stone-500" />
                      <span>{order.customerPhone}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] text-stone-500 font-black block">
                    مشخصات سفارش:
                  </span>
                  <div className="space-y-1.5 text-xs text-stone-300 font-bold">
                    <div className="flex items-center gap-1.5">
                      <ShoppingBag className="w-3.5 h-3.5 text-stone-500" />
                      <span>{order.grindType}</span>
                    </div>
                    <div className="text-stone-400">
                      وزن:{" "}
                      <span className="text-stone-200 font-sans">
                        {order.weightGrams} گرم
                      </span>{" "}
                      | تعداد:{" "}
                      <span className="text-stone-200 font-sans">
                        {order.quantity} بسته
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] text-stone-500 font-black block">
                    مبلغ کل فاکتور:
                  </span>
                  <div className="text-gold-500 font-black text-sm font-sans">
                    {order.finalPrice.toLocaleString()} تومان
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-1.5 bg-stone-950/40 p-3 rounded-xl border border-stone-850">
                <MapPin className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
                <span className="text-[11px] text-stone-400 leading-relaxed font-medium">
                  آدرس تحویل: {order.customerAddress}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 pt-2.5 border-t border-stone-800/40">
                <span className="text-[11px] text-stone-500 font-bold ml-auto">
                  تغییر وضعیت سفارش:
                </span>
                <button
                  onClick={() => handleStatusChange(order.id, "unreviewed")}
                  disabled={updatingId === order.id}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer border flex items-center gap-1 ${
                    order.status === "unreviewed"
                      ? "bg-red-500/10 border-red-500/30 text-red-400 font-black"
                      : "bg-stone-950/40 border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700"
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  <span>بررسی نشده</span>
                </button>
                <button
                  onClick={() => handleStatusChange(order.id, "pending")}
                  disabled={updatingId === order.id}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer border flex items-center gap-1 ${
                    order.status === "pending"
                      ? "bg-gold-500/10 border-gold-500/30 text-gold-400 font-black"
                      : "bg-stone-950/40 border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700"
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  <span>در حال انجام</span>
                </button>
                <button
                  onClick={() => handleStatusChange(order.id, "completed")}
                  disabled={updatingId === order.id}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer border flex items-center gap-1 ${
                    order.status === "completed"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-black"
                      : "bg-stone-950/40 border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700"
                  }`}
                >
                  <Check className="w-3 h-3" />
                  <span>تکمیل شده</span>
                </button>
                <button
                  onClick={() => handleStatusChange(order.id, "cancelled")}
                  disabled={updatingId === order.id}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer border flex items-center gap-1 ${
                    order.status === "cancelled"
                      ? "bg-stone-500/10 border-stone-500/30 text-stone-400 font-black"
                      : "bg-stone-950/40 border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700"
                  }`}
                >
                  <X className="w-3 h-3" />
                  <span>لغو شده</span>
                </button>
                <button
                  onClick={() => handleDeleteOrder(order.id)}
                  disabled={updatingId === order.id}
                  className="px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer border border-red-500/20 text-red-400 bg-red-500/5 hover:bg-red-500/10 flex items-center gap-1"
                >
                  <Trash className="w-3 h-3" />
                  <span>حذف سفارش</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
