import "server-only";
import { prisma } from "@/lib/prisma";
import {
  SiteContent,
  siteContentSchema,
} from "@/domain/validations/content.schema";
import { DEFAULT_SITE_CONTENT } from "@/lib/content/default-content";
import { deepMergeContent } from "@/lib/content/site-content";
import { setNestedValue } from "@/lib/content/content-flattener";
import { Prisma } from "@prisma/client";

export class ContentService {
  static async getSiteContent(): Promise<SiteContent> {
    try {
      const opt = await prisma.option.findUnique({
        where: { key: "site_content" },
      });

      if (!opt || !opt.value) {
        return DEFAULT_SITE_CONTENT;
      }

      return deepMergeContent(DEFAULT_SITE_CONTENT, opt.value);
    } catch {
      return DEFAULT_SITE_CONTENT;
    }
  }

  static async updateSiteContent(
    content: Partial<SiteContent>,
  ): Promise<boolean> {
    const current = await this.getSiteContent();
    const merged = deepMergeContent(current, content);

    const validated = siteContentSchema.safeParse(merged);
    if (!validated.success) {
      throw new Error(
        "داده‌های ارسالی با ساختار استاندارد متون سایت مطابقت ندارند.",
      );
    }

    await prisma.option.upsert({
      where: { key: "site_content" },
      update: { value: validated.data as unknown as Prisma.InputJsonValue },
      create: {
        key: "site_content",
        value: validated.data as unknown as Prisma.InputJsonValue,
      },
    });

    return true;
  }

  static async updateSingleKey(
    path: string,
    newValue: string,
  ): Promise<boolean> {
    const current = await this.getSiteContent();
    const updatedObj = setNestedValue(
      current as unknown as Record<string, unknown>,
      path,
      newValue,
    );
    return await this.updateSiteContent(updatedObj as unknown as SiteContent);
  }
}
