"use server";

import { revalidatePath } from "next/cache";
import { checkAdminAuth } from "@/actions/admin-auth";
import { SettingsService } from "@/services/settings.service";
import {
  updateSettingsSchema,
  type UpdateSettingsInput,
} from "@/domain/validations/settings.schema";

export async function getSettingsAction() {
  try {
    const data = await SettingsService.getSettings();
    return {
      success: true,
      data,
    };
  } catch {
    return { success: false, error: "خطا در دریافت تنظیمات پیش‌آمد." };
  }
}

export async function updateSettingsAction(payload: UpdateSettingsInput) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return { success: false, error: "دسترسی غیرمجاز." };
    }

    const validated = updateSettingsSchema.safeParse(payload);
    if (!validated.success) {
      return {
        success: false,
        error:
          validated.error.issues[0]?.message ||
          "اطلاعات تنظیمی ارسالی نامعتبر است.",
      };
    }

    await SettingsService.updateSetting(validated.data);

    revalidatePath("/");
    revalidatePath("/admin/settings");
    return { success: true, message: "تنظیمات با موفقیت ذخیره شدند." };
  } catch {
    return { success: false, error: "خطای ناشناخته در سرور رخ داد." };
  }
}
