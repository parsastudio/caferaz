"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

let adminPasswordStore = "admin123";

export async function loginAdminAction(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

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

    if (!oldPass || !newPass) {
      return { success: false, error: "پر کردن تمامی فیلدها الزامی است." };
    }

    if (oldPass !== adminPasswordStore) {
      return { success: false, error: "رمز عبور فعلی نادرست است." };
    }

    if (newPass.length < 6) {
      return {
        success: false,
        error: "رمز عبور جدید باید حداقل ۶ کاراکتر باشد.",
      };
    }

    adminPasswordStore = newPass;

    return {
      success: true,
      message: "رمز عبور شما با موفقیت تغییر یافت.",
    };
  } catch (error) {
    return { success: false, error: "خطا در تغییر رمز عبور رخ داد." };
  }
}
