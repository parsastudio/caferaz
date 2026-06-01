"use client";

import React, { useState } from "react";
import { Star, Trash, Reply, X, Check } from "lucide-react";
import {
  submitCommentAction,
  deleteCommentAction,
} from "@/app/actions/comment";
import { Comment } from "@/lib/mock-db";
import { toast } from "sonner";

interface AdminCommentsClientListProps {
  initialComments: Comment[];
}

export default function AdminCommentsClientList({
  initialComments,
}: AdminCommentsClientListProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [replyTargetId, setReplyTargetId] = useState<string | null>(null);
  const [adminName, setAdminName] = useState("پشتیبان کافه راز");
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div
          key={comment.id}
          className="bg-stone-900/30 border border-stone-800 rounded-2xl p-5 space-y-4 text-right"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-stone-850 flex items-center justify-center text-xs font-black text-gold-500">
                {comment.first_name?.[0] || "ک"}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-stone-200">
                  {comment.first_name} {comment.last_name || ""}
                </span>
                <span className="text-[10px] text-stone-500 mt-0.5">
                  {new Date(comment.created_at).toLocaleDateString("fa-IR")}
                </span>
              </div>
              {comment.rating && (
                <div className="flex items-center gap-1 bg-gold-500/10 border border-gold-500/25 text-gold-500 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                  <Star className="w-3 h-3 fill-gold-500 text-gold-500" />
                  <span>{comment.rating}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setReplyTargetId(comment.id)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs text-gold-500 hover:bg-gold-500/5 rounded-xl border border-stone-800 hover:border-gold-500/20 transition-all cursor-pointer"
              >
                <Reply className="w-3.5 h-3.5" />
                <span>پاسخ</span>
              </button>
              <button
                onClick={() => handleDelete(comment.id)}
                className="p-2 text-stone-400 hover:text-red-400 hover:bg-red-500/5 rounded-xl border border-stone-800 hover:border-red-500/20 transition-all cursor-pointer"
              >
                <Trash className="w-4 h-4" />
              </button>
            </div>
          </div>

          <p className="text-xs text-stone-300 leading-relaxed pr-12">
            {comment.comment_text}
          </p>

          {replyTargetId === comment.id && (
            <form
              onSubmit={(e) =>
                handleReplySubmit(
                  e,
                  comment.id,
                  comment.productId || "prod_coffee_bulk_01",
                )
              }
              className="mr-12 bg-stone-950/40 p-4 rounded-xl border border-stone-800 space-y-3"
            >
              <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                <span className="text-[10px] font-bold text-stone-400">
                  ثبت پاسخ به دیدگاه
                </span>
                <button
                  type="button"
                  onClick={() => setReplyTargetId(null)}
                  className="text-stone-500 hover:text-stone-300 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-400">
                    نام پاسخ‌دهنده:
                  </label>
                  <input
                    type="text"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-1.5 text-xs text-stone-200 focus:border-gold-500 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-400">
                  متن پاسخ شما:
                </label>
                <textarea
                  rows={2}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="پاسخ خود را بنویسید..."
                  className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-1.5 text-xs text-stone-200 focus:border-gold-500 outline-none resize-none leading-relaxed"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gold-500 hover:bg-gold-600 text-stone-950 font-black text-[10px] px-4 py-2 rounded-lg cursor-pointer transition-colors flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>
                    {isSubmitting ? "در حال ثبت..." : "ارسال نهایی پاسخ"}
                  </span>
                </button>
              </div>
            </form>
          )}

          {comment.replies && comment.replies.length > 0 && (
            <div className="mr-12 pr-4 border-r border-stone-800 space-y-4 pt-3">
              {comment.replies.map((reply) => (
                <div key={reply.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-gold-500">
                        {reply.first_name} {reply.last_name || ""}
                      </span>
                      <span className="text-[10px] text-stone-500">
                        {new Date(reply.created_at).toLocaleDateString("fa-IR")}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDelete(reply.id)}
                      className="p-1.5 text-stone-500 hover:text-red-400 hover:bg-red-500/5 rounded-lg border border-stone-850 hover:border-red-500/20 transition-all cursor-pointer"
                    >
                      <Trash className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    {reply.comment_text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
