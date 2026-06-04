"use client";

import React from "react";
import CommentFilterTabs from "./CommentFilterTabs";
import CommentRow from "./CommentRow";
import { useAdminComments } from "@/hooks/useAdminComments";
import { Comment } from "@/types";

interface AdminCommentsClientListProps {
  initialComments: Comment[];
}

export default function AdminCommentsClientList({
  initialComments,
}: AdminCommentsClientListProps) {
  const {
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
  } = useAdminComments(initialComments);

  const totalCount = comments.length;
  const approvedCount = comments.filter((c) => c.status === "approved").length;
  const rejectedCount = comments.filter((c) => c.status === "rejected").length;
  const spamCount = comments.filter((c) => c.status === "spam").length;

  return (
    <div className="space-y-6">
      <CommentFilterTabs
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        totalCount={totalCount}
        pendingCount={pendingCount}
        approvedCount={approvedCount}
        rejectedCount={rejectedCount}
        spamCount={spamCount}
      />

      <div className="space-y-4">
        {filteredComments.map((comment) => (
          <CommentRow
            key={comment.id}
            comment={comment}
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
    </div>
  );
}
