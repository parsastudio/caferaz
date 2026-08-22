"use server";

import { revalidatePath } from "next/cache";
import { checkAdminAuth } from "@/actions/admin-auth";
import { FaqService } from "@/services/faq.service";
import {
  createFaqSchema,
  updateFaqSchema,
  CreateFaqInput,
  UpdateFaqInput,
  FAQItem,
} from "@/domain/validations/faq.schema";
import { ActionResponse } from "@/types/actions";

export async function createFaqAction(
  payload: CreateFaqInput,
): Promise<ActionResponse<FAQItem>> {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return { success: false, error: "دسترسی غیرمجاز." };
    }

    const validated = createFaqSchema.safeParse(payload);
    if (!validated.success) {
      return {
        success: false,
        error:
          validated.error.issues[0]?.message || "اطلاعات ارسالی نامعتبر است.",
      };
    }

    const data = await FaqService.createFaq(validated.data);

    revalidatePath("/");
    revalidatePath("/admin/faq");

    return {
      success: true,
      data,
      message: "سوال متداول جدید با موفقیت ایجاد شد.",
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "خطا در ثبت سوال متداول.",
    };
  }
}

export async function updateFaqAction(
  payload: UpdateFaqInput,
): Promise<ActionResponse<FAQItem>> {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return { success: false, error: "دسترسی غیرمجاز." };
    }

    const validated = updateFaqSchema.safeParse(payload);
    if (!validated.success) {
      return {
        success: false,
        error:
          validated.error.issues[0]?.message || "اطلاعات ارسالی نامعتبر است.",
      };
    }

    const data = await FaqService.updateFaq(validated.data);

    revalidatePath("/");
    revalidatePath("/admin/faq");

    return {
      success: true,
      data,
      message: "سوال متداول با موفقیت ویرایش گردید.",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "خطا در ویرایش سوال متداول.",
    };
  }
}

export async function deleteFaqAction(
  id: string,
): Promise<ActionResponse<boolean>> {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return { success: false, error: "دسترسی غیرمجاز." };
    }

    if (!id) {
      return { success: false, error: "شناسه سوال نامعتبر است." };
    }

    await FaqService.deleteFaq(id);

    revalidatePath("/");
    revalidatePath("/admin/faq");

    return {
      success: true,
      data: true,
      message: "سوال متداول با موفقیت حذف گردید.",
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "خطا در حذف سوال متداول.",
    };
  }
}
