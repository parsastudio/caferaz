"use client";

import React, { useState, useOptimistic, useTransition } from "react";
import { MessageSquare, Star, Plus, Clock } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import CommentDialog from "@/components/features/product/CommentDialog";
import { WidgetErrorBoundary } from "@/components/ui/widget-error-boundary";
import { Comment } from "@/domain/types";
import { useSiteContent } from "@/context/ContentContext";
import { insertCommentReply } from "@/lib/comment-tree";
import { toPersianDigits } from "@/lib/utils";

export interface UIComment extends Omit<Comment, "replies"> {
  isPending?: boolean;
  replies?: UIComment[];
  parentIdTemp?: string | null;
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
  const { product } = useSiteContent();
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const [replyParentId, setReplyParentId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [optimisticComments, addOptimisticComment] = useOptimistic(
    initialComments,
    (state: UIComment[], newComment: UIComment) => {
      if (newComment.parentIdTemp) {
        return insertCommentReply(state, newComment.parentIdTemp, newComment);
      }
      return [newComment, ...state];
    },
  );

  const handleCommentSubmitted = (newComment: {
    id: string;
    firstName: string;
    commentText: string;
    rating: number | null;
    parentId: string | null;
  }) => {
    const newLocalComment: UIComment = {
      id: newComment.id,
      firstName: newComment.firstName,
      rating: newComment.rating,
      commentText: newComment.commentText,
      createdAt: new Date().toISOString(),
      isPending: true,
      replies: [],
      parentIdTemp: newComment.parentId,
    };

    addOptimisticComment(newLocalComment);
  };

  return (
    <WidgetErrorBoundary fallbackTitle={product.noDescriptionText}>
      <div
        className="mt-16 border-t border-stone-800/80 pt-10 text-right"
        dir="rtl"
      >
        <Tabs
          defaultValue="comments"
          className="flex flex-col w-full"
          dir="rtl"
        >
          <TabsList
            className="bg-stone-900 border border-stone-800 p-1 mb-8 flex w-full max-w-md"
            dir="rtl"
          >
            <TabsTrigger
              value="comments"
              className="flex-1 flex items-center justify-center gap-2 cursor-pointer py-2.5"
            >
              <MessageSquare className="w-4 h-4" />
              {product.commentsTabLabel} ({toPersianDigits(optimisticComments?.length || 0)})
            </TabsTrigger>
            <TabsTrigger
              value="description"
              className="flex-1 flex items-center justify-center gap-2 cursor-pointer py-2.5"
            >
              {product.descriptionTabLabel}
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
                {product.commentsSectionTitle}
              </h3>
              <Button
                onClick={() => {
                  setReplyParentId(null);
                  setIsCommentDialogOpen(true);
                }}
                className="bg-gold-500 hover:bg-gold-600 text-stone-950 font-bold cursor-pointer"
              >
                <Plus className="w-4 h-4 ml-1.5" />
                {product.newCommentButton}
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
                    pendingBadgeText={product.pendingCommentBadge}
                    replyButtonText={product.replyButtonText}
                    onReply={(parentId) => {
                      setReplyParentId(parentId);
                      setIsCommentDialogOpen(true);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-stone-900/20 rounded-2xl border border-dashed border-stone-800">
                <p className="text-sm text-stone-500">
                  {product.emptyCommentsText}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent
            value="description"
            className="bg-stone-900/20 p-6 rounded-2xl border border-stone-900/60 text-stone-300 leading-relaxed text-sm w-full text-right"
            dir="rtl"
          >
            <p>{description || product.noDescriptionText}</p>
          </TabsContent>
        </Tabs>

        <CommentDialog
          isOpen={isCommentDialogOpen}
          onOpenChange={setIsCommentDialogOpen}
          productId={productId}
          replyParentId={replyParentId}
          onCommentSubmitted={handleCommentSubmitted}
          isPending={isPending}
          startTransition={startTransition}
        />
      </div>
    </WidgetErrorBoundary>
  );
}

interface CommentNodeProps {
  comment: UIComment;
  pendingBadgeText: string;
  replyButtonText: string;
  onReply: (parentId: string) => void;
}

function CommentNode({
  comment,
  pendingBadgeText,
  replyButtonText,
  onReply,
}: CommentNodeProps) {
  return (
    <div className="py-5 space-y-3 text-right" dir="rtl">
      <div
        className="flex flex-row items-center justify-between w-full"
        dir="rtl"
      >
        <div className="flex items-center gap-2.5" dir="rtl">
          <div className="w-9 h-9 rounded-full bg-stone-800 border border-stone-700/60 flex items-center justify-center text-xs font-black text-gold-500">
            {comment.firstName[0] || "ک"}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-stone-200 text-sm flex items-center gap-2">
              {comment.firstName}
              {comment.isPending && (
                <span className="text-[10px] bg-gold-500/10 border border-gold-500/20 text-gold-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {pendingBadgeText}
                </span>
              )}
            </span>
          </div>
          {comment.rating && (
            <div className="flex items-center gap-1 bg-gold-500/10 border border-gold-500/25 text-gold-500 px-2 py-0.5 rounded-lg text-xs font-bold">
              <Star className="w-3.5 h-3.5 fill-gold-500 text-gold-500" />
              <span>{toPersianDigits(comment.rating)}</span>
            </div>
          )}
        </div>
        <span className="text-xs text-stone-500" suppressHydrationWarning>
          {new Date(comment.createdAt).toLocaleDateString("fa-IR")}
        </span>
      </div>

      <p
        className="text-sm text-stone-300 pr-11 leading-relaxed text-right"
        dir="rtl"
      >
        {comment.commentText}
      </p>

      <div className="pr-11">
        <button
          type="button"
          onClick={() => onReply(comment.id)}
          className="text-xs text-gold-500 hover:text-gold-400 hover:underline transition-colors font-bold cursor-pointer"
        >
          {replyButtonText}
        </button>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="mr-9 pr-4 border-r border-stone-800/80 space-y-3 mt-4">
          {comment.replies.map((reply: UIComment) => (
            <CommentNode
              key={reply.id}
              comment={reply}
              pendingBadgeText={pendingBadgeText}
              replyButtonText={replyButtonText}
              onReply={onReply}
            />
          ))}
        </div>
      )}
    </div>
  );
}
