"use server";

import { revalidatePath } from "next/cache";
import { checkAdminAuth } from "@/actions/admin-auth";
import { Coupon } from "@/domain/types";
import { ActionResponse } from "@/types/actions";
import {
  createCouponSchema,
  type CreateCouponInput,
} from "@/domain/validations/coupon.schema";
import { CouponService } from "@/services/coupon.service";

export async function getCouponsAction(): Promise<ActionResponse<Coupon[]>> {
  try {
    const data = await CouponService.getAllCoupons();
    return { success: true, data };
  } catch {
    return { success: false, error: "خطا در دریافت لیست تخفیف‌ها." };
  }
}

export async function createCouponAction(
  formData: CreateCouponInput,
): Promise<ActionResponse<Coupon>> {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return { success: false, error: "دسترسی غیرمجاز." };
    }

    const validated = createCouponSchema.safeParse(formData);
    if (!validated.success) {
      return {
        success: false,
        error:
          validated.error.issues[0]?.message || "اطلاعات ارسالی معتبر نیست.",
      };
    }

    const coupon = await CouponService.createCoupon(validated.data);

    revalidatePath("/");
    revalidatePath("/admin/coupons");

    return {
      success: true,
      data: coupon,
      message: "کد تخفیف با موفقیت در سیستم تعریف شد.",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "خطا در ثبت کد تخفیف جدید.",
    };
  }
}

export async function deleteCouponAction(
  id: string,
): Promise<ActionResponse<boolean>> {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return { success: false, error: "دسترسی غیرمجاز." };
    }

    await CouponService.deleteCoupon(id);

    revalidatePath("/");
    revalidatePath("/admin/coupons");

    return {
      success: true,
      data: true,
      message: "کد تخفیف با موفقیت حذف گردید.",
    };
  } catch {
    return { success: false, error: "خطا در حذف کد تخفیف." };
  }
}

export async function toggleCouponStatusAction(
  id: string,
): Promise<ActionResponse<boolean>> {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return { success: false, error: "دسترسی غیرمجاز." };
    }

    await CouponService.toggleCouponStatus(id);

    revalidatePath("/");
    revalidatePath("/admin/coupons");

    return {
      success: true,
      data: true,
      message: "وضعیت فعال‌بودن کد تخفیف تغییر یافت.",
    };
  } catch {
    return { success: false, error: "خطا در تغییر وضعیت کد تخفیف." };
  }
}
