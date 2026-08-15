"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkAdminAuth } from "@/actions/admin-auth";
import { mapPrismaCoupon } from "@/lib/coupon-mappers";
import { Coupon } from "@/types";
import { ActionResponse } from "@/types/actions";

export const createCouponSchema = z.object({
  code: z.string().optional(),
  type: z.enum(["product_direct", "conditional", "user_code"]),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.number().min(1, "مقدار تخفیف نامعتبر است"),
  productId: z.string().optional(),
  minWeightGrams: z.number().optional(),
  validFrom: z.string().optional(),
  validTo: z.string().optional(),
  maxDiscountAmount: z.number().optional(),
  isActive: z.boolean().default(true),
  allowStacking: z.boolean().optional().default(false),
});

export type CreateCouponInput = z.infer<typeof createCouponSchema>;

export async function getCouponsAction(): Promise<ActionResponse<Coupon[]>> {
  try {
    const coupons = await prisma.coupon.findMany({
      where: { deletedAt: null },
    });
    return { success: true, data: coupons.map(mapPrismaCoupon) };
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

    let finalCode = validated.data.code?.trim().toUpperCase();
    if (!finalCode) {
      if (validated.data.type === "product_direct") {
        finalCode = `DIR-${validated.data.discountValue}${validated.data.discountType === "percentage" ? "PCT" : "TM"}-${Math.floor(100 + Math.random() * 900)}`;
      } else if (validated.data.type === "conditional") {
        finalCode = `COND-${validated.data.minWeightGrams ? validated.data.minWeightGrams / 1000 + "KG" : "VAL"}-${Math.floor(100 + Math.random() * 900)}`;
      } else {
        return {
          success: false,
          error: "وارد کردن کد تخفیف برای تخفیف‌های دستی کاربر الزامی است.",
        };
      }
    }

    const validFromDate = validated.data.validFrom
      ? new Date(validated.data.validFrom)
      : null;
    const validToDate = validated.data.validTo
      ? new Date(validated.data.validTo)
      : null;

    const coupon = await prisma.coupon.create({
      data: {
        code: finalCode,
        type: validated.data.type,
        discountType: validated.data.discountType,
        discountValue: validated.data.discountValue,
        productId: validated.data.productId || null,
        minWeightGrams: validated.data.minWeightGrams || null,
        validFrom: validFromDate,
        validTo: validToDate,
        maxDiscountAmount: validated.data.maxDiscountAmount || null,
        isActive: validated.data.isActive,
        allowStacking: validated.data.allowStacking,
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/coupons");

    return {
      success: true,
      data: mapPrismaCoupon(coupon),
      message: "کد تخفیف با موفقیت در سیستم تعریف شد.",
    };
  } catch {
    return { success: false, error: "خطا در ثبت کد تخفیف جدید." };
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

    await prisma.coupon.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });

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

    const existing = await prisma.coupon.findUnique({
      where: { id },
    });

    if (!existing) {
      return { success: false, error: "کد تخفیف یافت نشد." };
    }

    await prisma.coupon.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });

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
