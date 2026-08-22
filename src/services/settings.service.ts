import "server-only";
import {
  FooterConfig,
  UpdateSettingsInput,
} from "@/domain/validations/settings.schema";
import { FAQItem } from "@/domain/validations/faq.schema";
import { ContentService } from "@/services/content.service";
import { FaqService } from "@/services/faq.service";

export class SettingsService {
  static async getSettings(): Promise<{
    siteSubtitle: string;
    siteFaq: FAQItem[];
    siteFooter: FooterConfig;
  }> {
    const siteContent = await ContentService.getSiteContent();
    const faqs = await FaqService.getAllFaqs();

    return {
      siteSubtitle: siteContent.layout.brandSubtitle,
      siteFaq: faqs,
      siteFooter: {
        phones: siteContent.layout.phones,
        address: siteContent.layout.address,
        eitaa: siteContent.layout.eitaa,
        website: siteContent.layout.website,
      },
    };
  }

  static async updateSetting(input: UpdateSettingsInput): Promise<boolean> {
    const current = await ContentService.getSiteContent();

    if (input.key === "site_subtitle") {
      await ContentService.updateSection("layout", {
        ...current.layout,
        brandSubtitle: input.value,
      });
    } else if (input.key === "site_footer") {
      await ContentService.updateSection("layout", {
        ...current.layout,
        phones: input.value.phones,
        address: input.value.address,
        eitaa: input.value.eitaa,
        website: input.value.website,
      });
    }

    return true;
  }
}
