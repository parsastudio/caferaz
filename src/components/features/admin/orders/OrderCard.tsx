"use client";

import React from "react";
import {
  User,
  MapPin,
  Phone,
  Calendar,
  ShoppingBag,
  Loader2,
} from "lucide-react";
import { Order, OrderStatus } from "@/domain/types";
import { Badge } from "@/components/ui/badge";
import OrderActions from "@/components/features/admin/orders/OrderActions";

interface OrderCardProps {
  order: Order;
  isUpdating: boolean;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
  onDelete: (orderId: string) => void;
}

export default function OrderCard({
  order,
  isUpdating,
  onStatusChange,
  onDelete,
}: OrderCardProps) {
  return (
    <div className="bg-stone-900/30 border border-stone-800 rounded-2xl p-5 space-y-4 text-right animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-855 pb-3">
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
          {isUpdating ? (
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

      <div className="flex items-start gap-1.5 bg-stone-950/40 p-3 rounded-xl border border-stone-855">
        <MapPin className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
        <span className="text-[11px] text-stone-400 leading-relaxed font-medium">
          آدرس تحویل: {order.customerAddress}
        </span>
      </div>

      <OrderActions
        orderId={order.id}
        currentStatus={order.status}
        isUpdating={isUpdating}
        onStatusChange={onStatusChange}
        onDelete={onDelete}
      />
    </div>
  );
}
