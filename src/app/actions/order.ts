"use server";

import {
  createOrder,
  getOrders,
  getProductWithPricing,
  Order,
} from "@/lib/mock-db";
import {
  getBlendProfile,
  calculatePriceMetrics,
} from "@/lib/coffee-calculations";
import { revalidatePath } from "next/cache";
import { ActionResponse } from "./comment";

export async function getOrdersAction(): Promise<ActionResponse<Order[]>> {
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
  blend: string;
  grind: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
}): Promise<ActionResponse<Order>> {
  try {
    const {
      productId,
      weightGrams,
      quantity,
      blend,
      grind,
      customerName,
      customerPhone,
      customerAddress,
    } = payload;

    if (
      !productId ||
      !weightGrams ||
      !quantity ||
      !blend ||
      !grind ||
      !customerName ||
      !customerPhone ||
      !customerAddress
    ) {
      return {
        success: false,
        error: "اطلاعات ارسالی برای ثبت سفارش ناقص است.",
      };
    }

    const product = getProductWithPricing(productId);
    if (!product) {
      return {
        success: false,
        error: "محصول مورد نظر یافت نشد.",
      };
    }

    const blendProfile = getBlendProfile(blend);
    const priceMetrics = calculatePriceMetrics(
      product.pricing,
      blendProfile,
      Number(weightGrams),
      Number(quantity),
    );

    const secureFinalPrice = priceMetrics.finalPrice;

    const newOrder = createOrder({
      productId,
      weightGrams: Number(weightGrams),
      quantity: Number(quantity),
      grindType: `ترکیب: ${blend} | آسیاب: ${grind}`,
      finalPrice: secureFinalPrice,
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
      error: "خطایی در فرآیند محاسبات و ثبت نهایی سفارش رخ داد.",
    };
  }
}
