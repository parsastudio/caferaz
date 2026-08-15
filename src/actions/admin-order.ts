"use server";

import { checkAdminAuth } from "@/actions/admin-auth";
import { ActionResponse } from "@/types/actions";
import { Order } from "@/domain/types";
import { OrderStatus } from "@/domain/validations/order.schema";
import { OrderService } from "@/services/order.service";
import { revalidatePath } from "next/cache";

export async function getOrdersAction(): Promise<ActionResponse<Order[]>> {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return { success: false, error: "دسترسی غیرمجاز." };
    }

    const data = await OrderService.getAllOrders();
    return { success: true, data };
  } catch {
    return { success: false, error: "خطا در دریافت تاریخچه سفارش‌ها رخ داد." };
  }
}

export async function updateOrderStatusAction(
  orderId: string,
  status: OrderStatus,
): Promise<ActionResponse<boolean>> {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return { success: false, error: "دسترسی غیرمجاز." };
    }

    await OrderService.updateOrderStatus(orderId, status);

    revalidatePath("/admin/orders");
    revalidatePath("/profile");
    return {
      success: true,
      data: true,
      message: "وضعیت سفارش با موفقیت به روزرسانی شد.",
    };
  } catch {
    return { success: false, error: "خطا در به روزرسانی وضعیت سفارش." };
  }
}

export async function deleteOrderAction(
  orderId: string,
): Promise<ActionResponse<boolean>> {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return { success: false, error: "دسترسی غیرمجاز." };
    }

    await OrderService.deleteOrder(orderId);

    revalidatePath("/admin/orders");
    revalidatePath("/profile");
    return {
      success: true,
      data: true,
      message: "سفارش مورد نظر با موفقیت از سیستم حذف گردید.",
    };
  } catch {
    return { success: false, error: "خطا در حذف سفارش از دیتابیس." };
  }
}
