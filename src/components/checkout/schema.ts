import { z } from "zod";
import { toEnglishDigits } from "@/lib/utils";

export const checkoutSchema = z.object({
  firstName: z
    .string()
    .min(1, "لطفاً نام خود را وارد کنید")
    .min(2, "نام باید حداقل ۲ حرف باشد")
    .max(50, "نام بیش از حد طولانی است"),
  lastName: z
    .string()
    .min(1, "لطفاً نام خانوادگی خود را وارد کنید")
    .min(2, "نام خانوادگی باید حداقل ۲ حرف باشد")
    .max(50, "نام خانوادگی بیش از حد طولانی است"),
  phone: z.preprocess(
    (val) => (typeof val === "string" ? toEnglishDigits(val) : val),
    z
      .string()
      .regex(
        /^09[0-9]{9}$/,
        "لطفاً یک شماره موبایل معتبر (مانند ۰۹۱۲۳۴۵۶۷۸۹) وارد کنید",
      ),
  ),
  shippingAddress: z
    .string()
    .min(1, "لطفاً آدرس تحویل را وارد کنید")
    .min(10, "لطفاً آدرس دقیق خود را (حداقل ۱۰ کاراکتر) وارد کنید")
    .max(500, "آدرس بیش از حد طولانی است"),
  otp: z
    .string()
    .optional()
    .refine((val) => !val || (val.length === 4 && /^[0-9]+$/.test(val)), {
      message: "کد تایید ۴ رقمی عددی را به درستی وارد کنید",
    }),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
