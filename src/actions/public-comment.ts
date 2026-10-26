"use server";

import { revalidatePath } from "next/cache";
import { checkAdminAuth } from "@/actions/admin-auth";
import { Comment } from "@/domain/types";
import { ActionResponse } from "@/types/actions";
import {
  submitCommentSchema,
  type SubmitCommentInput,
} from "@/domain/validations/comment.schema";
import { CommentService } from "@/services/comment.service";

export async function getCommentsAction(
  productId: string,
): Promise<ActionResponse<Comment[]>> {
  try {
    if (!productId) {
      return { success: false, error: "شناسه محصول معتبر نیست." };
    }

    const data = await CommentService.getApprovedComments(productId);
    return { success: true, data };
  } catch {
    return { success: false, error: "خطا در بارگذاری دیدگاه‌ها رخ داد." };
  }
}

export async function submitCommentAction(
  payload: SubmitCommentInput,
): Promise<ActionResponse<Comment>> {
  try {
    const validated = submitCommentSchema.safeParse(payload);
    if (!validated.success) {
      return {
        success: false,
        error:
          validated.error.issues[0]?.message || "اطلاعات ارسالی معتبر نیست.",
      };
    }

    const isAdmin = await checkAdminAuth();
    const status = isAdmin ? "approved" : "pending";

    const data = await CommentService.submitComment(validated.data, status);

    revalidatePath("/", "page");
    if (isAdmin) {
      revalidatePath("/admin/comments");
    }

    return {
      success: true,
      message: isAdmin
        ? "دیدگاه پشتیبان با موفقیت تایید و منتشر گردید."
        : "دیدگاه شما ثبت گردید و پس از بازبینی تایید خواهد شد.",
      data,
    };
  } catch {
    return { success: false, error: "مشکلی در ذخیره دیدگاه شما وجود دارد." };
  }
}
