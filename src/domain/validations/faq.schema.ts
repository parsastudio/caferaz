import { z } from "zod";

export const faqEntitySchema = z.object({
  id: z.string(),
  question: z.string().min(2, "صورت سوال باید حداقل ۲ حرف باشد."),
  answer: z.string().min(2, "پاسخ سوال باید حداقل ۲ حرف باشد."),
});

export const createFaqSchema = z.object({
  question: z.string().min(2, "صورت سوال باید حداقل ۲ حرف باشد."),
  answer: z.string().min(2, "پاسخ سوال باید حداقل ۲ حرف باشد."),
});

export const updateFaqSchema = z.object({
  id: z.string().min(1, "شناسه سوال الزامی است."),
  question: z.string().min(2, "صورت سوال باید حداقل ۲ حرف باشد."),
  answer: z.string().min(2, "پاسخ سوال باید حداقل ۲ حرف باشد."),
});

export type FAQItem = z.infer<typeof faqEntitySchema>;
export type CreateFaqInput = z.infer<typeof createFaqSchema>;
export type UpdateFaqInput = z.infer<typeof updateFaqSchema>;
