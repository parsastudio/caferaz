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
} from "lucide-react";
import { Order } from "@/lib/mock-db";
import { updateOrderStatusAction } from "@/app/actions/order";
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

  const handleStatusChange = async (
    orderId: string,
    newStatus: "pending" | "completed",
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

  if (orders.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed border-stone-850 bg-stone-900/10 rounded-2xl">
        <p className="text-xs text-stone-500">تاکنون سفارشی ثبت نشده است.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div
          key={order.id}
          className="bg-stone-900/30 border border-stone-800 rounded-2xl p-5 space-y-4 text-right animate-in fade-in duration-200"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-850 pb-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm font-black text-gold-500 font-sans">
                {order.id}
              </span>
              <span className="text-xs text-stone-500 font-sans flex items-center gap-1.5">
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
                  تحویل شده
                </Badge>
              ) : (
                <Badge className="bg-gold-500/10 text-gold-500 border-gold-500/20 text-[10px] font-bold px-2.5 py-0.5 rounded-full animate-pulse">
                  در حال آماده‌سازی
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

          <div className="flex items-center justify-end gap-2 pt-2.5 border-t border-stone-800/40">
            <span className="text-[11px] text-stone-500 font-bold ml-auto">
              تغییر دستی وضعیت سفارش:
            </span>
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
              <span>در حال آماده‌سازی</span>
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
              <span>تحویل شده</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
