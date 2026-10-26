import { z } from "zod";
import { parseJalaliString } from "@/lib/date/formatters";

const roastDateValidator = (val?: string | null) => {
  if (!val || val.trim() === "") return true;
  const clean = val.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(clean)) {
    const d = new Date(clean);
    return !isNaN(d.getTime());
  }
  return parseJalaliString(clean) !== null;
};

export const updateProductDetailsSchema = z.object({
  productId: z.string().min(1, "شناسه کالا نامعتبر است."),
  pricePerKgArabica: z
    .number()
    .min(1, "قیمت هر کیلوگرم عربیکا باید بزرگتر از صفر باشد."),
  pricePerKgRobusta: z
    .number()
    .min(1, "قیمت هر کیلوگرم روبوستا باید بزرگتر از صفر باشد."),
  stockGrams: z.number().min(0, "موجودی فیزیکی کل نمی‌تواند منفی باشد."),
  tehranDeliveryFee: z
    .number()
    .min(0, "کرایه پیک نمی‌تواند منفی باشد.")
    .optional(),
  lastRoastDate: z
    .string()
    .nullable()
    .optional()
    .refine(roastDateValidator, {
      message: "فرمت تاریخ آخرین رست نامعتبر است.",
    }),
});

export const updateProductBasicInfoSchema = z.object({
  productId: z.string().min(1, "شناسه کالا نامعتبر است."),
  name: z.string().min(1, "نام کالا نمی‌تواند خالی باشد."),
  description: z.string().min(1, "توضیحات کالا نمی‌تواند خالی باشد."),
});

export type UpdateProductDetailsInput = z.infer<
  typeof updateProductDetailsSchema
>;
export type UpdateProductBasicInfoInput = z.infer<
  typeof updateProductBasicInfoSchema
>;
