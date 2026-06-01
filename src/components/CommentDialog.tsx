"use client";

import React from "react";
import { Controller } from "react-hook-form";
import { MessageSquare, Star, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { useCommentForm } from "@/hooks/useCommentForm";
import { Comment } from "@/lib/mock-db";

interface CommentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  replyParentId: string | null;
  onCommentSubmitted: (newComment: {
    id: string;
    first_name: string;
    comment_text: string;
    rating: number | null;
    parentId: string | null;
  }) => void;
  onCommentSuccess: (tempId: string, realComment: Comment) => void;
  onCommentFailed: (tempId: string) => void;
  startTransition: React.TransitionStartFunction;
}

export default function CommentDialog({
  isOpen,
  onOpenChange,
  productId,
  replyParentId,
  onCommentSubmitted,
  onCommentSuccess,
  onCommentFailed,
  startTransition,
}: CommentDialogProps) {
  const {
    methods,
    commentMessage,
    setCommentMessage,
    commentError,
    isPending,
    onSubmit,
  } = useCommentForm({
    productId,
    replyParentId,
    isOpen,
    onCommentSubmitted,
    onCommentSuccess,
    onCommentFailed,
    startTransition,
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = methods;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        dir="rtl"
        className="sm:max-w-lg md:max-w-xl bg-stone-900 border border-stone-800 text-stone-100 p-6 md:p-8 rounded-2xl text-right animate-in fade-in zoom-in-95 duration-200"
      >
        <DialogHeader className="space-y-2 text-right">
          <DialogTitle className="text-lg md:text-xl font-bold text-gold-500 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 md:w-6 md:h-6" />
            {replyParentId ? "ثبت پاسخ به دیدگاه" : "ثبت دیدگاه جدید"}
          </DialogTitle>
          <DialogDescription className="text-xs md:text-sm text-stone-400">
            دیدگاه‌ها پس از تایید مدیر بر روی وبسایت نمایش داده می‌شوند.
          </DialogDescription>
        </DialogHeader>

        {commentMessage ? (
          <div className="text-center py-6 space-y-4 animate-in fade-in duration-200">
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
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5 mt-3"
            dir="rtl"
          >
            <div className="space-y-1.5 text-right">
              <label className="text-xs md:text-sm font-bold text-stone-300">
                نام شما <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("firstName")}
                className={`w-full bg-stone-950 border focus:ring-1 rounded-xl px-3 py-2.5 text-sm text-stone-100 outline-none transition-all text-right ${
                  errors.firstName
                    ? "border-destructive/60 focus:border-destructive focus:ring-destructive/30"
                    : "border-stone-800 focus:border-gold-500 focus:ring-gold-500"
                }`}
                placeholder="مثال: مریم"
              />
              {errors.firstName && (
                <p className="text-[10px] text-destructive font-bold mt-1">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5 text-right">
              <label className="text-xs md:text-sm font-bold text-stone-300">
                شماره موبایل (اختیاری)
              </label>
              <input
                type="tel"
                {...register("phone")}
                className={`w-full bg-stone-950 border focus:ring-1 rounded-xl px-3 py-2.5 text-sm text-stone-100 outline-none transition-all text-left ${
                  errors.phone
                    ? "border-destructive/60 focus:border-destructive focus:ring-destructive/30"
                    : "border-stone-800 focus:border-gold-500 focus:ring-gold-500"
                }`}
                dir="ltr"
                placeholder="09123456789"
              />
              {errors.phone && (
                <p className="text-[10px] text-destructive font-bold mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div>

            {!replyParentId && (
              <div className="space-y-1.5 text-right bg-stone-950/40 p-4 rounded-xl border border-stone-800/50">
                <label className="text-xs md:text-sm font-bold text-stone-300 block mb-2">
                  امتیاز شما به کیفیت قهوه:
                </label>
                <Controller
                  name="rating"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <div className="flex items-center gap-2.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => onChange(star)}
                          className="transition-transform active:scale-90 hover:scale-110 cursor-pointer focus:outline-none"
                        >
                          <Star
                            className={`w-8 h-8 md:w-9 md:h-9 transition-colors ${
                              star <= (value ?? 5)
                                ? "fill-gold-500 text-gold-500"
                                : "text-stone-700 hover:text-stone-500"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                />
              </div>
            )}

            <div className="space-y-1.5 text-right">
              <label className="text-xs md:text-sm font-bold text-stone-300">
                متن دیدگاه <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                {...register("commentText")}
                className={`w-full bg-stone-950 border focus:ring-1 rounded-xl px-3 py-2.5 text-sm text-stone-100 outline-none transition-all resize-none text-right leading-relaxed ${
                  errors.commentText
                    ? "border-destructive/60 focus:border-destructive focus:ring-destructive/30"
                    : "border-stone-800 focus:border-gold-500 focus:ring-gold-500"
                }`}
                placeholder="دیدگاه خود را اینجا یادداشت کنید..."
              />
              {errors.commentText && (
                <p className="text-[10px] text-destructive font-bold mt-1">
                  {errors.commentText.message}
                </p>
              )}
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
                disabled={isPending}
                className="bg-gold-500 hover:bg-gold-600 text-stone-950 font-bold px-5 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                {isPending ? (
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
