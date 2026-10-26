"use client";

import { useState } from "react";
import { Comment } from "@/domain/types";
import { toast } from "sonner";
import { submitCommentAction } from "@/actions/public-comment";
import {
  deleteCommentAction,
  approveCommentAction,
  rejectCommentAction,
  spamCommentAction,
  editCommentAction,
} from "@/actions/admin-comment";
import {
  insertCommentReply,
  updateCommentInTree,
  removeCommentFromTree,
} from "@/lib/comment-tree";

export function useAdminComments(initialComments: Comment[]) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [replyTargetId, setReplyTargetId] = useState<string | null>(null);
  const [editTargetId, setEditTargetId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "approved" | "rejected" | "spam"
  >("all");

  const pendingCount = comments.filter(
    (c) => c.status === "pending" || !c.status,
  ).length;

  const filteredComments = comments.filter((comment) => {
    const status = comment.status || "pending";
    if (statusFilter === "all") return true;
    return status === statusFilter;
  });

  const handleDelete = async (commentId: string) => {
    try {
      const result = await deleteCommentAction(commentId);
      if (result.success) {
        setComments((prev) => removeCommentFromTree(prev, commentId));
        toast.success("دیدگاه با موفقیت حذف شد.");
      } else {
        toast.error(result.error || "خطا در حذف دیدگاه.");
      }
    } catch {
      toast.error("خطای سیستمی رخ داد.");
    }
  };

  const handleStatusChange = async (
    commentId: string,
    newStatus: "approved" | "rejected" | "spam",
  ) => {
    try {
      let result;
      if (newStatus === "approved") {
        result = await approveCommentAction(commentId);
      } else if (newStatus === "rejected") {
        result = await rejectCommentAction(commentId);
      } else {
        result = await spamCommentAction(commentId);
      }

      if (result.success) {
        toast.success(result.message || "وضعیت دیدگاه تغییر یافت.");
        setComments((prev) =>
          updateCommentInTree(prev, commentId, (node) => ({
            ...node,
            status: newStatus,
          })),
        );
      } else {
        toast.error(result.error || "خطا در تغییر وضعیت دیدگاه.");
      }
    } catch {
      toast.error("خطای ارتباطی با سرور رخ داد.");
    }
  };

  const handleEditSubmit = async (
    commentId: string,
    newText: string,
  ): Promise<boolean> => {
    if (!newText.trim()) {
      toast.error("متن دیدگاه نمی‌تواند خالی باشد.");
      return false;
    }

    try {
      const result = await editCommentAction(commentId, newText);
      if (result.success) {
        toast.success("تغییرات با موفقیت ذخیره شد.");
        setComments((prev) =>
          updateCommentInTree(prev, commentId, (node) => ({
            ...node,
            commentText: newText,
          })),
        );
        setEditTargetId(null);
        return true;
      } else {
        toast.error(result.error || "خطا در ویرایش دیدگاه.");
        return false;
      }
    } catch {
      toast.error("خطا در برقراری ارتباط با سرور.");
      return false;
    }
  };

  const handleReplySubmit = async (
    parentId: string,
    productId: string,
    responderName: string,
    responderText: string,
  ): Promise<boolean> => {
    if (!responderText.trim() || !responderName.trim()) {
      toast.error("لطفاً تمامی فیلدها را پر کنید.");
      return false;
    }

    setIsSubmitting(true);
    try {
      const result = await submitCommentAction({
        productId,
        firstName: responderName,
        commentText: responderText,
        rating: null,
        parentId,
      });

      if (result.success) {
        const newReply = result.data;
        setComments((prev) => insertCommentReply(prev, parentId, newReply));
        toast.success("پاسخ شما با موفقیت ثبت شد.");
        setReplyTargetId(null);
        return true;
      } else {
        toast.error(result.error || "خطا در ثبت پاسخ.");
        return false;
      }
    } catch {
      toast.error("خطای غیرمنتظره رخ داد.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    comments,
    filteredComments,
    pendingCount,
    statusFilter,
    setStatusFilter,
    replyTargetId,
    setReplyTargetId,
    editTargetId,
    setEditTargetId,
    isSubmitting,
    handleDelete,
    handleStatusChange,
    handleEditSubmit,
    handleReplySubmit,
  };
}
