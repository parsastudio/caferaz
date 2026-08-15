"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSignedToken, verifySignedToken } from "@/lib/session";
import { hashPassword, verifyPassword } from "@/lib/crypto";

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

export async function checkAdminAuth(): Promise<boolean> {
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
