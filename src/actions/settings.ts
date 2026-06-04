"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { checkAdminAuth } from "@/actions/auth";
import { FAQ } from "@/components/features/landing/FAQSection";

interface FooterConfig {
  phones: string[];
  address: string;
  eitaa: string;
  website: string;
}

export async function getSettingsAction() {
  try {
    const siteSubtitleOpt = await prisma.option.findUnique({
      where: { key: "site_subtitle" },
    });
    const siteFaqOpt = await prisma.option.findUnique({
      where: { key: "site_faq" },
    });
    const siteFooterOpt = await prisma.option.findUnique({
      where: { key: "site_footer" },
    });

    const siteSubtitle = siteSubtitleOpt
      ? (siteSubtitleOpt.value as string)
      : "";
    const siteFaq = siteFaqOpt ? (siteFaqOpt.value as unknown as FAQ[]) : [];
    const siteFooter = siteFooterOpt
      ? (siteFooterOpt.value as unknown as FooterConfig)
      : { phones: [], address: "", eitaa: "", website: "" };

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

    await prisma.option.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    revalidatePath("/");
    revalidatePath("/admin/settings");
    return { success: true, message: "تنظیمات با موفقیت ذخیره شدند." };
  } catch {
    return { success: false, error: "خطای ناشناخته در سرور رخ داد." };
  }
}
