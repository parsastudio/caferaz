import { z } from "zod";
import { toEnglishDigits } from "@/lib/utils";

export const phoneSchema = z.preprocess(
  (val) => (typeof val === "string" ? toEnglishDigits(val.trim()) : val),
  z
    .string()
    .regex(
      /^09[0-9]{9}$/,
      "لطفاً یک شماره موبایل معتبر (مانند ۰۹۱۲۳۴۵۶۷۸۹) وارد کنید.",
    ),
);

export const otpCodeSchema = z
  .string()
  .length(4, "کد تایید پیامکی باید دقیقاً ۴ رقم باشد.")
  .regex(/^[0-9]+$/, "کد تایید پیامکی باید عددی باشد.");

export const adminLoginSchema = z.object({
  username: z.string().min(1, "نام کاربری الزامی است."),
  password: z.string().min(1, "رمز عبور الزامی است."),
});

export const updateAdminPasswordSchema = z.object({
  oldPass: z.string().min(1, "رمز عبور فعلی الزامی است."),
  newPass: z.string().min(6, "رمز عبور جدید باید حداقل ۶ کاراکتر باشد."),
});

export const sendOtpSchema = z.object({
  phone: phoneSchema,
});

export const loginUserWithOtpSchema = z.object({
  phone: phoneSchema,
  otp: otpCodeSchema,
});

export const registerUserSchema = z.object({
  phone: phoneSchema,
  name: z.string().min(2, "نام و نام خانوادگی باید حداقل ۲ حرف باشد."),
  address: z.string().min(5, "آدرس باید حداقل ۵ کاراکتر باشد."),
  otp: otpCodeSchema,
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
export type UpdateAdminPasswordInput = z.infer<
  typeof updateAdminPasswordSchema
>;
export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type LoginUserWithOtpInput = z.infer<typeof loginUserWithOtpSchema>;
export type RegisterUserInput = z.infer<typeof registerUserSchema>;
