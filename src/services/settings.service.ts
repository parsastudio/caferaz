import "server-only";
import { prisma } from "@/lib/prisma";
import {
  FooterConfig,
  FAQItem,
  UpdateSettingsInput,
} from "@/domain/validations/settings.schema";
import { Prisma } from "@prisma/client";

export class SettingsService {
  static async getSettings(): Promise<{
    siteSubtitle: string;
    siteFaq: FAQItem[];
    siteFooter: FooterConfig;
  }> {
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
    const siteFaq = siteFaqOpt
      ? (siteFaqOpt.value as unknown as FAQItem[])
      : [];
    const siteFooter = siteFooterOpt
      ? (siteFooterOpt.value as unknown as FooterConfig)
      : { phones: [], address: "", eitaa: "", website: "" };

    return {
      siteSubtitle,
      siteFaq,
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

    return true;
  }
}
