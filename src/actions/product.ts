"use server";

import { prisma } from "@/lib/prisma";
import { ActionResponse } from "@/actions/comment";
import { revalidatePath } from "next/cache";
import { checkAdminAuth } from "@/actions/auth";
import { ProductWithPricing as UIProduct } from "@/types";

export async function getProductAction(
  productId: string,
): Promise<ActionResponse<UIProduct>> {
  try {
    if (!productId) {
      return { success: false, error: "شناسه محصول ارسال نشده است." };
    }

    const product = await prisma.product.findUnique({
      where: { id: productId, deletedAt: null },
      include: { pricing: true },
    });

    if (!product) {
      return { success: false, error: "محصول مورد نظر یافت نشد." };
    }

    return { success: true, data: mapPrismaProduct(product) };
  } catch {
    return { success: false, error: "خطا در دریافت اطلاعات محصول رخ داد." };
  }
}

export async function updateProductDetailsAction(payload: {
  productId: string;
  pricePerKgArabica: number;
  pricePerKgRobusta: number;
  stockGrams: number;
}): Promise<ActionResponse<boolean>> {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return { success: false, error: "دسترسی غیرمجاز." };
    }

    const { productId, pricePerKgArabica, pricePerKgRobusta, stockGrams } =
      payload;

    if (
      !productId ||
      pricePerKgArabica <= 0 ||
      pricePerKgRobusta <= 0 ||
      stockGrams < 0
    ) {
      return {
        success: false,
        error:
          "تمامی فیلدهای مربوط به قیمت‌گذاری و موجودی باید به درستی تکمیل گردند.",
      };
    }

    await prisma.$transaction([
      prisma.product.update({
        where: { id: productId },
        data: { stockGrams },
      }),
      prisma.pricing.upsert({
        where: { productId },
        update: { pricePerKgArabica, pricePerKgRobusta },
        create: { productId, pricePerKgArabica, pricePerKgRobusta },
      }),
    ]);

    revalidatePath("/");
    revalidatePath("/admin/pricing");

    return {
      success: true,
      data: true,
      message: "نرخ‌های پایه و موجودی انبار با موفقیت به روزرسانی شدند.",
    };
  } catch {
    return { success: false, error: "خطا در ذخیره جزئیات جدید محصول رخ داد." };
  }
}

export async function updateProductBasicInfoAction(payload: {
  productId: string;
  name: string;
  description: string;
}): Promise<ActionResponse<boolean>> {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return { success: false, error: "دسترسی غیرمجاز." };
    }

    const { productId, name, description } = payload;

    if (!productId || !name.trim() || !description.trim()) {
      return {
        success: false,
        error: "تکمیل نام و توضیحات کالا الزامی است.",
      };
    }

    await prisma.product.update({
      where: { id: productId },
      data: { name, description },
    });

    revalidatePath("/");
    revalidatePath("/admin/settings");

    return {
      success: true,
      data: true,
      message: "عنوان و توضیحات تخصصی کالا با موفقیت بروزرسانی شد.",
    };
  } catch {
    return {
      success: false,
      error: "خطا در ذخیره‌سازی اطلاعات پایه محصول.",
    };
  }
}

interface PrismaProductDb {
  id: string;
  name: string;
  description: string;
  stockGrams: number;
  pricing: {
    pricePerKgArabica: number;
    pricePerKgRobusta: number;
  } | null;
}

function mapPrismaProduct(p: PrismaProductDb): UIProduct {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    stock_grams: p.stockGrams,
    pricing: p.pricing
      ? {
          pricePerKgArabica: p.pricing.pricePerKgArabica,
          pricePerKgRobusta: p.pricing.pricePerKgRobusta,
        }
      : null,
  };
}
