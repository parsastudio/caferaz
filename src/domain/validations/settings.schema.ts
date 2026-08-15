import { z } from "zod";

export const faqItemSchema = z.object({
  question: z.string().min(1, "عنوان سوال نمی‌تواند خالی باشد."),
  answer: z.string().min(1, "پاسخ سوال نمی‌تواند خالی باشد."),
});

export const footerConfigSchema = z.object({
  phones: z.array(z.string()),
  address: z.string(),
  eitaa: z.string(),
  website: z.string(),
  instagram: z.string().optional(),
  telegram: z.string().optional(),
});

export const updateSettingsSchema = z.discriminatedUnion("key", [
  z.object({
    key: z.literal("site_subtitle"),
    value: z.string(),
  }),
  z.object({
    key: z.literal("site_faq"),
    value: z.array(faqItemSchema),
  }),
  z.object({
    key: z.literal("site_footer"),
    value: footerConfigSchema,
  }),
]);

export type FAQItem = z.infer<typeof faqItemSchema>;
export type FooterConfig = z.infer<typeof footerConfigSchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
