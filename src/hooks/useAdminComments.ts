"use client";

import { useState } from "react";
import { Comment } from "@/lib/mock-db";
import { toast } from "sonner";
import {
  submitCommentAction,
  deleteCommentAction,
  approveCommentAction,
  rejectCommentAction,
  spamCommentAction,
  editCommentAction,
} from "@/actions/comment";

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
        setComments((prev) => {
          const filterNode = (list: Comment[]): Comment[] => {
            return list
              .filter((c) => c.id !== commentId)
              .map((c) => ({
                ...c,
                replies: c.replies ? filterNode(c.replies) : [],
              }));
          };
          return filterNode(prev);
        });
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
        setComments((prev) => {
          const updateStatus = (list: Comment[]): Comment[] => {
            return list.map((c) => {
              if (c.id === commentId) {
                return { ...c, status: newStatus };
              }
              return {
                ...c,
                replies: c.replies ? updateStatus(c.replies) : [],
              };
            });
          };
          return updateStatus(prev);
        });
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
        setComments((prev) => {
          const updateText = (list: Comment[]): Comment[] => {
            return list.map((c) => {
              if (c.id === commentId) {
                return { ...c, comment_text: newText };
              }
              return {
                ...c,
                replies: c.replies ? updateText(c.replies) : [],
              };
            });
          };
          return updateText(prev);
        });
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

      if (result.success && result.data) {
        const newReply = result.data;
        setComments((prev) => {
          const addReplyToParent = (list: Comment[]): Comment[] => {
            return list.map((c) => {
              if (c.id === parentId) {
                return {
                  ...c,
                  replies: [...(c.replies || []), newReply],
                };
              }
              if (c.replies && c.replies.length > 0) {
                return {
                  ...c,
                  replies: addReplyToParent(c.replies),
                };
              }
              return c;
            });
          };
          return addReplyToParent(prev);
        });
        toast.success("پاسخ شما با موفقیت ثبت شد.");
        setReplyTargetId(null);
        return true;
      } else {
        toast.error("خطا در ثبت پاسخ.");
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
