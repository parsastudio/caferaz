import "server-only";
import { FooterConfig, FAQItem } from "@/domain/validations/settings.schema";
import { ContentService } from "@/services/content.service";

export class SettingsService {
  static async getSettings(): Promise<{
    siteSubtitle: string;
    siteFaq: FAQItem[];
    siteFooter: FooterConfig;
  }> {
    const siteContent = await ContentService.getSiteContent();

    return {
      siteSubtitle: siteContent.layout.brandSubtitle,
      siteFaq: siteContent.faq.items,
      siteFooter: {
        phones: siteContent.layout.phones,
        address: siteContent.layout.address,
        eitaa: siteContent.layout.eitaa,
        website: siteContent.layout.website,
      },
    };
  }
}
