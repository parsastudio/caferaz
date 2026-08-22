import "server-only";
import { prisma } from "@/lib/prisma";
import { Comment } from "@/domain/types";
import {
  CommentStatus,
  SubmitCommentInput,
} from "@/domain/validations/comment.schema";
import { buildCommentTree } from "@/lib/comment-tree";
import { normalizePhone } from "@/lib/phone";

export class CommentService {
  static async getApprovedComments(productId: string): Promise<Comment[]> {
    const comments = await prisma.comment.findMany({
      where: {
        productId,
        status: "approved",
      },
      orderBy: { createdAt: "desc" },
    });

    return buildCommentTree(comments);
  }

  static async getAllCommentsForAdmin(productId: string): Promise<Comment[]> {
    const comments = await prisma.comment.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" },
    });

    return buildCommentTree(comments);
  }

  static async getPendingCommentsCount(): Promise<number> {
    return await prisma.comment.count({
      where: { status: "pending" },
    });
  }

  static async submitComment(
    input: SubmitCommentInput,
    status: CommentStatus,
  ): Promise<Comment> {
    let userId: string | null = null;
    if (input.phone) {
      const cleanPhone = normalizePhone(input.phone);
      const user = await prisma.user.findUnique({
        where: { phone: cleanPhone },
      });
      if (user) {
        userId = user.id;
      }
    }

    const newComment = await prisma.comment.create({
      data: {
        productId: input.productId,
        userId,
        firstName: input.firstName,
        lastName: null,
        rating: input.rating,
        commentText: input.commentText,
        status,
        parentCommentId: input.parentId,
      },
    });

    return {
      id: newComment.id,
      productId: newComment.productId ?? undefined,
      firstName: newComment.firstName ?? "",
      rating: newComment.rating,
      commentText: newComment.commentText,
      createdAt: newComment.createdAt.toISOString(),
      status: newComment.status as CommentStatus,
      replies: [],
    };
  }

  static async updateCommentStatus(
    commentId: string,
    status: CommentStatus,
  ): Promise<boolean> {
    await prisma.comment.update({
      where: { id: commentId },
      data: { status },
    });
    return true;
  }

  static async editCommentText(
    commentId: string,
    commentText: string,
  ): Promise<boolean> {
    await prisma.comment.update({
      where: { id: commentId },
      data: { commentText },
    });
    return true;
  }

  static async deleteComment(commentId: string): Promise<boolean> {
    await prisma.comment.delete({
      where: { id: commentId },
    });
    return true;
  }
}
