import { z } from "zod";
import { parseJalaliString } from "@/lib/jalali-converter";

const jalaliDateValidator = (val?: string | null) => {
  if (!val || val.trim() === "") return true;
  return parseJalaliString(val) !== null;
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
    .refine(jalaliDateValidator, {
      message: "فرمت تاریخ شمسی آخرین رست نامعتبر است (مثال: 1405/01/24)",
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
