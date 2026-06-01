"use server";

import {
  createOrder,
  getOrders,
  getProductWithPricing,
  getOrCreateUser,
  updateOrderStatus,
  Order,
} from "@/lib/mock-db";
import {
  getBlendProfile,
  calculatePriceMetrics,
} from "@/lib/coffee-calculations";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { ActionResponse } from "./comment";

export async function getOrdersAction(): Promise<ActionResponse<Order[]>> {
  try {
    const orders = getOrders();
    return { success: true, data: orders };
  } catch (error) {
    return { success: false, error: "خطا در دریافت تاریخچه سفارش‌ها رخ داد." };
  }
}

export async function updateOrderStatusAction(
  orderId: string,
  status: "pending" | "completed",
): Promise<ActionResponse<boolean>> {
  try {
    const updated = updateOrderStatus(orderId, status);
    if (!updated) {
      return { success: false, error: "سفارش مورد نظر یافت نشد." };
    }
    revalidatePath("/admin/orders");
    revalidatePath("/profile");
    return {
      success: true,
      data: true,
      message: "وضعیت سفارش با موفقیت به روزرسانی شد.",
    };
  } catch (error) {
    return { success: false, error: "خطا در به روزرسانی وضعیت سفارش." };
  }
}

export async function submitOrderAction(payload: {
  productId: string;
  weightGrams: number;
  quantity: number;
  blend: string;
  grind: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  otp: string;
}): Promise<ActionResponse<Order>> {
  try {
    const {
      productId,
      weightGrams,
      quantity,
      blend,
      grind,
      customerName,
      customerPhone,
      customerAddress,
      otp,
    } = payload;

    if (
      !productId ||
      !weightGrams ||
      !quantity ||
      !blend ||
      !grind ||
      !customerName ||
      !customerPhone ||
      !customerAddress ||
      !otp
    ) {
      return {
        success: false,
        error: "اطلاعات ارسالی برای ثبت سفارش ناقص است.",
      };
    }

    if (otp !== "1234") {
      return {
        success: false,
        error:
          "کد تایید پیامکی معتبر نیست. لطفاً مجدداً تلاش کنید. (کد تست: ۱۲۳۴)",
      };
    }

    const product = getProductWithPricing(productId);
    if (!product) {
      return {
        success: false,
        error: "محصول مورد نظر یافت نشد.",
      };
    }

    const blendProfile = getBlendProfile(blend);
    const priceMetrics = calculatePriceMetrics(
      product.pricing,
      blendProfile,
      Number(weightGrams),
      Number(quantity),
    );

    const secureFinalPrice = priceMetrics.finalPrice;

    const newOrder = createOrder({
      productId,
      weightGrams: Number(weightGrams),
      quantity: Number(quantity),
      grindType: `ترکیب: ${blend} | آسیاب: ${grind}`,
      finalPrice: secureFinalPrice,
      customerName,
      customerPhone,
      customerAddress,
    });

    getOrCreateUser(customerPhone, customerName);

    const cookieStore = await cookies();
    cookieStore.set("user_phone", customerPhone, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    revalidatePath("/");
    revalidatePath("/profile");

    return {
      success: true,
      data: newOrder,
    };
  } catch (error) {
    return {
      success: false,
      error: "خطایی در فرآیند محاسبات و ثبت نهایی سفارش رخ داد.",
    };
  }
}
