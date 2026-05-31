"use client";

import React, { useState } from "react";
import { MessageSquare, Star, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

interface CommentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  replyParentId: string | null;
  onCommentSubmitted: (newComment: {
    first_name: string;
    comment_text: string;
    rating: number | null;
  }) => void;
}

export default function CommentDialog({
  isOpen,
  onOpenChange,
  productId,
  replyParentId,
  onCommentSubmitted,
}: CommentDialogProps) {
  const [commentName, setCommentName] = useState("");
  const [commentPhone, setCommentPhone] = useState("");
  const [commentText, setCommentText] = useState("");
  const [commentRating, setCommentRating] = useState<number>(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentMessage, setCommentMessage] = useState<string | null>(null);
  const [commentError, setCommentError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentName || !commentText) {
      setCommentError("لطفاً تمامی موارد ستاره‌دار را تکمیل نمایید.");
      return;
    }

    setIsSubmitting(true);
    setCommentError(null);
    setCommentMessage(null);

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          phone: commentPhone || null,
          firstName: commentName,
          commentText,
          rating: replyParentId ? null : commentRating,
          parentId: replyParentId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setCommentMessage(result.message);
        onCommentSubmitted({
          first_name: commentName,
          comment_text: commentText,
          rating: replyParentId ? null : commentRating,
        });
        setCommentName("");
        setCommentPhone("");
        setCommentText("");
        setCommentRating(5);
      } else {
        setCommentError(result.error || "خطایی رخ داد.");
      }
    } catch (err) {
      setCommentError("خطا در ارتباط با سرور فرضی.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        dir="rtl"
        className="max-w-md bg-stone-900 border border-stone-800 text-stone-100 p-6 rounded-2xl text-right"
      >
        <DialogHeader className="space-y-2 text-right">
          <DialogTitle className="text-lg font-bold text-gold-500 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            {replyParentId ? "ثبت پاسخ به دیدگاه" : "ثبت دیدگاه جدید"}
          </DialogTitle>
          <DialogDescription className="text-xs text-stone-400">
            دیدگاه‌ها پس از تایید مدیر بر روی وبسایت نمایش داده می‌شوند.
          </DialogDescription>
        </DialogHeader>

        {commentMessage ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto text-xl font-bold">
              ✓
            </div>
            <p className="text-sm font-bold text-emerald-400">
              {commentMessage}
            </p>
            <Button
              onClick={() => {
                onOpenChange(false);
                setCommentMessage(null);
              }}
              className="w-full bg-stone-800 hover:bg-stone-700 text-stone-100 font-bold py-2.5 rounded-xl cursor-pointer"
            >
              متوجه شدم
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-3" dir="rtl">
            <div className="space-y-1.5 text-right">
              <label className="text-xs font-bold text-stone-300">
                نام شما <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={commentName}
                onChange={(e) => setCommentName(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 rounded-xl px-3 py-2 text-sm text-stone-100 outline-none transition-all text-right"
                placeholder="مثال: مریم"
              />
            </div>

            <div className="space-y-1.5 text-right">
              <label className="text-xs font-bold text-stone-300">
                شماره موبایل (اختیاری)
              </label>
              <input
                type="tel"
                pattern="09[0-9]{9}"
                value={commentPhone}
                onChange={(e) => setCommentPhone(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 rounded-xl px-3 py-2 text-sm text-stone-100 outline-none transition-all text-left"
                dir="ltr"
                placeholder="09123456789"
              />
            </div>

            {!replyParentId && (
              <div className="space-y-1.5 text-right bg-stone-950/40 p-3 rounded-xl border border-stone-800/50">
                <label className="text-xs font-bold text-stone-300 block mb-1">
                  امتیاز شما به کیفیت قهوه:
                </label>
                <div className="flex items-center gap-2.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setCommentRating(star)}
                      className="transition-transform active:scale-90 hover:scale-110 cursor-pointer focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          star <= commentRating
                            ? "fill-gold-500 text-gold-500"
                            : "text-stone-700 hover:text-stone-500"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-1.5 text-right">
              <label className="text-xs font-bold text-stone-300">
                متن دیدگاه <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 rounded-xl px-3 py-2 text-sm text-stone-100 outline-none transition-all resize-none text-right leading-relaxed"
                placeholder="دیدگاه خود را اینجا یادداشت کنید..."
              />
            </div>

            {commentError && (
              <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-right">
                {commentError}
              </div>
            )}

            <div className="border-t border-stone-800 pt-4 mt-2 flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="text-stone-400 hover:text-stone-200 cursor-pointer"
              >
                انصراف
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gold-500 hover:bg-gold-600 text-stone-950 font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    در حال ثبت...
                  </>
                ) : (
                  "ارسال دیدگاه"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
