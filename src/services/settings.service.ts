import "server-only";
import { prisma } from "@/lib/prisma";
import {
  FooterConfig,
  FAQItem,
  UpdateSettingsInput,
} from "@/domain/validations/settings.schema";
import { Prisma } from "@prisma/client";
import { ContentService } from "@/services/content.service";

export class SettingsService {
  static async getSettings(): Promise<{
    siteSubtitle: string;
    siteFaq: FAQItem[];
    siteFooter: FooterConfig;
  }> {
    const siteContent = await ContentService.getSiteContent();

    const siteSubtitleOpt = await prisma.option.findUnique({
      where: { key: "site_subtitle" },
    });
    const siteFooterOpt = await prisma.option.findUnique({
      where: { key: "site_footer" },
    });

    const siteSubtitle = siteSubtitleOpt
      ? (siteSubtitleOpt.value as string)
      : siteContent.layout.brandSubtitle;

    const siteFooter = siteFooterOpt
      ? (siteFooterOpt.value as unknown as FooterConfig)
      : {
          phones: ["09002570060", "09002570040", "021-77311806"],
          address: "تهران، کافه راز",
          eitaa: "https://eitaa.com/razcoffee",
          website: "https://caferaz.ir",
        };

    return {
      siteSubtitle,
      siteFaq: siteContent.faq.items,
      siteFooter,
    };
  }

  static async updateSetting(input: UpdateSettingsInput): Promise<boolean> {
    await prisma.option.upsert({
      where: { key: input.key },
      update: { value: input.value as unknown as Prisma.InputJsonValue },
      create: {
        key: input.key,
        value: input.value as unknown as Prisma.InputJsonValue,
      },
    });

    if (input.key === "site_faq") {
      await ContentService.updateSection("faq", {
        badge: "پاسخ به ابهامات شما",
        title: "سوالات متداول مشتریان",
        description:
          "پاسخ به رایج‌ترین پرسش‌های ثبت سفارش، نوع ارسال و فرآیند دم‌آوری قهوه‌های کافه راز.",
        items: input.value as FAQItem[],
      });
    }

    return true;
  }
}
