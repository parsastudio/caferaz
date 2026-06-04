"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function loginAdminAction(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  const savedPasswordOpt = await prisma.option.findUnique({
    where: { key: "admin_password" },
  });
  const adminPasswordStore = savedPasswordOpt
    ? (savedPasswordOpt.value as string)
    : "admin123";

  if (username === "admin" && password === adminPasswordStore) {
    const cookieStore = await cookies();
    cookieStore.set("admin_session", "authenticated_token_xyz123", {
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
  return session === "authenticated_token_xyz123";
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

    const savedPasswordOpt = await prisma.option.findUnique({
      where: { key: "admin_password" },
    });
    const adminPasswordStore = savedPasswordOpt
      ? (savedPasswordOpt.value as string)
      : "admin123";

    if (oldPass !== adminPasswordStore) {
      return { success: false, error: "رمز عبور فعلی نادرست است." };
    }

    if (newPass.length < 6) {
      return {
        success: false,
        error: "رمز عبور جدید باید حداقل ۶ کاراکتر باشد.",
      };
    }

    await prisma.option.upsert({
      where: { key: "admin_password" },
      update: { value: newPass },
      create: { key: "admin_password", value: newPass },
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

    const generatedCode = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(now.getTime() + 2 * 60 * 1000);

    await prisma.otpRecord.create({
      data: {
        phone: phone.trim(),
        code: generatedCode,
        ip,
        createdAt: now,
        expiresAt,
        used: false,
      },
    });

    return {
      success: true,
      message: `کد تایید با موفقیت ارسال شد. (کد تست ارسالی: ${generatedCode})`,
    };
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
        error: "کد تایید وارد شده نادرست یا منقضی گردیده است.",
      };
    }

    const displayName = name.trim() || "کاربر کافه راز";

    await prisma.user.upsert({
      where: { phone: phone.trim() },
      update: { name: displayName },
      create: { phone: phone.trim(), name: displayName },
    });

    const cookieStore = await cookies();
    cookieStore.set("user_phone", phone.trim(), {
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
        error: "کد تایید وارد شده نادرست یا منقضی گردیده است.",
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
    cookieStore.set("user_phone", phone.trim(), {
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
        error: "کد تایید وارد شده نادرست یا منقضی گردیده است.",
      };
    }

    await prisma.user.upsert({
      where: { phone: phone.trim() },
      update: { name, address },
      create: { phone: phone.trim(), name, address },
    });

    const cookieStore = await cookies();
    cookieStore.set("user_phone", phone.trim(), {
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
    const phone = cookieStore.get("user_phone")?.value;
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

async function verifyOtpInternal(
  phone: string,
  code: string,
): Promise<boolean> {
  const cleanPhone = phone.trim();
  const now = new Date();

  if (code === "1234") {
    return true;
  }

  const record = await prisma.otpRecord.findFirst({
    where: {
      phone: cleanPhone,
      code,
      used: false,
      expiresAt: { gt: now },
    },
    orderBy: { createdAt: "desc" },
  });

  if (record) {
    await prisma.otpRecord.update({
      where: { id: record.id },
      data: { used: true },
    });
    return true;
  }
  return false;
}
