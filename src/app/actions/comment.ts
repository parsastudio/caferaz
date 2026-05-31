"use server";

import { getCommentsByProductId, addComment, Comment } from "@/lib/mock-db";
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

    const comments = getCommentsByProductId(productId);
    return { success: true, data: comments };
  } catch (error) {
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
    const { productId, firstName, commentText, rating, parentId } = payload;

    if (!productId || !firstName || !commentText) {
      return {
        success: false,
        error: "تکمیل تمامی فیلدهای ستاره‌دار الزامی است.",
      };
    }

    const newComment = addComment(productId, {
      first_name: firstName,
      last_name: "",
      rating,
      comment_text: commentText,
      parentId,
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
