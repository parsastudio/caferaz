"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { ActionResponse } from "@/types/actions";
import { AuthService } from "@/services/auth.service";
import { OrderService } from "@/services/order.service";
import { getCurrentUserAction } from "@/actions/user-auth";
import { Order } from "@/domain/types";
import { createSignedToken } from "@/lib/session";
import {
  serverOrderSchema,
  type ServerOrderPayload,
} from "@/domain/validations/order.schema";

export { serverOrderSchema, type ServerOrderPayload };

export async function submitOrderAction(
  payload: ServerOrderPayload,
): Promise<ActionResponse<Order>> {
  try {
    const validated = serverOrderSchema.safeParse(payload);
    if (!validated.success) {
      return {
        success: false,
        error:
          validated.error.issues[0]?.message || "اطلاعات ارسالی معتبر نیست.",
      };
    }

    const currentUserRes = await getCurrentUserAction();
    const isAuth = currentUserRes.success && Boolean(currentUserRes.user);
    const securePhone = isAuth
      ? currentUserRes.user!.phone
      : validated.data.customerPhone;

    if (!isAuth) {
      if (!validated.data.otp) {
        return {
          success: false,
          error: "ورود کد تایید پیامکی الزامی است.",
        };
      }

      const isOtpValid = await AuthService.verifyOtp(
        securePhone,
        validated.data.otp,
      );
      if (!isOtpValid) {
        return {
          success: false,
          error:
            "کد تایید وارد شده اشتباه یا زمان اعتبار آن به پایان رسیده است.",
        };
      }
    }

    const finalOrder = await OrderService.createOrderTransaction(
      validated.data,
      securePhone,
    );

    const cookieStore = await cookies();
    cookieStore.set("user_phone", createSignedToken(securePhone), {
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
      data: finalOrder,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "خطایی در فرآیند محاسبات و ثبت نهایی سفارش رخ داد.",
    };
  }
}
