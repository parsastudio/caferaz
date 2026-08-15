"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { checkAdminAuth } from "@/actions/admin-auth";
import { buildCommentTree } from "@/lib/comment-tree";
import { Comment } from "@/types";
import { ActionResponse } from "@/types/actions";

export async function getCommentsAction(
  productId: string,
): Promise<ActionResponse<Comment[]>> {
  try {
    if (!productId) {
      return { success: false, error: "شناسه محصول معتبر نیست." };
    }

    const comments = await prisma.comment.findMany({
      where: {
        productId,
        status: "approved",
      },
      orderBy: { createdAt: "desc" },
    });

    const tree = buildCommentTree(comments);
    return { success: true, data: tree };
  } catch {
    return { success: false, error: "خطا در بارگذاری دیدگاه‌ها رخ داد." };
  }
}

export async function submitCommentAction(payload: {
  productId: string;
  phone?: string | null;
  firstName: string;
  commentText: string;
  rating: number | null;
  parentId: string | null;
}): Promise<ActionResponse<Comment>> {
  try {
    const { productId, phone, firstName, commentText, rating, parentId } =
      payload;

    if (!productId || !firstName || !commentText) {
      return {
        success: false,
        error: "تکمیل تمامی فیلدهای ستاره‌دار الزامی است.",
      };
    }

    const isAdmin = await checkAdminAuth();
    const status = isAdmin ? "approved" : "pending";

    let userId: string | null = null;
    if (phone) {
      const user = await prisma.user.findUnique({
        where: { phone: phone.trim() },
      });
      if (user) {
        userId = user.id;
      }
    }

    const newComment = await prisma.comment.create({
      data: {
        productId,
        userId,
        firstName,
        lastName: "",
        rating,
        commentText,
        status,
        parentCommentId: parentId,
      },
    });

    revalidatePath("/");

    return {
      success: true,
      message: isAdmin
        ? "دیدگاه پشتیبان با موفقیت تایید و منتشر گردید."
        : "دیدگاه شما ثبت گردید و پس از بازبینی تایید خواهد شد.",
      data: {
        id: newComment.id,
        productId: newComment.productId ?? undefined,
        firstName: newComment.firstName ?? "",
        lastName: newComment.lastName ?? "",
        rating: newComment.rating,
        commentText: newComment.commentText,
        createdAt: newComment.createdAt.toISOString(),
        status: newComment.status as Comment["status"],
        replies: [],
      },
    };
  } catch {
    return { success: false, error: "مشکلی در ذخیره دیدگاه شما وجود دارد." };
  }
}
