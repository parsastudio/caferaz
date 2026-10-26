"use server";

import { revalidatePath } from "next/cache";
import { checkAdminAuth } from "@/actions/admin-auth";
import { ContentService } from "@/services/content.service";
import { ProductService } from "@/services/product.service";
import { ActionResponse } from "@/types/actions";

export async function updateSingleContentKeyAction(
  path: string,
  newValue: string,
  productId?: string,
): Promise<ActionResponse<boolean>> {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return { success: false, error: "دسترسی غیرمجاز." };
    }

    const trimmedPath = path.trim();
    if (!trimmedPath) {
      return { success: false, error: "مسیر فیلد معتبر نیست." };
    }

    if (
      trimmedPath === "product.name" ||
      trimmedPath === "product.description"
    ) {
      let targetProductId = productId;
      let currentProduct = null;

      if (!targetProductId) {
        currentProduct = await ProductService.getMainProduct();
        targetProductId = currentProduct?.id;
      } else {
        currentProduct = await ProductService.getMainProduct();
      }

      if (!targetProductId || !currentProduct) {
        return { success: false, error: "کالای هدف در پایگاه داده یافت نشد." };
      }

      const updatedName =
        trimmedPath === "product.name" ? newValue : currentProduct.name;
      const updatedDescription =
        trimmedPath === "product.description"
          ? newValue
          : currentProduct.description;

      await ProductService.updateProductBasicInfo({
        productId: targetProductId,
        name: updatedName,
        description: updatedDescription,
      });

      revalidatePath("/", "page");
      revalidatePath("/profile");
      revalidatePath("/admin");
      revalidatePath("/admin/pricing");
      revalidatePath("/admin/settings");

      return {
        success: true,
        data: true,
        message: "مشخصات محصول با موفقیت در دیتابیس ذخیره شد.",
      };
    }

    await ContentService.updateSingleKey(trimmedPath, newValue);

    revalidatePath("/", "page");
    revalidatePath("/profile");
    revalidatePath("/login");
    revalidatePath("/admin/settings");

    return {
      success: true,
      data: true,
      message: "تغییر متن با موفقیت در سیستم اعمال شد.",
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "خطا در به‌روزرسانی متن.",
    };
  }
}
