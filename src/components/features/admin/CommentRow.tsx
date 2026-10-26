"use client";

import React from "react";
import {
  Star,
  Trash,
  Reply,
  Check,
  EyeOff,
  Eye,
  Edit3,
  ShieldAlert,
} from "lucide-react";
import { Comment } from "@/domain/types";
import { Badge } from "@/components/ui/badge";
import CommentEditForm from "@/components/features/admin/comments/CommentEditForm";
import CommentReplyForm from "@/components/features/admin/comments/CommentReplyForm";
import { toPersianDigits } from "@/lib/utils";

interface CommentRowProps {
  comment: Comment;
  isReplyNode?: boolean;
  replyTargetId: string | null;
  setReplyTargetId: (id: string | null) => void;
  editTargetId: string | null;
  setEditTargetId: (id: string | null) => void;
  isSubmitting: boolean;
  handleDelete: (id: string) => void;
  handleStatusChange: (
    id: string,
    status: "approved" | "rejected" | "spam",
  ) => void;
  handleEditSubmit: (id: string, text: string) => Promise<boolean>;
  handleReplySubmit: (
    parentId: string,
    productId: string,
    name: string,
    text: string,
  ) => Promise<boolean>;
}

export default function CommentRow({
  comment,
  isReplyNode = false,
  replyTargetId,
  setReplyTargetId,
  editTargetId,
  setEditTargetId,
  isSubmitting,
  handleDelete,
  handleStatusChange,
  handleEditSubmit,
  handleReplySubmit,
}: CommentRowProps) {
  const status = comment.status || "pending";

  return (
    <div
      className={`${
        isReplyNode
          ? "space-y-2 mt-2"
          : "bg-stone-900/30 border border-stone-800 rounded-2xl p-4 sm:p-5 space-y-4 text-right"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-stone-850 flex items-center justify-center text-xs font-black text-gold-500 shrink-0">
            {comment.firstName?.[0] || "ک"}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-stone-200 flex flex-wrap items-center gap-1.5">
              <span>{comment.firstName || "کاربر کافه راز"}</span>
              {status === "approved" && (
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] px-2 py-0.2 rounded-full font-bold">
                  منتشر شده
                </Badge>
              )}
              {status === "pending" && (
                <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[9px] px-2 py-0.2 rounded-full font-bold animate-pulse">
                  در انتظار تایید
                </Badge>
              )}
              {status === "rejected" && (
                <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-[9px] px-2 py-0.2 rounded-full font-bold">
                  رد شده
                </Badge>
              )}
              {status === "spam" && (
                <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-[9px] px-2 py-0.2 rounded-full font-bold">
                  اسپم
                </Badge>
              )}
            </span>
            <span
              className="text-[10px] text-stone-500 mt-0.5"
              suppressHydrationWarning
            >
              {new Date(comment.createdAt).toLocaleDateString("fa-IR")}
            </span>
          </div>
          {comment.rating && (
            <div className="flex items-center gap-1 bg-gold-500/10 border border-gold-500/25 text-gold-500 px-2 py-0.5 rounded-lg text-[10px] font-bold">
              <Star className="w-3 h-3 fill-gold-500 text-gold-500" />
              <span>{toPersianDigits(comment.rating)}</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1 sm:gap-2 justify-start sm:justify-end w-full sm:w-auto pt-1 sm:pt-0">
          {status !== "approved" && (
            <button
              onClick={() => handleStatusChange(comment.id, "approved")}
              className="w-8 h-8 sm:w-auto sm:h-auto p-1.5 sm:p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg sm:rounded-xl border border-stone-800 hover:border-emerald-500/30 transition-all cursor-pointer flex items-center justify-center"
              title="تایید انتشار"
            >
              {isReplyNode ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
            </button>
          )}
          {status !== "rejected" && (
            <button
              onClick={() => handleStatusChange(comment.id, "rejected")}
              className="w-8 h-8 sm:w-auto sm:h-auto p-1.5 sm:p-2 text-amber-500 hover:bg-amber-500/10 rounded-lg sm:rounded-xl border border-stone-800 hover:border-amber-500/30 transition-all cursor-pointer flex items-center justify-center"
              title="رد انتشار"
            >
              <EyeOff className="w-3.5 h-3.5" />
            </button>
          )}
          {status !== "spam" && (
            <button
              onClick={() => handleStatusChange(comment.id, "spam")}
              className="w-8 h-8 sm:w-auto sm:h-auto p-1.5 sm:p-2 text-red-400 hover:bg-red-500/10 rounded-lg sm:rounded-xl border border-stone-800 hover:border-red-500/30 transition-all cursor-pointer flex items-center justify-center"
              title="علامت‌گذاری به عنوان اسپم"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => setEditTargetId(comment.id)}
            className="w-8 h-8 sm:w-auto sm:h-auto p-1.5 sm:p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg sm:rounded-xl border border-stone-800 hover:border-blue-500/30 transition-all cursor-pointer flex items-center justify-center"
            title="ویرایش"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          {!isReplyNode && (
            <button
              onClick={() => setReplyTargetId(comment.id)}
              className="flex items-center gap-1 px-2.5 py-1 text-xs text-gold-500 hover:bg-gold-500/10 rounded-lg sm:rounded-xl border border-stone-800 hover:border-gold-500/30 transition-all cursor-pointer h-8"
            >
              <Reply className="w-3.5 h-3.5" />
              <span>پاسخ</span>
            </button>
          )}
          <button
            onClick={() => handleDelete(comment.id)}
            className="w-8 h-8 sm:w-auto sm:h-auto p-1.5 sm:p-2 text-stone-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg sm:rounded-xl border border-stone-800 hover:border-red-500/30 transition-all cursor-pointer flex items-center justify-center"
            title="حذف دائمی"
          >
            <Trash className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {editTargetId === comment.id ? (
        <CommentEditForm
          initialText={comment.commentText}
          onCancel={() => setEditTargetId(null)}
          onSave={(newText) => handleEditSubmit(comment.id, newText)}
        />
      ) : (
        <p
          className={`text-xs text-stone-300 leading-relaxed ${
            isReplyNode ? "" : "pr-0 sm:pr-12"
          }`}
        >
          {comment.commentText}
        </p>
      )}

      {replyTargetId === comment.id && (
        <CommentReplyForm
          onCancel={() => setReplyTargetId(null)}
          onSubmit={(name, text) =>
            handleReplySubmit(
              comment.id,
              comment.productId || "prod_coffee_bulk_01",
              name,
              text,
            )
          }
          isSubmitting={isSubmitting}
        />
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="mr-4 sm:mr-12 pr-2.5 sm:pr-4 border-r border-stone-800 space-y-4 pt-3">
          {comment.replies.map((reply) => (
            <CommentRow
              key={reply.id}
              comment={reply}
              isReplyNode={true}
              replyTargetId={replyTargetId}
              setReplyTargetId={setReplyTargetId}
              editTargetId={editTargetId}
              setEditTargetId={setEditTargetId}
              isSubmitting={isSubmitting}
              handleDelete={handleDelete}
              handleStatusChange={handleStatusChange}
              handleEditSubmit={handleEditSubmit}
              handleReplySubmit={handleReplySubmit}
            />
          ))}
        </div>
      )}
    </div>
  );
}
