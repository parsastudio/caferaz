"use client";

import { useState } from "react";
import { Comment } from "@/lib/mock-db";
import { toast } from "sonner";
import {
  submitCommentAction,
  deleteCommentAction,
  approveCommentAction,
  rejectCommentAction,
  editCommentAction,
} from "@/app/actions/comment";

export function useAdminComments(initialComments: Comment[]) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [replyTargetId, setReplyTargetId] = useState<string | null>(null);
  const [editTargetId, setEditTargetId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [adminName, setAdminName] = useState("پشتیبان کافه راز");
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
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
    newStatus: "approved" | "rejected",
  ) => {
    try {
      const result =
        newStatus === "approved"
          ? await approveCommentAction(commentId)
          : await rejectCommentAction(commentId);

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

  const handleEditSubmit = async (commentId: string) => {
    if (!editText.trim()) {
      toast.error("متن دیدگاه نمی‌تواند خالی باشد.");
      return;
    }

    try {
      const result = await editCommentAction(commentId, editText);
      if (result.success) {
        toast.success("تغییرات با موفقیت ذخیره شد.");
        setComments((prev) => {
          const updateText = (list: Comment[]): Comment[] => {
            return list.map((c) => {
              if (c.id === commentId) {
                return { ...c, comment_text: editText };
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
      } else {
        toast.error(result.error || "خطا در ویرایش دیدگاه.");
      }
    } catch {
      toast.error("خطا در برقراری ارتباط با سرور.");
    }
  };

  const handleReplySubmit = async (
    e: React.FormEvent,
    parentId: string,
    productId: string,
  ) => {
    e.preventDefault();
    if (!replyText.trim() || !adminName.trim()) {
      toast.error("لطفاً تمامی فیلدها را پر کنید.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitCommentAction({
        productId,
        firstName: adminName,
        commentText: replyText,
        rating: null,
        parentId,
      });

      if (result.success && result.data) {
        const newReply = result.data;
        setComments((prev) =>
          prev.map((c) => {
            if (c.id === parentId) {
              return {
                ...c,
                replies: [...(c.replies || []), newReply],
              };
            }
            return c;
          }),
        );
        toast.success("پاسخ شما با موفقیت ثبت شد.");
        setReplyText("");
        setReplyTargetId(null);
      } else {
        toast.error("خطا در ثبت پاسخ.");
      }
    } catch {
      toast.error("خطای غیرمنتظره رخ داد.");
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
    editText,
    setEditText,
    adminName,
    setAdminName,
    replyText,
    setReplyText,
    isSubmitting,
    handleDelete,
    handleStatusChange,
    handleEditSubmit,
    handleReplySubmit,
  };
}
