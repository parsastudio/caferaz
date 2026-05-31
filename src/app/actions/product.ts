"use server";

import { getProductWithPricing } from "@/lib/mock-db";

export async function getProductAction(productId: string) {
  try {
    if (!productId) {
      return { success: false, error: "شناسه محصول ارسال نشده است." };
    }

    const product = getProductWithPricing(productId);

    if (!product) {
      return { success: false, error: "محصول مورد نظر یافت نشد." };
    }

    return { success: true, data: product };
  } catch (error) {
    return { success: false, error: "خطا در دریافت اطلاعات محصول رخ داد." };
  }
}
