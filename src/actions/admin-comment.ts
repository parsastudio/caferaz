"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { checkAdminAuth } from "@/actions/admin-auth";
import { buildCommentTree } from "@/lib/comment-tree";
import { Comment } from "@/types";
import { ActionResponse } from "@/types/actions";

export async function getAdminCommentsAction(
  productId: string,
): Promise<ActionResponse<Comment[]>> {
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
