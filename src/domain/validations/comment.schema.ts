import { z } from "zod";
import { isValidIranianPhone } from "@/lib/phone";

export const commentStatusSchema = z.enum([
  "pending",
  "approved",
  "rejected",
  "spam",
]);

export const commentFormSchema = z.object({
  firstName: z
    .string()
    .min(1, "لطفاً نام خود را وارد کنید")
    .min(2, "نام باید حداقل ۲ حرف باشد")
    .max(50, "نام بیش از حد طولانی است"),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || isValidIranianPhone(val), {
      message: "لطفاً یک شماره موبایل معتبر (مانند ۰۹۱۲۳۴۵۶۷۸۹) وارد کنید",
    }),
  rating: z.number().min(1).max(5).nullable().optional(),
  commentText: z
    .string()
    .min(1, "لطفاً متن دیدگاه خود را وارد کنید")
    .min(5, "دیدگاه باید حداقل ۵ کاراکتر باشد")
    .max(1000, "دیدگاه بیش از حد طولانی است"),
});

export const submitCommentSchema = commentFormSchema.extend({
  productId: z.string().min(1, "شناسه محصول نامعتبر است."),
  parentId: z.string().nullable().optional(),
});

export const editCommentSchema = z.object({
  commentId: z.string().min(1, "شناسه دیدگاه الزامی است."),
  commentText: z
    .string()
    .min(1, "متن دیدگاه نمی‌تواند خالی باشد.")
    .min(5, "دیدگاه باید حداقل ۵ کاراکتر باشد")
    .max(1000, "دیدگاه بیش از حد طولانی است"),
});

export type CommentStatus = z.infer<typeof commentStatusSchema>;
export type CommentFormValues = z.infer<typeof commentFormSchema>;
export type SubmitCommentInput = z.infer<typeof submitCommentSchema>;
