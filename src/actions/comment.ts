"use server";

import {
  getCommentsByProductId,
  addComment,
  deleteComment,
  updateCommentStatus,
  updateCommentText,
  Comment,
} from "@/lib/mock-db";
import { revalidatePath } from "next/cache";

export type ActionResponse<T> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string };

export async function getCommentsAction(
  productId: string,
): Promise<ActionResponse<Comment[]>> {
  try {
    if (!productId) {
      return { success: false, error: "شناسه محصول معتبر نیست." };
    }

    const comments = getCommentsByProductId(productId, false);
    return { success: true, data: comments };
  } catch (error) {
    return { success: false, error: "خطا در بارگذاری دیدگاه‌ها رخ داد." };
  }
}

export async function getAdminCommentsAction(
  productId: string,
): Promise<ActionResponse<Comment[]>> {
  try {
    if (!productId) {
      return { success: false, error: "شناسه محصول معتبر نیست." };
    }

    const comments = getCommentsByProductId(productId, true);
    return { success: true, data: comments };
  } catch (error) {
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
}): Promise<ActionResponse<Comment>> {
  try {
    const { productId, firstName, commentText, rating, parentId } = payload;

    if (!productId || !firstName || !commentText) {
      return {
        success: false,
        error: "تکمیل تمامی فیلدهای ستاره‌دار الزامی است.",
      };
    }

    const status =
      firstName.includes("پشتیبان") || firstName.includes("مدیر")
        ? "approved"
        : "pending";

    const newComment = addComment(productId, {
      first_name: firstName,
      last_name: "",
      rating,
      comment_text: commentText,
      parentId,
      status,
    });

    revalidatePath("/");

    return {
      success: true,
      message: "دیدگاه شما ثبت گردید و پس از بازبینی تایید خواهد شد.",
      data: newComment,
    };
  } catch (error) {
    return { success: false, error: "مشکلی در ذخیره دیدگاه شما وجود دارد." };
  }
}

export async function approveCommentAction(
  commentId: string,
): Promise<ActionResponse<boolean>> {
  try {
    if (!commentId) {
      return { success: false, error: "شناسه دیدگاه الزامی است." };
    }

    const isUpdated = updateCommentStatus(commentId, "approved");
    if (!isUpdated) {
      return { success: false, error: "دیدگاه مورد نظر یافت نشد." };
    }

    revalidatePath("/");
    revalidatePath("/admin/comments");

    return {
      success: true,
      data: true,
      message: "دیدگاه با موفقیت تایید و منتشر شد.",
    };
  } catch (error) {
    return { success: false, error: "خطا در تایید دیدگاه رخ داد." };
  }
}

export async function rejectCommentAction(
  commentId: string,
): Promise<ActionResponse<boolean>> {
  try {
    if (!commentId) {
      return { success: false, error: "شناسه دیدگاه الزامی است." };
    }

    const isUpdated = updateCommentStatus(commentId, "rejected");
    if (!isUpdated) {
      return { success: false, error: "دیدگاه مورد نظر یافت نشد." };
    }

    revalidatePath("/");
    revalidatePath("/admin/comments");

    return {
      success: true,
      data: true,
      message: "دیدگاه با موفقیت رد شد و عدم انتشار قرار گرفت.",
    };
  } catch (error) {
    return { success: false, error: "خطا در رد دیدگاه رخ داد." };
  }
}

export async function spamCommentAction(
  commentId: string,
): Promise<ActionResponse<boolean>> {
  try {
    if (!commentId) {
      return { success: false, error: "شناسه دیدگاه الزامی است." };
    }

    const isUpdated = updateCommentStatus(commentId, "spam");
    if (!isUpdated) {
      return { success: false, error: "دیدگاه مورد نظر یافت نشد." };
    }

    revalidatePath("/");
    revalidatePath("/admin/comments");

    return {
      success: true,
      data: true,
      message: "دیدگاه مورد نظر با موفقیت در لیست اسپم قرار گرفت.",
    };
  } catch (error) {
    return { success: false, error: "خطا در ثبت وضعیت اسپم دیدگاه." };
  }
}

export async function editCommentAction(
  commentId: string,
  commentText: string,
): Promise<ActionResponse<boolean>> {
  try {
    if (!commentId || !commentText.trim()) {
      return { success: false, error: "ورودی‌های ویرایش معتبر نیستند." };
    }

    const isUpdated = updateCommentText(commentId, commentText);
    if (!isUpdated) {
      return { success: false, error: "دیدگاه مورد نظر یافت نشد." };
    }

    revalidatePath("/");
    revalidatePath("/admin/comments");

    return {
      success: true,
      data: true,
      message: "دیدگاه با موفقیت ویرایش شد.",
    };
  } catch (error) {
    return { success: false, error: "خطا در ویرایش دیدگاه رخ داد." };
  }
}

export async function deleteCommentAction(
  commentId: string,
): Promise<ActionResponse<boolean>> {
  try {
    if (!commentId) {
      return { success: false, error: "شناسه دیدگاه ارسال نشده است." };
    }

    const isDeleted = deleteComment(commentId);
    if (!isDeleted) {
      return { success: false, error: "دیدگاه مورد نظر یافت نشد." };
    }

    revalidatePath("/");
    revalidatePath("/admin/comments");

    return {
      success: true,
      data: true,
      message: "دیدگاه مورد نظر با موفقیت حذف گردید.",
    };
  } catch (error) {
    return { success: false, error: "خطا در حذف دیدگاه رخ داد." };
  }
}
