"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSignedToken, verifySignedToken } from "@/lib/session";
import { AuthService } from "@/services/auth.service";
import {
  sendOtpSchema,
  loginUserWithOtpSchema,
  registerUserSchema,
  quickLoginUserSchema,
} from "@/domain/validations/auth.schema";

export async function sendUserOtpAction(payload: { phone: string }) {
  try {
    const parsed = sendOtpSchema.safeParse(payload);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "شماره همراه نامعتبر است.",
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

export async function loginUserAction(payload: {
  phone: string;
  name: string;
  otp: string;
}) {
  try {
    const parsed = quickLoginUserSchema.safeParse(payload);
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

    const user = await AuthService.quickLoginUser(parsed.data);

    const cookieStore = await cookies();
    cookieStore.set("user_phone", createSignedToken(user.phone), {
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
    cookieStore.set("user_phone", createSignedToken(user.phone), {
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
    cookieStore.set("user_phone", createSignedToken(user.phone), {
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

export async function checkPhoneRegisteredAction(payload: { phone: string }) {
  try {
    const parsed = sendOtpSchema.safeParse(payload);
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

    const phone = verifySignedToken(signedCookie);
    if (!phone) {
      return { success: true, user: null };
    }

    const user = await AuthService.getUserByPhone(phone);
    return { success: true, user };
  } catch {
    return { success: false, user: null };
  }
}

export async function logoutUserAction() {
  const cookieStore = await cookies();
  cookieStore.delete("user_phone");
  redirect("/");
}
