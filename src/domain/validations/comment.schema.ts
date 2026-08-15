import { z } from "zod";

export const commentStatusSchema = z.enum([
  "pending",
  "approved",
  "rejected",
  "spam",
]);

export const submitCommentSchema = z.object({
  productId: z.string().min(1, "شناسه محصول نامعتبر است."),
  phone: z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val || /^09[0-9]{9}$/.test(val), {
      message: "شماره موبایل وارد شده نامعتبر است.",
    }),
  firstName: z
    .string()
    .min(1, "لطفاً نام خود را وارد کنید")
    .min(2, "نام باید حداقل ۲ حرف باشد")
    .max(50, "نام بیش از حد طولانی است"),
  commentText: z
    .string()
    .min(1, "لطفاً متن دیدگاه خود را وارد کنید")
    .min(5, "دیدگاه باید حداقل ۵ کاراکتر باشد")
    .max(1000, "دیدگاه بیش از حد طولانی است"),
  rating: z.number().min(1).max(5).nullable().optional(),
  parentId: z.string().nullable().optional(),
});

export const editCommentSchema = z.object({
  commentId: z.string().min(1, "شناسه دیدگاه الزامی است."),
  commentText: z.string().min(1, "متن دیدگاه نمی‌تواند خالی باشد."),
});

export type CommentStatus = z.infer<typeof commentStatusSchema>;
export type SubmitCommentInput = z.infer<typeof submitCommentSchema>;
export type EditCommentInput = z.infer<typeof editCommentSchema>;
