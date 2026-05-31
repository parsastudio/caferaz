"use server";

import { createOrder, getOrders } from "@/lib/mock-db";
import { revalidatePath } from "next/cache";

export async function getOrdersAction() {
  try {
    const orders = getOrders();
    return { success: true, data: orders };
  } catch (error) {
    return { success: false, error: "خطا در دریافت تاریخچه سفارش‌ها رخ داد." };
  }
}

export async function submitOrderAction(payload: {
  productId: string;
  weightGrams: number;
  quantity: number;
  grindType: string;
  finalPrice: number;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
}) {
  try {
    const {
      productId,
      weightGrams,
      quantity,
      grindType,
      finalPrice,
      customerName,
      customerPhone,
      customerAddress,
    } = payload;

    if (
      !productId ||
      !weightGrams ||
      !quantity ||
      !grindType ||
      !finalPrice ||
      !customerName ||
      !customerPhone ||
      !customerAddress
    ) {
      return {
        success: false,
        error: "اطلاعات ارسالی برای ثبت سفارش ناقص است.",
      };
    }

    const newOrder = createOrder({
      productId,
      weightGrams: Number(weightGrams),
      quantity: Number(quantity),
      grindType,
      finalPrice: Number(finalPrice),
      customerName,
      customerPhone,
      customerAddress,
    });

    revalidatePath("/");

    return {
      success: true,
      data: newOrder,
    };
  } catch (error) {
    return {
      success: false,
      error: "خطایی در فرآیند نهایی‌سازی سفارش رخ داد.",
    };
  }
}
