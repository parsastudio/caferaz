"use client";

import React, { useState } from "react";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { submitCommentAction } from "@/actions/comment";
import {
  commentFormSchema,
  type CommentFormValues,
} from "@/domain/validations/comment.schema";

export type { CommentFormValues };

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
    resolver: zodResolver(
      commentFormSchema,
    ) as unknown as Resolver<CommentFormValues>,
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
          phone: values.phone?.trim() || undefined,
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
