import { z } from "zod";
import { phoneSchema, otpCodeSchema } from "@/domain/validations/auth.schema";

export const orderStatusSchema = z.enum([
  "unreviewed",
  "pending",
  "completed",
  "cancelled",
]);

export const checkoutFormSchema = z.object({
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
  phone: phoneSchema,
  destination: z.enum(["tehran", "other"]).default("tehran"),
  postalCode: z.string().optional(),
  paymentMethod: z.enum(["cod", "online"]).default("cod"),
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

export const serverOrderSchema = z.object({
  productId: z.string().min(1, "شناسه کالا نامعتبر است."),
  weightGrams: z.number().min(250, "حداقل وزن سفارش ۲۵۰ گرم است."),
  quantity: z.number().min(1, "تعداد بسته‌ها باید حداقل ۱ عدد باشد."),
  blend: z.string().min(1, "انتخاب ترکیب دانه‌ها الزامی است."),
  grind: z.string().min(1, "انتخاب نوع آسیاب الزامی است."),
  customerName: z
    .string()
    .min(2, "نام و نام خانوادگی باید حداقل ۲ کاراکتر باشد.")
    .max(100, "نام وارد شده بیش از حد طولانی است."),
  customerPhone: phoneSchema,
  customerAddress: z
    .string()
    .min(10, "آدرس محل تحویل باید حداقل ۱۰ کاراکتر باشد.")
    .max(500, "آدرس وارد شده بیش از حد طولانی است."),
  otp: z.preprocess(
    (val) => (typeof val === "string" && val.trim() === "" ? undefined : val),
    otpCodeSchema.optional(),
  ),
  appliedCouponCode: z.string().nullable().optional(),
});

export type OrderStatus = z.infer<typeof orderStatusSchema>;
export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;
export type ServerOrderPayload = z.infer<typeof serverOrderSchema>;
