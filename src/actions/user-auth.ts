"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSignedToken, verifySignedToken } from "@/lib/session";
import { sendOtpCode, verifyOtpInternal } from "@/lib/otp-service";
import { User } from "@/types";

export async function sendUserOtpAction(payload: { phone: string }) {
  try {
    const { phone } = payload;
    if (!phone) {
      return { success: false, error: "شماره همراه ارسال نشده است." };
    }

    const headersList = await headers();
    let ip =
      headersList.get("x-forwarded-for") ||
      headersList.get("x-real-ip") ||
      "127.0.0.1";
    if (ip.includes(",")) {
      ip = ip.split(",")[0].trim();
    }

    return await sendOtpCode(phone, ip);
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
    const { phone, name, otp } = payload;

    if (!phone || !otp) {
      return { success: false, error: "اطلاعات ارسالی ناقص است." };
    }

    const isOtpValid = await verifyOtpInternal(phone, otp);
    if (!isOtpValid) {
      return {
        success: false,
        error: "کد تایید وارد شده نادرست، منقضی یا بیش از حد حدس زده شده است.",
      };
    }

    const displayName = name.trim() || "کاربر کافه راز";

    await prisma.user.upsert({
      where: { phone: phone.trim() },
      update: { name: displayName },
      create: { phone: phone.trim(), name: displayName },
    });

    const cookieStore = await cookies();
    cookieStore.set("user_phone", createSignedToken(phone.trim()), {
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
    const { phone, otp } = payload;

    if (!phone || !otp) {
      return { success: false, error: "اطلاعات ارسالی ناقص است." };
    }

    const isOtpValid = await verifyOtpInternal(phone, otp);
    if (!isOtpValid) {
      return {
        success: false,
        error: "کد تایید وارد شده نادرست، منقضی یا بیش از حد حدس زده شده است.",
      };
    }

    const existingUser = await prisma.user.findUnique({
      where: { phone: phone.trim() },
    });
    const displayName = existingUser ? existingUser.name : "کاربر کافه راز";

    await prisma.user.upsert({
      where: { phone: phone.trim() },
      update: {},
      create: { phone: phone.trim(), name: displayName },
    });

    const cookieStore = await cookies();
    cookieStore.set("user_phone", createSignedToken(phone.trim()), {
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
    const { phone, name, address, otp } = payload;

    if (!phone || !name || !address || !otp) {
      return { success: false, error: "پر کردن تمامی فیلدها الزامی است." };
    }

    const isOtpValid = await verifyOtpInternal(phone, otp);
    if (!isOtpValid) {
      return {
        success: false,
        error: "کد تایید وارد شده نادرست، منقضی یا بیش از حد حدس زده شده است.",
      };
    }

    await prisma.user.upsert({
      where: { phone: phone.trim() },
      update: { name, address },
      create: { phone: phone.trim(), name, address },
    });

    const cookieStore = await cookies();
    cookieStore.set("user_phone", createSignedToken(phone.trim()), {
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
    const { phone } = payload;
    const user = await prisma.user.findUnique({
      where: { phone: phone.trim() },
    });

    const mappedUser: User | null = user
      ? {
          id: user.id,
          name: user.name,
          phone: user.phone,
          createdAt: user.createdAt.toISOString(),
          address: user.address ?? undefined,
        }
      : null;

    return { success: true, registered: !!user, user: mappedUser };
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

    const user = await prisma.user.findUnique({
      where: { phone: phone.trim() },
    });

    const mappedUser: User | null = user
      ? {
          id: user.id,
          name: user.name,
          phone: user.phone,
          createdAt: user.createdAt.toISOString(),
          address: user.address ?? undefined,
        }
      : null;

    return { success: true, user: mappedUser };
  } catch {
    return { success: false, user: null };
  }
}

export async function logoutUserAction() {
  const cookieStore = await cookies();
  cookieStore.delete("user_phone");
  redirect("/");
}
