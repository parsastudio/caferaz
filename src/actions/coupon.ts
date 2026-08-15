"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ActionResponse } from "@/actions/comment";
import { prisma } from "@/lib/prisma";
import {
  getBlendProfile,
  calculateAdvancedPriceMetrics,
} from "@/lib/coffee-calculations";
import { toEnglishDigits } from "@/lib/utils";
import { checkAdminAuth } from "@/actions/auth";
import { Coupon } from "@/types";

const createCouponSchema = z.object({
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

export async function validateCouponAction(payload: {
  code: string;
  phone?: string | null;
  productId: string;
  weightGrams: number;
  quantity: number;
  blend: string;
}): Promise<
  ActionResponse<{
    couponId: string;
    code: string;
    discountType: "percentage" | "fixed";
    discountValue: number;
    discountAmount: number;
    finalPrice: number;
    directDiscountAmount: number;
    conditionalDiscountAmount: number;
  }>
> {
  try {
    const { code, phone, productId, weightGrams, quantity, blend } = payload;

    if (!code) {
      return { success: false, error: "کد تخفیف نمی‌تواند خالی باشد." };
    }

    const cleanCode = code.trim().toUpperCase();
    const cleanPhone = phone ? toEnglishDigits(phone.trim()) : null;

    const { getCurrentUserAction } = await import("@/actions/auth");
    const currentUserRes = await getCurrentUserAction();
    const securePhone =
      currentUserRes.success && currentUserRes.user
        ? currentUserRes.user.phone
        : cleanPhone;

    const coupon = await prisma.coupon.findFirst({
      where: {
        code: cleanCode,
        deletedAt: null,
      },
    });

    if (!coupon || !coupon.isActive) {
      return { success: false, error: "کد تخفیف وارد شده معتبر نیست." };
    }

    if (coupon.type !== "user_code") {
      return {
        success: false,
        error: "این کد به عنوان تخفیف سیستمی و خودکار اعمال می‌گردد.",
      };
    }

    if (coupon.productId && coupon.productId !== productId) {
      return {
        success: false,
        error: "این کد تخفیف برای محصول انتخابی شما تعریف نشده است.",
      };
    }

    if (securePhone) {
      const usage = await prisma.couponUsage.findUnique({
        where: {
          couponId_phone: {
            couponId: coupon.id,
            phone: securePhone,
          },
        },
      });
      if (usage) {
        return {
          success: false,
          error: "شما قبلاً از این کد تخفیف استفاده کرده‌اید.",
        };
      }
    }

    const productFromDb = await prisma.product.findUnique({
      where: { id: productId },
      include: { pricing: true },
    });
    if (!productFromDb) {
      return { success: false, error: "محصول مورد نظر یافت نشد." };
    }

    const blendProfile = getBlendProfile(blend);
    const activeCouponsFromDb = await prisma.coupon.findMany({
      where: { deletedAt: null },
    });
    const couponUsagesFromDb = await prisma.couponUsage.findMany();

    const pricingBreakdown = calculateAdvancedPriceMetrics({
      productId,
      pricing: productFromDb.pricing,
      blendProfile,
      weightGrams,
      quantity,
      activeCoupons: activeCouponsFromDb.map(mapPrismaCoupon),
      appliedUserCouponCode: cleanCode,
      userPhone: securePhone,
      couponUsages: couponUsagesFromDb.map((u) => ({
        id: u.id,
        couponId: u.couponId,
        phone: u.phone,
        usedAt: u.usedAt.toISOString(),
      })),
    });

    if (pricingBreakdown.userCouponDiscountAmount <= 0) {
      return {
        success: false,
        error:
          "امکان اعمال این کد روی سبد خرید شما وجود ندارد. (شاید تخفیف مستقیم یا شرطی بهتری در سبد وجود دارد)",
      };
    }

    return {
      success: true,
      message: "کد تخفیف با موفقیت اعمال گردید.",
      data: {
        couponId: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType as "percentage" | "fixed",
        discountValue: coupon.discountValue,
        discountAmount: pricingBreakdown.userCouponDiscountAmount,
        finalPrice: pricingBreakdown.finalPrice,
        directDiscountAmount: pricingBreakdown.directDiscountAmount,
        conditionalDiscountAmount: pricingBreakdown.conditionalDiscountAmount,
      },
    };
  } catch {
    return { success: false, error: "خطا در پردازش و اعتبارسنجی کد تخفیف." };
  }
}

export async function getCouponsAction() {
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
  formData: z.infer<typeof createCouponSchema>,
) {
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

export async function deleteCouponAction(id: string) {
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

export async function toggleCouponStatusAction(id: string) {
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

export interface PrismaCouponDb {
  id: string;
  code: string;
  type: string;
  discountType: string;
  discountValue: number;
  productId: string | null;
  minWeightGrams: number | null;
  validFrom: Date | null;
  validTo: Date | null;
  maxDiscountAmount: number | null;
  isActive: boolean;
  deletedAt: Date | null;
  allowStacking: boolean;
}

export function mapPrismaCoupon(c: PrismaCouponDb): Coupon {
  return {
    id: c.id,
    code: c.code,
    type: c.type as Coupon["type"],
    discountType: c.discountType as Coupon["discountType"],
    discountValue: c.discountValue,
    productId: c.productId ?? undefined,
    minWeightGrams: c.minWeightGrams ?? undefined,
    validFrom: c.validFrom ? c.validFrom.toISOString() : undefined,
    validTo: c.validTo ? c.validTo.toISOString() : undefined,
    maxDiscountAmount: c.maxDiscountAmount ?? undefined,
    isActive: c.isActive,
    deletedAt: c.deletedAt ? c.deletedAt.toISOString() : null,
    allowStacking: c.allowStacking,
  };
}
