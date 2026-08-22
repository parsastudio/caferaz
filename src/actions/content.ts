"use server";

import { revalidatePath } from "next/cache";
import { checkAdminAuth } from "@/actions/admin-auth";
import { ContentService } from "@/services/content.service";
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
