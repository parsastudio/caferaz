"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  createScopedToken,
  verifyScopedToken,
  createFormToken,
  verifyFormToken,
} from "@/lib/session";
import { AuthService } from "@/services/auth.service";
import {
  sendOtpSchema,
  checkPhoneSchema,
  loginUserWithOtpSchema,
  registerUserSchema,
  type SendOtpInput,
  type CheckPhoneInput,
} from "@/domain/validations/auth.schema";
import { ActionResponse } from "@/types/actions";

export async function getOtpFormTokenAction(): Promise<ActionResponse<string>> {
  try {
    const token = createFormToken("otp_challenge");
    return { success: true, data: token };
  } catch {
    return { success: false, error: "خطا در تولید توکن اعتبارسنجی." };
  }
}

export async function sendUserOtpAction(payload: SendOtpInput) {
  try {
    const parsed = sendOtpSchema.safeParse(payload);
    if (!parsed.success) {
      return {
        success: false,
        error:
          parsed.error.issues[0]?.message ||
          "شماره همراه یا توکن اعتبارسنجی نامعتبر است.",
      };
    }

    if (parsed.data.honeypot && parsed.data.honeypot.trim().length > 0) {
      return {
        success: true,
        message: "کد تایید با موفقیت ارسال شد.",
      };
    }

    const isValidTiming = verifyFormToken(parsed.data.formToken, 1000);
    if (!isValidTiming) {
      return {
        success: false,
        error: "درخواست نامعتبر یا منقضی شده است. لطفاً صفحه را رفرش فرمایید.",
      };
    }

    const headersList = await headers();
    let ip =
      headersList.get("x-forwarded-for") ||
      headersList.get("x-real-ip") ||
      "127.0.0.1";
    if (ip.includes(",")) {
      ip = ip.split(",")[0].trim();
    }

    return await AuthService.sendOtp(parsed.data.phone, ip);
  } catch {
    return { success: false, error: "خطا در فرآیند ارسال کد تایید پیامکی." };
  }
}

export async function loginUserWithOtpAction(payload: {
  phone: string;
  otp: string;
}) {
  try {
    const parsed = loginUserWithOtpSchema.safeParse(payload);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "اطلاعات ناقص است.",
      };
    }

    const isOtpValid = await AuthService.verifyOtp(
      parsed.data.phone,
      parsed.data.otp,
    );
    if (!isOtpValid) {
      return {
        success: false,
        error: "کد تایید وارد شده نادرست، منقضی یا بیش از حد حدس زده شده است.",
      };
    }

    const user = await AuthService.loginUserWithOtp(parsed.data);

    const cookieStore = await cookies();
    cookieStore.set("user_phone", createScopedToken("user", user.phone), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return { success: true };
  } catch {
    return { success: false, error: "خطایی در فرآیند ورود رخ داد." };
  }
}

export async function registerUserAction(payload: {
  phone: string;
  name: string;
  address: string;
  otp: string;
}) {
  try {
    const parsed = registerUserSchema.safeParse(payload);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "اطلاعات ناقص است.",
      };
    }

    const isOtpValid = await AuthService.verifyOtp(
      parsed.data.phone,
      parsed.data.otp,
    );
    if (!isOtpValid) {
      return {
        success: false,
        error: "کد تایید وارد شده نادرست، منقضی یا بیش از حد حدس زده شده است.",
      };
    }

    const user = await AuthService.registerUser(parsed.data);

    const cookieStore = await cookies();
    cookieStore.set("user_phone", createScopedToken("user", user.phone), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return { success: true };
  } catch {
    return { success: false, error: "خطایی در فرآیند ثبت نام رخ داد." };
  }
}

export async function checkPhoneRegisteredAction(payload: CheckPhoneInput) {
  try {
    const parsed = checkPhoneSchema.safeParse(payload);
    if (!parsed.success) {
      return { success: false, error: "شماره همراه نامعتبر است." };
    }

    const user = await AuthService.getUserByPhone(parsed.data.phone);
    return { success: true, registered: !!user, user };
  } catch {
    return { success: false, error: "خطا در بررسی شماره تماس." };
  }
}

export async function getCurrentUserAction() {
  try {
    const cookieStore = await cookies();
    const signedCookie = cookieStore.get("user_phone")?.value;
    if (!signedCookie) {
      return { success: true, user: null };
    }

    const phone = verifyScopedToken("user", signedCookie);
    if (!phone) {
      return { success: true, user: null };
    }

    const user = await AuthService.getUserByPhone(phone);
    return { success: true, user };
  } catch {
    return { success: false, user: null };
  }
}

export type GlobalStatusBarData =
  | { type: "none" }
  | {
      type: "admin";
      data: {
        monthSales: number;
        pendingOrdersCount: number;
        pendingCommentsCount: number;
      };
    }
  | {
      type: "user";
      data: {
        user: import("@/domain/types").User;
        pendingUserOrdersCount: number;
      };
    };

export async function getGlobalStatusBarDataAction(): Promise<
  ActionResponse<GlobalStatusBarData>
> {
  try {
    const isAdmin = await checkAdminAuth();
    const userRes = await getCurrentUserAction();
    const user = userRes.success ? userRes.user : null;

    if (!isAdmin && !user) {
      return { success: true, data: { type: "none" } };
    }

    if (isAdmin) {
      const { CommentService } = await import("@/services/comment.service");
      const { OrderService } = await import("@/services/order.service");
      const pendingCommentsCount =
        await CommentService.getPendingCommentsCount();
      const { monthSales, pendingOrdersCount } =
        await OrderService.getAdminStatusBarMetrics();

      return {
        success: true,
        data: {
          type: "admin",
          data: { monthSales, pendingOrdersCount, pendingCommentsCount },
        },
      };
    }

    if (user) {
      const { OrderService } = await import("@/services/order.service");
      const pendingUserOrdersCount =
        await OrderService.getPendingUserOrdersCount(user.phone);

      return {
        success: true,
        data: {
          type: "user",
          data: { user, pendingUserOrdersCount },
        },
      };
    }

    return { success: true, data: { type: "none" } };
  } catch {
    return { success: true, data: { type: "none" } };
  }
}

export async function logoutUserAction() {
  const cookieStore = await cookies();
  cookieStore.delete("user_phone");
  redirect("/");
}
