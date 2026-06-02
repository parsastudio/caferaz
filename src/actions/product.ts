"use server";

import {
  getProductWithPricing,
  updateProductDetails,
  ProductWithPricing,
} from "@/lib/mock-db";
import { ActionResponse } from "./comment";
import { revalidatePath } from "next/cache";
import { checkAdminAuth } from "@/actions/auth";

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
  pricePerKgArabica: number;
  pricePerKgRobusta: number;
  stockGrams: number;
}): Promise<ActionResponse<boolean>> {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return { success: false, error: "دسترسی غیرمجاز." };
    }

    const { productId, pricePerKgArabica, pricePerKgRobusta, stockGrams } =
      payload;

    if (
      !productId ||
      pricePerKgArabica <= 0 ||
      pricePerKgRobusta <= 0 ||
      stockGrams < 0
    ) {
      return {
        success: false,
        error:
          "تمامی فیلدهای مربوط به قیمت‌گذاری و موجودی باید به درستی تکمیل گردند.",
      };
    }

    const product = getProductWithPricing(productId);
    if (!product) {
      return {
        success: false,
        error: "محصول مورد نظر یافت نشد.",
      };
    }

    const updated = updateProductDetails(
      productId,
      product.name,
      product.description,
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
      message: "نرخ‌های پایه و موجودی انبار با موفقیت به روزرسانی شدند.",
    };
  } catch (error) {
    return { success: false, error: "خطا در ذخیره جزئیات جدید محصول رخ داد." };
  }
}

export async function updateProductBasicInfoAction(payload: {
  productId: string;
  name: string;
  description: string;
}): Promise<ActionResponse<boolean>> {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return { success: false, error: "دسترسی غیرمجاز." };
    }

    const { productId, name, description } = payload;

    if (!productId || !name.trim() || !description.trim()) {
      return {
        success: false,
        error: "تکمیل نام و توضیحات کالا الزامی است.",
      };
    }

    const product = getProductWithPricing(productId);
    if (!product) {
      return {
        success: false,
        error: "محصول مورد نظر یافت نشد.",
      };
    }

    const updated = updateProductDetails(
      productId,
      name,
      description,
      product.pricing?.pricePerKgArabica || 2200000,
      product.pricing?.pricePerKgRobusta || 1800000,
      product.stock_grams,
    );

    if (!updated) {
      return {
        success: false,
        error: "خطا در بروزرسانی مشخصات کالا.",
      };
    }

    revalidatePath("/");
    revalidatePath("/admin/settings");

    return {
      success: true,
      data: true,
      message: "عنوان و توضیحات تخصصی کالا با موفقیت بروزرسانی شد.",
    };
  } catch {
    return {
      success: false,
      error: "خطا در ذخیره‌سازی اطلاعات پایه محصول.",
    };
  }
}
