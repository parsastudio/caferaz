"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { createSignedToken, verifySignedToken } from "@/lib/session";

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 600000, 64, "sha512")
    .toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const parts = storedHash.split(":");
    if (parts.length !== 2) return false;
    const [salt, hash] = parts;
    const verifyHash = crypto
      .pbkdf2Sync(password, salt, 600000, 64, "sha512")
      .toString("hex");
    return hash === verifyHash;
  } catch {
    return false;
  }
}

export async function loginAdminAction(formData: FormData) {
  const username = (formData.get("username") as string)?.trim();
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { success: false, error: "تمامی فیلدها الزامی هستند." };
  }

  const adminCredentialsOpt = await prisma.option.findUnique({
    where: { key: "admin_credentials" },
  });

  const storedCreds = adminCredentialsOpt
    ? (adminCredentialsOpt.value as { username: string; passwordHash: string })
    : null;

  if (!storedCreds) {
    return { success: false, error: "تنظیمات ادمین یافت نشد." };
  }

  const isUsernameMatch = username === storedCreds.username;
  const isPasswordMatch = verifyPassword(password, storedCreds.passwordHash);

  if (isUsernameMatch && isPasswordMatch) {
    const cookieStore = await cookies();
    cookieStore.set("admin_session", createSignedToken("admin"), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24,
      path: "/",
    });
    return { success: true };
  }

  return { success: false, error: "نام کاربری یا رمز عبور اشتباه است." };
}

export async function logoutAdminAction() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  redirect("/");
}

export async function checkAdminAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;
  if (!session) return false;
  return verifySignedToken(session) === "admin";
}

export async function updateAdminPasswordAction(payload: {
  oldPass: string;
  newPass: string;
}) {
  try {
    const { oldPass, newPass } = payload;

    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return { success: false, error: "دسترسی غیرمجاز است." };
    }

    if (!oldPass || !newPass) {
      return { success: false, error: "پر کردن تمامی فیلدها الزامی است." };
    }

    const adminCredentialsOpt = await prisma.option.findUnique({
      where: { key: "admin_credentials" },
    });

    const storedCreds = adminCredentialsOpt
      ? (adminCredentialsOpt.value as {
          username: string;
          passwordHash: string;
        })
      : null;

    if (!storedCreds) {
      return { success: false, error: "تنظیمات ادمین یافت نشد." };
    }

    const isOldPasswordValid = verifyPassword(
      oldPass,
      storedCreds.passwordHash,
    );

    if (!isOldPasswordValid) {
      return { success: false, error: "رمز عبور فعلی نادرست است." };
    }

    if (newPass.length < 6) {
      return {
        success: false,
        error: "رمز عبور جدید باید حداقل ۶ کاراکتر باشد.",
      };
    }

    const updatedCreds = {
      username: storedCreds.username,
      passwordHash: hashPassword(newPass),
    };

    await prisma.option.upsert({
      where: { key: "admin_credentials" },
      update: { value: updatedCreds },
      create: { key: "admin_credentials", value: updatedCreds },
    });

    return {
      success: true,
      message: "رمز عبور شما با موفقیت تغییر یافت.",
    };
  } catch {
    return { success: false, error: "خطا در تغییر رمز عبور رخ داد." };
  }
}

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

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);

    const ipUsageLastHour = await prisma.otpRecord.count({
      where: {
        ip,
        createdAt: { gte: oneHourAgo },
      },
    });

    if (ipUsageLastHour >= 10) {
      return {
        success: false,
        error:
          "به دلیل تعدد تلاش‌های مشکوک، درخواست از آی‌پی شما به مدت یک ساعت معلق گردید.",
      };
    }

    const lastSentRecord = await prisma.otpRecord.findFirst({
      where: {
        phone: phone.trim(),
        createdAt: { gte: twoMinutesAgo },
      },
      orderBy: { createdAt: "desc" },
    });

    if (lastSentRecord) {
      const elapsedSeconds = Math.floor(
        (now.getTime() - lastSentRecord.createdAt.getTime()) / 1000,
      );
      const remainingSeconds = 120 - elapsedSeconds;
      return {
        success: false,
        error: `لطفاً ${remainingSeconds} ثانیه دیگر جهت دریافت مجدد کد تایید شکیبا باشید.`,
      };
    }

    const phoneUsageLastHour = await prisma.otpRecord.count({
      where: {
        phone: phone.trim(),
        createdAt: { gte: oneHourAgo },
      },
    });

    if (phoneUsageLastHour >= 5) {
      return {
        success: false,
        error:
          "ارسال بیش از حد مجاز در ساعت (حداکثر ۵ بار). لطفاً ساعتی دیگر مجدداً تلاش نمایید.",
      };
    }

    const generatedCode = crypto.randomInt(1000, 10000).toString();
    const expiresAt = new Date(now.getTime() + 2 * 60 * 1000);

    await prisma.otpRecord.create({
      data: {
        phone: phone.trim(),
        code: generatedCode,
        ip,
        createdAt: now,
        expiresAt,
        used: false,
        attempts: 0,
      },
    });

    const isProd = process.env.NODE_ENV === "production";

    return {
      success: true,
      message: isProd
        ? "کد تایید با موفقیت ارسال شد."
        : `کد تایید با موفقیت ارسال شد. (کد تست ارسالی: ${generatedCode})`,
    };
  } catch {
    return { success: false, error: "خطا در فرآیند ارسال کد تایید پیامکی." };
  }
}

export async function verifyOtpInternal(
  phone: string,
  code: string,
): Promise<boolean> {
  const cleanPhone = phone.trim();
  const now = new Date();

  if (process.env.NODE_ENV === "development" && code === "1234") {
    return true;
  }

  const record = await prisma.otpRecord.findFirst({
    where: {
      phone: cleanPhone,
      used: false,
      expiresAt: { gt: now },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!record) {
    return false;
  }

  const MAX_ATTEMPTS = 5;

  if (record.attempts >= MAX_ATTEMPTS) {
    await prisma.otpRecord.update({
      where: { id: record.id },
      data: { used: true },
    });
    return false;
  }

  if (record.code === code) {
    await prisma.otpRecord.update({
      where: { id: record.id },
      data: { used: true },
    });
    return true;
  } else {
    const nextAttempts = record.attempts + 1;
    const shouldInvalidate = nextAttempts >= MAX_ATTEMPTS;

    await prisma.otpRecord.update({
      where: { id: record.id },
      data: {
        attempts: nextAttempts,
        used: shouldInvalidate ? true : record.used,
      },
    });
    return false;
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

    const mappedUser = user
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

    const mappedUser = user
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
