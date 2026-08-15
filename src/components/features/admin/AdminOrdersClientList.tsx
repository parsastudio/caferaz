"use client";

import React, { useState } from "react";
import { Order, OrderStatus } from "@/domain/types";
import {
  updateOrderStatusAction,
  deleteOrderAction,
} from "@/actions/admin-order";
import { toast } from "sonner";
import OrderFilterTabs from "@/components/features/admin/orders/OrderFilterTabs";
import OrderCard from "@/components/features/admin/orders/OrderCard";

interface AdminOrdersClientListProps {
  initialOrders: Order[];
}

export default function AdminOrdersClientList({
  initialOrders,
}: AdminOrdersClientListProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");

  const handleStatusChange = async (
    orderId: string,
    newStatus: OrderStatus,
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
      <OrderFilterTabs
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        totalCount={totalCount}
        unreviewedCount={unreviewedCount}
        pendingCount={pendingCount}
        completedCount={completedCount}
        cancelledCount={cancelledCount}
      />

      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-stone-850 bg-stone-900/10 rounded-2xl">
          <p className="text-xs text-stone-500">
            سفارشی در این بخش ثبت نشده است.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              isUpdating={updatingId === order.id}
              onStatusChange={handleStatusChange}
              onDelete={handleDeleteOrder}
            />
          ))}
        </div>
      )}
    </div>
  );
}
