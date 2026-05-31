"use server";

import { getProductWithPricing, ProductWithPricing } from "@/lib/mock-db";
import { ActionResponse } from "./comment";

export async function getProductAction(
  productId: string,
): Promise<ActionResponse<ProductWithPricing>> {
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
