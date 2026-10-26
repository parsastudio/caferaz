import { z } from "zod";
import { parseJalaliString } from "@/lib/date/formatters";

export const couponTypeSchema = z.enum([
  "product_direct",
  "conditional",
  "user_code",
]);

export const discountTypeSchema = z.enum(["percentage", "fixed"]);

const jalaliDateValidator = (val?: string) => {
  if (!val || val.trim() === "") return true;
  return parseJalaliString(val) !== null;
};

export const createCouponSchema = z
  .object({
    code: z.string().optional(),
    type: couponTypeSchema,
    discountType: discountTypeSchema,
    discountValue: z.number().min(1, "مقدار تخفیف باید بزرگتر از صفر باشد"),
    productId: z.string().optional(),
    minWeightGrams: z.number().optional(),
    validFrom: z.string().optional().refine(jalaliDateValidator, {
      message:
        "مقدار روزهای ماه یا فرمت تاریخ شروع شمسی نامعتبر است (YYYY/MM/DD)",
    }),
    validTo: z.string().optional().refine(jalaliDateValidator, {
      message:
        "مقدار روزهای ماه یا فرمت تاریخ انقضا شمسی نامعتبر است (YYYY/MM/DD)",
    }),
    maxDiscountAmount: z.number().optional(),
    isActive: z.boolean().default(true),
    allowStacking: z.boolean().optional().default(false),
  })
  .refine(
    (data) => {
      if (
        data.type === "user_code" &&
        (!data.code || data.code.trim().length < 2)
      ) {
        return false;
      }
      return true;
    },
    {
      message:
        "ورود کردن کد تخفیف برای کوپن‌های دستی کاربر الزامی است (حداقل ۲ کاراکتر)",
      path: ["code"],
    },
  );

export const validateCouponInputSchema = z.object({
  code: z.string().min(1, "کد تخفیف نمی‌تواند خالی باشد."),
  phone: z.string().nullable().optional(),
  productId: z.string().min(1, "شناسه کالا الزامی است."),
  weightGrams: z.number().min(1, "وزن نامعتبر است."),
  quantity: z.number().min(1, "تعداد نامعتبر است."),
  blend: z.string().min(1, "ترکیب دانه‌ها الزامی است."),
});

export type CouponType = z.infer<typeof couponTypeSchema>;
export type DiscountType = z.infer<typeof discountTypeSchema>;
export type CreateCouponInput = z.infer<typeof createCouponSchema>;
export type ValidateCouponInput = z.infer<typeof validateCouponInputSchema>;
