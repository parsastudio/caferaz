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

export async function sendUserOtpAction(payload: { phone: string }) {
  try {
    const { phone } = payload;
    if (!phone) {
      return { success: false, error: "شماره همراه ارسال نشده است." };
    }
    return { success: true, message: "کد تایید با موفقیت ارسال شد." };
  } catch {
    return { success: false, error: "خطا در ارسال پیامک." };
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

    if (otp !== "1234") {
      return {
        success: false,
        error: "کد تایید پیامک شده معتبر نیست. (کد تست: ۱۲۳۴)",
      };
    }

    const { getOrCreateUser } = await import("@/lib/mock-db");
    const displayName = name.trim() || "کاربر کافه راز";
    getOrCreateUser(phone, displayName);

    const cookieStore = await cookies();
    cookieStore.set("user_phone", phone, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return { success: true };
  } catch (error) {
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

    if (otp !== "1234") {
      return { success: false, error: "کد تایید معتبر نیست. (کد تست: ۱۲۳۴)" };
    }

    const { getOrCreateUser, getUserByPhone } = await import("@/lib/mock-db");

    const existingUser = getUserByPhone(phone);
    const displayName = existingUser ? existingUser.name : "کاربر کافه راز";

    getOrCreateUser(phone, displayName);

    const cookieStore = await cookies();
    cookieStore.set("user_phone", phone, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return { success: true };
  } catch (error) {
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

    if (otp !== "1234") {
      return { success: false, error: "کد تایید نامعتبر است. (کد تست: ۱۲۳۴)" };
    }

    const { getOrCreateUser } = await import("@/lib/mock-db");
    getOrCreateUser(phone, name, address);

    const cookieStore = await cookies();
    cookieStore.set("user_phone", phone, {
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
    const { getUserByPhone } = await import("@/lib/mock-db");
    const user = getUserByPhone(phone);
    return { success: true, registered: !!user, user };
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
    const { getUserByPhone } = await import("@/lib/mock-db");
    const user = getUserByPhone(phone);
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
