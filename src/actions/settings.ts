"use server";

import { updateOption, getOption } from "@/lib/mock-db";
import { revalidatePath } from "next/cache";
import { checkAdminAuth } from "@/actions/auth";

export async function getSettingsAction() {
  try {
    const siteSubtitle = getOption("site_subtitle") || "";
    const siteFaq = getOption("site_faq") || [];
    const siteFooter = getOption("site_footer") || {
      phones: [],
      address: "",
      eitaa: "",
      website: "",
    };

    return {
      success: true,
      data: {
        siteSubtitle,
        siteFaq,
        siteFooter,
      },
    };
  } catch {
    return { success: false, error: "خطا در دریافت تنظیمات پیش‌آمد." };
  }
}

export async function updateSettingsAction(payload: {
  key: "site_subtitle" | "site_faq" | "site_footer";
  value: any;
}) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return { success: false, error: "دسترسی غیرمجاز." };
    }

    const { key, value } = payload;
    const success = updateOption(key, value);
    if (!success) {
      return { success: false, error: "خطا در ذخیره‌سازی تنظیمات." };
    }
    revalidatePath("/");
    revalidatePath("/admin/settings");
    return { success: true, message: "تنظیمات با موفقیت ذخیره شدند." };
  } catch {
    return { success: false, error: "خطای ناشناخته در سرور رخ داد." };
  }
}
