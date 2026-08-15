"use client";

import React, {
  useState,
  useOptimistic,
  useTransition,
  useEffect,
} from "react";
import { MessageSquare, Star, Plus, Clock } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import CommentDialog from "@/components/features/product/CommentDialog";
import { Comment } from "@/types";

export interface UIComment extends Omit<Comment, "replies"> {
  is_pending?: boolean;
  replies?: UIComment[];
  parent_id_temp?: string | null;
}

interface ProductTabsSectionProps {
  productId: string;
  description: string;
  initialComments: UIComment[];
}

export default function ProductTabsSection({
  productId,
  description,
  initialComments,
}: ProductTabsSectionProps) {
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const [replyParentId, setReplyParentId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [localPendingComments, setLocalPendingComments] = useState<UIComment[]>(
    [],
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(`pending_comments_${productId}`);
      if (stored) {
        try {
          const parsed: UIComment[] = JSON.parse(stored);

          const isApproved = (id: string, list: UIComment[]): boolean => {
            return list.some(
              (c) => c.id === id || (c.replies && isApproved(id, c.replies)),
            );
          };

          const stillPending = parsed.filter((pending) => {
            return !isApproved(pending.id, initialComments);
          });

          setLocalPendingComments(stillPending);
          localStorage.setItem(
            `pending_comments_${productId}`,
            JSON.stringify(stillPending),
          );
        } catch {
          // Ignored
        }
      }
    }
  }, [productId, initialComments]);

  const getMergedComments = (): UIComment[] => {
    let merged = [...initialComments];

    localPendingComments.forEach((pending) => {
      if (pending.parent_id_temp) {
        const insertReply = (list: UIComment[]): UIComment[] => {
          return list.map((c) => {
            if (c.id === pending.parent_id_temp) {
              const alreadyExists = (c.replies || []).some(
                (r) => r.id === pending.id,
              );
              return {
                ...c,
                replies: alreadyExists
                  ? c.replies
                  : [...(c.replies || []), pending],
              };
            }
            if (c.replies && c.replies.length > 0) {
              return {
                ...c,
                replies: insertReply(c.replies),
              };
            }
            return c;
          });
        };
        merged = insertReply(merged);
      } else {
        if (!merged.some((c) => c.id === pending.id)) {
          merged = [pending, ...merged];
        }
      }
    });

    return merged;
  };

  const mergedCommentsSnapshot = getMergedComments();

  const [optimisticComments, addOptimisticComment] = useOptimistic(
    mergedCommentsSnapshot,
    (state, newComment: UIComment) => {
      if (newComment.parent_id_temp) {
        const insertReply = (list: UIComment[]): UIComment[] => {
          return list.map((c) => {
            if (c.id === newComment.parent_id_temp) {
              return {
                ...c,
                replies: [...(c.replies || []), newComment],
              };
            }
            if (c.replies && c.replies.length > 0) {
              return {
                ...c,
                replies: insertReply(c.replies),
              };
            }
            return c;
          });
        };
        return insertReply(state);
      }
      return [newComment, ...state];
    },
  );

  const handleCommentSubmitted = (newComment: {
    id: string;
    first_name: string;
    comment_text: string;
    rating: number | null;
    parentId: string | null;
  }) => {
    const newLocalComment: UIComment = {
      id: newComment.id,
      first_name: newComment.first_name,
      last_name: "",
      rating: newComment.rating,
      comment_text: newComment.comment_text,
      created_at: new Date().toISOString(),
      is_pending: true,
      replies: [],
      parent_id_temp: newComment.parentId,
    };

    addOptimisticComment(newLocalComment);
  };

  const handleCommentSuccess = (
    _tempId: string,
    realComment: Comment,
    parentId: string | null,
  ) => {
    const newUIComment: UIComment = {
      ...realComment,
      is_pending: true,
      replies: realComment.replies as UIComment[] | undefined,
      parent_id_temp: parentId,
    };

    setLocalPendingComments((prev) => {
      const updated = [newUIComment, ...prev];
      localStorage.setItem(
        `pending_comments_${productId}`,
        JSON.stringify(updated),
      );
      return updated;
    });
  };

  const openNewCommentDialog = () => {
    setReplyParentId(null);
    setIsCommentDialogOpen(true);
  };

  const openReplyDialog = (parentId: string) => {
    setReplyParentId(parentId);
    setIsCommentDialogOpen(true);
  };

  return (
    <div
      className="mt-16 border-t border-stone-800/80 pt-10 text-right"
      dir="rtl"
    >
      <Tabs defaultValue="comments" className="flex flex-col w-full" dir="rtl">
        <TabsList
          className="bg-stone-900 border border-stone-800 p-1 mb-8 flex w-full max-w-md"
          dir="rtl"
        >
          <TabsTrigger
            value="comments"
            className="flex-1 flex items-center justify-center gap-2 cursor-pointer py-2.5"
          >
            <MessageSquare className="w-4 h-4" />
            نظرات مشتریان ({optimisticComments?.length || 0})
          </TabsTrigger>
          <TabsTrigger
            value="description"
            className="flex-1 flex items-center justify-center gap-2 cursor-pointer py-2.5"
          >
            توضیحات تخصصی محصول
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="comments"
          className="space-y-6 w-full text-right"
          dir="rtl"
        >
          <div
            className="flex flex-row items-center justify-between w-full"
            dir="rtl"
          >
            <h3 className="text-lg font-black text-stone-200">
              نظرات و پرسش‌های کاربران
            </h3>
            <Button
              onClick={openNewCommentDialog}
              className="bg-gold-500 hover:bg-gold-600 text-stone-950 font-bold cursor-pointer"
            >
              <Plus className="w-4 h-4 ml-1.5" />
              ثبت دیدگاه جدید
            </Button>
          </div>

          {optimisticComments && optimisticComments.length > 0 ? (
            <div
              className="divide-y divide-stone-800/80 bg-stone-900/20 p-6 rounded-2xl border border-stone-900/60 text-right"
              dir="rtl"
            >
              {optimisticComments.map((comment: UIComment) => (
                <CommentNode
                  key={comment.id}
                  comment={comment}
                  onReply={openReplyDialog}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-stone-900/20 rounded-2xl border border-dashed border-stone-800">
              <p className="text-sm text-stone-500">
                تاکنون دیدگاهی ثبت نشده است. اولین دیدگاه را شما ثبت کنید!
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent
          value="description"
          className="bg-stone-900/20 p-6 rounded-2xl border border-stone-900/60 text-stone-300 leading-relaxed text-sm w-full text-right"
          dir="rtl"
        >
          <p>{description || "توضیحات تکمیلی برای این محصول ثبت نشده است."}</p>
        </TabsContent>
      </Tabs>

      <CommentDialog
        isOpen={isCommentDialogOpen}
        onOpenChange={setIsCommentDialogOpen}
        productId={productId}
        replyParentId={replyParentId}
        onCommentSubmitted={handleCommentSubmitted}
        onCommentSuccess={handleCommentSuccess}
        isPending={isPending}
        startTransition={startTransition}
      />
    </div>
  );
}

interface CommentNodeProps {
  comment: UIComment;
  onReply: (parentId: string) => void;
}

function CommentNode({ comment, onReply }: CommentNodeProps) {
  return (
    <div className="py-5 space-y-3 text-right" dir="rtl">
      <div
        className="flex flex-row items-center justify-between w-full"
        dir="rtl"
      >
        <div className="flex items-center gap-2.5" dir="rtl">
          <div className="w-9 h-9 rounded-full bg-stone-800 border border-stone-700/60 flex items-center justify-center text-xs font-black text-gold-500">
            {comment.first_name?.[0] || "ک"}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-stone-200 text-sm flex items-center gap-2">
              {comment.first_name} {comment.last_name}
              {comment.is_pending && (
                <span className="text-[10px] bg-gold-500/10 border border-gold-500/20 text-gold-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Clock className="w-3 h-3" /> در انتظار تایید
                </span>
              )}
            </span>
          </div>
          {comment.rating && (
            <div className="flex items-center gap-1 bg-gold-500/10 border border-gold-500/25 text-gold-500 px-2 py-0.5 rounded-lg text-xs font-bold">
              <Star className="w-3.5 h-3.5 fill-gold-500 text-gold-500" />
              <span>{comment.rating}</span>
            </div>
          )}
        </div>
        <span className="text-xs text-stone-500" suppressHydrationWarning>
          {new Date(comment.created_at).toLocaleDateString("fa-IR")}
        </span>
      </div>

      <p
        className="text-sm text-stone-300 pr-11 leading-relaxed text-right"
        dir="rtl"
      >
        {comment.comment_text}
      </p>

      <div className="pr-11">
        <button
          type="button"
          onClick={() => onReply(comment.id)}
          className="text-xs text-gold-500 hover:text-gold-400 hover:underline transition-colors font-bold cursor-pointer"
        >
          پاسخ به این نظر
        </button>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="mr-9 pr-4 border-r border-stone-800/80 space-y-3 mt-4">
          {comment.replies.map((reply: UIComment) => (
            <CommentNode key={reply.id} comment={reply} onReply={onReply} />
          ))}
        </div>
      )}
    </div>
  );
}
