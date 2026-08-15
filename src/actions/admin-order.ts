"use server";

import { prisma } from "@/lib/prisma";
import { checkAdminAuth } from "@/actions/admin-auth";
import { ActionResponse } from "@/types/actions";
import { Order } from "@/types";
import { revalidatePath } from "next/cache";

export async function getOrdersAction(): Promise<ActionResponse<Order[]>> {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return { success: false, error: "دسترسی غیرمجاز." };
    }

    const orders = await prisma.order.findMany({
      include: { orderItems: true },
      orderBy: { createdAt: "desc" },
    });

    const data: Order[] = orders.map((o) => {
      const item = o.orderItems[0];
      return {
        id: o.id,
        productId: item?.productId ?? "prod_coffee_bulk_01",
        weightGrams: item?.weightGrams ?? 250,
        quantity: item?.quantity ?? 1,
        grindType: item?.grindType ?? "",
        finalPrice: o.finalPrice,
        customerName: o.customerName,
        customerPhone: o.customerPhone,
        customerAddress: o.customerAddress,
        createdAt: o.createdAt.toISOString(),
        status: o.status as Order["status"],
      };
    });

    return { success: true, data };
  } catch {
    return { success: false, error: "خطا در دریافت تاریخچه سفارش‌ها رخ داد." };
  }
}

export async function updateOrderStatusAction(
  orderId: string,
  status: "unreviewed" | "pending" | "completed" | "cancelled",
): Promise<ActionResponse<boolean>> {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return { success: false, error: "دسترسی غیرمجاز." };
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

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

    await prisma.order.delete({
      where: { id: orderId },
    });

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
