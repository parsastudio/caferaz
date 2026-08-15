"use server";

import { revalidatePath } from "next/cache";
import { checkAdminAuth } from "@/actions/admin-auth";
import { Comment } from "@/domain/types";
import { ActionResponse } from "@/types/actions";
import { CommentService } from "@/services/comment.service";
import { editCommentSchema } from "@/domain/validations/comment.schema";

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

    const data = await CommentService.getAllCommentsForAdmin(productId);
    return { success: true, data };
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

    await CommentService.updateCommentStatus(commentId, "approved");

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

    await CommentService.updateCommentStatus(commentId, "rejected");

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

    await CommentService.updateCommentStatus(commentId, "spam");

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

    const validated = editCommentSchema.safeParse({ commentId, commentText });
    if (!validated.success) {
      return {
        success: false,
        error:
          validated.error.issues[0]?.message || "اطلاعات ارسالی نامعتبر است.",
      };
    }

    await CommentService.editCommentText(
      validated.data.commentId,
      validated.data.commentText,
    );

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

    await CommentService.deleteComment(commentId);

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
