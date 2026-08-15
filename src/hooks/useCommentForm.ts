"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { submitCommentAction } from "@/actions/comment";

export const commentSchema = z.object({
  firstName: z
    .string()
    .min(1, "لطفاً نام خود را وارد کنید")
    .min(2, "نام باید حداقل ۲ حرف باشد")
    .max(50, "نام بیش از حد طولانی است"),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || /^09[0-9]{9}$/.test(val), {
      message: "لطفاً یک شماره موبایل معتبر (مانند ۰۹۱۲۳۴۵۶۷۸۹) وارد کنید",
    }),
  rating: z.number().min(1).max(5).nullable().optional(),
  commentText: z
    .string()
    .min(1, "لطفاً متن دیدگاه خود را وارد کنید")
    .min(5, "دیدگاه باید حداقل ۵ کاراکتر باشد")
    .max(1000, "دیدگاه بیش از حد طولانی است"),
});

export type CommentFormValues = z.infer<typeof commentSchema>;

interface UseCommentFormProps {
  productId: string;
  replyParentId: string | null;
  isOpen: boolean;
  onCommentSubmitted: (newComment: {
    id: string;
    firstName: string;
    commentText: string;
    rating: number | null;
    parentId: string | null;
  }) => void;
  startTransition: React.TransitionStartFunction;
}

export function useCommentForm({
  productId,
  replyParentId,
  isOpen,
  onCommentSubmitted,
  startTransition,
}: UseCommentFormProps) {
  const [commentMessage, setCommentMessage] = useState<string | null>(null);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (prevIsOpen !== isOpen) {
    setPrevIsOpen(isOpen);
    if (!isOpen) {
      setCommentMessage(null);
      setCommentError(null);
    }
  }

  const methods = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      firstName: "",
      phone: "",
      rating: 5,
      commentText: "",
    },
    mode: "onTouched",
  });

  const { reset } = methods;

  const onSubmit = async (values: CommentFormValues) => {
    setCommentError(null);
    setCommentMessage(null);

    const tempId = `local_new_${Date.now()}`;

    const newCommentData = {
      id: tempId,
      firstName: values.firstName,
      commentText: values.commentText,
      rating: replyParentId ? null : (values.rating ?? 5),
      parentId: replyParentId,
    };

    startTransition(async () => {
      onCommentSubmitted(newCommentData);

      try {
        const result = await submitCommentAction({
          productId,
          phone: values.phone || null,
          firstName: values.firstName,
          commentText: values.commentText,
          rating: replyParentId ? null : (values.rating ?? 5),
          parentId: replyParentId,
        });

        if (result.success) {
          setCommentMessage(result.message || "دیدگاه شما ثبت گردید.");
          reset();
        } else {
          setCommentError(result.error);
        }
      } catch {
        setCommentError("خطا در ارتباط با سیستم ثبت بازخورد.");
      }
    });
  };

  return {
    methods,
    commentMessage,
    setCommentMessage,
    commentError,
    onSubmit,
  };
}
