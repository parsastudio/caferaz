"use server";

import { ActionResponse } from "@/types/actions";
import { revalidatePath } from "next/cache";
import { checkAdminAuth } from "@/actions/auth";
import { ProductWithPricing } from "@/domain/types";
import { ProductService } from "@/services/product.service";
import {
  updateProductDetailsSchema,
  updateProductBasicInfoSchema,
  type UpdateProductDetailsInput,
  type UpdateProductBasicInfoInput,
} from "@/domain/validations/product.schema";

export async function getMainProductAction(): Promise<
  ActionResponse<ProductWithPricing>
> {
  try {
    const product = await ProductService.getMainProduct();

    if (!product) {
      return { success: false, error: "هیچ محصول فعالی در سیستم یافت نشد." };
    }

    return {
      success: true,
      data: product,
    };
  } catch {
    return {
      success: false,
      error: "خطا در دریافت اطلاعات محصول اصلی رخ داد.",
    };
  }
}

export async function updateProductDetailsAction(
  payload: UpdateProductDetailsInput,
): Promise<ActionResponse<boolean>> {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return { success: false, error: "دسترسی غیرمجاز." };
    }

    const validated = updateProductDetailsSchema.safeParse(payload);
    if (!validated.success) {
      return {
        success: false,
        error:
          validated.error.issues[0]?.message || "اطلاعات ارسالی نامعتبر است.",
      };
    }

    await ProductService.updateProductDetails(validated.data);

    revalidatePath("/");
    revalidatePath("/admin/pricing");

    return {
      success: true,
      data: true,
      message: "نرخ‌های پایه و موجودی انبار با موفقیت به روزرسانی شدند.",
    };
  } catch {
    return { success: false, error: "خطا در ذخیره جزئیات جدید محصول رخ داد." };
  }
}

export async function updateProductBasicInfoAction(
  payload: UpdateProductBasicInfoInput,
): Promise<ActionResponse<boolean>> {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return { success: false, error: "دسترسی غیرمجاز." };
    }

    const validated = updateProductBasicInfoSchema.safeParse(payload);
    if (!validated.success) {
      return {
        success: false,
        error:
          validated.error.issues[0]?.message || "اطلاعات ارسالی نامعتبر است.",
      };
    }

    await ProductService.updateProductBasicInfo(validated.data);

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
