"use server";

import { revalidatePath } from "next/cache";
import { checkAdminAuth } from "@/actions/admin-auth";
import { ContentService } from "@/services/content.service";
import { ProductService } from "@/services/product.service";
import {
  SiteContent,
  siteContentSchema,
} from "@/domain/validations/content.schema";
import { ActionResponse } from "@/types/actions";

export async function getSiteContentAction(): Promise<
  ActionResponse<SiteContent>
> {
  try {
    const data = await ContentService.getSiteContent();
    return { success: true, data };
  } catch {
    return { success: false, error: "خطا در بارگذاری محتوای متنی سایت." };
  }
}

export async function updateSiteContentSectionAction<
  K extends keyof SiteContent,
>(section: K, data: SiteContent[K]): Promise<ActionResponse<boolean>> {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return { success: false, error: "دسترسی غیرمجاز." };
    }

    const sectionSchema = siteContentSchema.shape[section];
    const validated = sectionSchema.safeParse(data);
    if (!validated.success) {
      return {
        success: false,
        error:
          validated.error.issues[0]?.message || "اطلاعات ارسالی نامعتبر است.",
      };
    }

    await ContentService.updateSection(
      section,
      validated.data as SiteContent[K],
    );

    revalidatePath("/");
    revalidatePath("/profile");
    revalidatePath("/login");
    revalidatePath("/admin/settings");

    return {
      success: true,
      data: true,
      message: "تغییرات با موفقیت ذخیره گردید.",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "خطا در ذخیره‌سازی بخش محتوا.",
    };
  }
}

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

      revalidatePath("/");
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

    revalidatePath("/");
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
