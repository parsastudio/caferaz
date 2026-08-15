"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSignedToken, verifySignedToken } from "@/lib/session";
import { AuthService } from "@/services/auth.service";
import {
  adminLoginSchema,
  updateAdminPasswordSchema,
} from "@/domain/validations/auth.schema";

export async function loginAdminAction(formData: FormData) {
  const parsed = adminLoginSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "اطلاعات ناقص است.",
    };
  }

  const isValid = await AuthService.verifyAdminCredentials(parsed.data);

  if (isValid) {
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
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return { success: false, error: "دسترسی غیرمجاز است." };
    }

    const parsed = updateAdminPasswordSchema.safeParse(payload);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "اطلاعات ارسالی نامعتبر است.",
      };
    }

    const result = await AuthService.updateAdminPassword(parsed.data);
    if (!result.success) {
      return {
        success: false,
        error: result.error || "خطا در تغییر رمز عبور رخ داد.",
      };
    }

    return {
      success: true,
      message: "رمز عبور شما با موفقیت تغییر یافت.",
    };
  } catch {
    return { success: false, error: "خطا در تغییر رمز عبور رخ داد." };
  }
}
