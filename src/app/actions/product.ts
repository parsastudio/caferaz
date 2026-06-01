"use server";

import {
  getProductWithPricing,
  updateProductDetails,
  ProductWithPricing,
} from "@/lib/mock-db";
import { ActionResponse } from "./comment";
import { revalidatePath } from "next/cache";

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

export async function updateProductDetailsAction(payload: {
  productId: string;
  name: string;
  description: string;
  pricePerKgArabica: number;
  pricePerKgRobusta: number;
  stockGrams: number;
}): Promise<ActionResponse<boolean>> {
  try {
    const {
      productId,
      name,
      description,
      pricePerKgArabica,
      pricePerKgRobusta,
      stockGrams,
    } = payload;

    if (
      !productId ||
      !name.trim() ||
      !description.trim() ||
      pricePerKgArabica <= 0 ||
      pricePerKgRobusta <= 0 ||
      stockGrams < 0
    ) {
      return {
        success: false,
        error:
          "تمامی فیلدهای مربوط به کالا، قیمت‌گذاری و موجودی باید به درستی تکمیل گردند.",
      };
    }

    const updated = updateProductDetails(
      productId,
      name,
      description,
      pricePerKgArabica,
      pricePerKgRobusta,
      stockGrams,
    );
    if (!updated) {
      return {
        success: false,
        error: "محصول مورد نظر جهت تغییر اطلاعات یافت نشد.",
      };
    }

    revalidatePath("/");
    revalidatePath("/admin/pricing");

    return {
      success: true,
      data: true,
      message:
        "اطلاعات محصول، نرخ‌های پایه و موجودی انبار با موفقیت به روزرسانی شدند.",
    };
  } catch (error) {
    return { success: false, error: "خطا در ذخیره جزئیات جدید محصول رخ داد." };
  }
}
