"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { checkAdminAuth } from "@/actions/auth";
import { Comment as UIComment } from "@/types";

export type ActionResponse<T> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string };

export async function getCommentsAction(
  productId: string,
): Promise<ActionResponse<UIComment[]>> {
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

export async function getAdminCommentsAction(
  productId: string,
): Promise<ActionResponse<UIComment[]>> {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return { success: false, error: "دسترسی غیرمجاز." };
    }

    if (!productId) {
      return { success: false, error: "شناسه محصول معتبر نیست." };
    }

    const comments = await prisma.comment.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" },
    });

    const tree = buildCommentTree(comments);
    return { success: true, data: tree };
  } catch {
    return {
      success: false,
      error: "خطا در بارگذاری دیدگاه‌های مدیریت رخ داد.",
    };
  }
}

export async function submitCommentAction(payload: {
  productId: string;
  phone?: string | null;
  firstName: string;
  commentText: string;
  rating: number | null;
  parentId: string | null;
}): Promise<ActionResponse<UIComment>> {
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

    const uiComment: UIComment = {
      id: newComment.id,
      productId: newComment.productId ?? undefined,
      first_name: newComment.firstName ?? "",
      last_name: newComment.lastName ?? "",
      rating: newComment.rating,
      comment_text: newComment.commentText,
      created_at: newComment.createdAt.toISOString(),
      status: newComment.status as "pending" | "approved" | "rejected" | "spam",
      replies: [],
    };

    return {
      success: true,
      message: isAdmin
        ? "دیدگاه پشتیبان با موفقیت تایید و منتشر گردید."
        : "دیدگاه شما ثبت گردید و پس از بازبینی تایید خواهد شد.",
      data: uiComment,
    };
  } catch {
    return { success: false, error: "مشکلی در ذخیره دیدگاه شما وجود دارد." };
  }
}

export async function approveCommentAction(
  commentId: string,
): Promise<ActionResponse<boolean>> {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return { success: false, error: "دسترسی غیرمجاز." };
    }

    await prisma.comment.update({
      where: { id: commentId },
      data: { status: "approved" },
    });

    revalidatePath("/");
    revalidatePath("/admin/comments");

    return {
      success: true,
      data: true,
      message: "دیدگاه با موفقیت تایید و منتشر شد.",
    };
  } catch {
    return { success: false, error: "خطا در تایید دیدگاه رخ داد." };
  }
}

export async function rejectCommentAction(
  commentId: string,
): Promise<ActionResponse<boolean>> {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return { success: false, error: "دسترسی غیرمجاز." };
    }

    await prisma.comment.update({
      where: { id: commentId },
      data: { status: "rejected" },
    });

    revalidatePath("/");
    revalidatePath("/admin/comments");

    return {
      success: true,
      data: true,
      message: "دیدگاه با موفقیت رد شد و عدم انتشار قرار گرفت.",
    };
  } catch {
    return { success: false, error: "خطا در رد دیدگاه رخ داد." };
  }
}

export async function spamCommentAction(
  commentId: string,
): Promise<ActionResponse<boolean>> {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return { success: false, error: "دسترسی غیرمجاز." };
    }

    await prisma.comment.update({
      where: { id: commentId },
      data: { status: "spam" },
    });

    revalidatePath("/");
    revalidatePath("/admin/comments");

    return {
      success: true,
      data: true,
      message: "دیدگاه مورد نظر با موفقیت در لیست اسپم قرار گرفت.",
    };
  } catch {
    return { success: false, error: "خطا در ثبت وضعیت اسپم دیدگاه." };
  }
}

export async function editCommentAction(
  commentId: string,
  commentText: string,
): Promise<ActionResponse<boolean>> {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return { success: false, error: "دسترسی غیرمجاز." };
    }

    await prisma.comment.update({
      where: { id: commentId },
      data: { commentText },
    });

    revalidatePath("/");
    revalidatePath("/admin/comments");

    return {
      success: true,
      data: true,
      message: "دیدگاه با موفقیت ویرایش شد.",
    };
  } catch {
    return { success: false, error: "خطا در ویرایش دیدگاه رخ داد." };
  }
}

export async function deleteCommentAction(
  commentId: string,
): Promise<ActionResponse<boolean>> {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return { success: false, error: "دسترسی غیرمجاز." };
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    revalidatePath("/");
    revalidatePath("/admin/comments");

    return {
      success: true,
      data: true,
      message: "دیدگاه مورد نظر با موفقیت حذف گردید.",
    };
  } catch {
    return { success: false, error: "خطا در حذف دیدگاه رخ داد." };
  }
}

interface PrismaCommentDb {
  id: string;
  productId: string | null;
  userId: string | null;
  firstName: string | null;
  lastName: string | null;
  rating: number | null;
  commentText: string;
  createdAt: Date;
  status: "pending" | "approved" | "rejected" | "spam" | string;
  parentCommentId: string | null;
}

function buildCommentTree(comments: PrismaCommentDb[]): UIComment[] {
  const commentMap = new Map<
    string,
    UIComment & { parentCommentId: string | null }
  >();

  comments.forEach((c) => {
    commentMap.set(c.id, {
      id: c.id,
      productId: c.productId ?? undefined,
      first_name: c.firstName ?? "",
      last_name: c.lastName ?? "",
      rating: c.rating,
      comment_text: c.commentText,
      created_at: c.createdAt.toISOString(),
      status: c.status as "pending" | "approved" | "rejected" | "spam",
      replies: [],
      parentCommentId: c.parentCommentId,
    });
  });

  const rootComments: UIComment[] = [];

  comments.forEach((c) => {
    const mapped = commentMap.get(c.id);
    if (mapped) {
      if (c.parentCommentId && commentMap.has(c.parentCommentId)) {
        const parent = commentMap.get(c.parentCommentId);
        if (parent) {
          parent.replies = parent.replies || [];
          parent.replies.push(mapped);
        }
      } else {
        rootComments.push(mapped);
      }
    }
  });

  const sortReplies = (comment: UIComment) => {
    if (comment.replies && comment.replies.length > 0) {
      comment.replies.sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      );
      comment.replies.forEach(sortReplies);
    }
  };
  rootComments.forEach(sortReplies);

  return rootComments;
}
