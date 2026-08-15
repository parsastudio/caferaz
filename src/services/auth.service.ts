import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/crypto";
import { sendOtpCode, verifyOtpInternal } from "@/lib/otp-service";
import { User } from "@/domain/types";
import {
  AdminLoginInput,
  UpdateAdminPasswordInput,
  RegisterUserInput,
  LoginUserWithOtpInput,
  QuickLoginUserInput,
} from "@/domain/validations/auth.schema";

export class AuthService {
  static async verifyAdminCredentials(
    input: AdminLoginInput,
  ): Promise<boolean> {
    const adminCredentialsOpt = await prisma.option.findUnique({
      where: { key: "admin_credentials" },
    });

    const storedCreds = adminCredentialsOpt
      ? (adminCredentialsOpt.value as {
          username: string;
          passwordHash: string;
        })
      : null;

    if (!storedCreds) return false;

    const isUsernameMatch = input.username.trim() === storedCreds.username;
    const isPasswordMatch = verifyPassword(
      input.password,
      storedCreds.passwordHash,
    );

    return isUsernameMatch && isPasswordMatch;
  }

  static async updateAdminPassword(input: UpdateAdminPasswordInput): Promise<{
    success: boolean;
    error?: string;
  }> {
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
      input.oldPass,
      storedCreds.passwordHash,
    );
    if (!isOldPasswordValid) {
      return { success: false, error: "رمز عبور فعلی نادرست است." };
    }

    const updatedCreds = {
      username: storedCreds.username,
      passwordHash: hashPassword(input.newPass),
    };

    await prisma.option.upsert({
      where: { key: "admin_credentials" },
      update: { value: updatedCreds },
      create: { key: "admin_credentials", value: updatedCreds },
    });

    return { success: true };
  }

  static async sendOtp(phone: string, ip: string) {
    return await sendOtpCode(phone, ip);
  }

  static async verifyOtp(phone: string, otp: string) {
    return await verifyOtpInternal(phone, otp);
  }

  static async registerUser(input: RegisterUserInput): Promise<User> {
    const user = await prisma.user.upsert({
      where: { phone: input.phone },
      update: { name: input.name, address: input.address },
      create: { phone: input.phone, name: input.name, address: input.address },
    });

    return {
      id: user.id,
      name: user.name,
      phone: user.phone,
      createdAt: user.createdAt.toISOString(),
      address: user.address ?? undefined,
    };
  }

  static async loginUserWithOtp(input: LoginUserWithOtpInput): Promise<User> {
    const existingUser = await prisma.user.findUnique({
      where: { phone: input.phone },
    });
    const displayName = existingUser ? existingUser.name : "کاربر کافه راز";

    const user = await prisma.user.upsert({
      where: { phone: input.phone },
      update: {},
      create: { phone: input.phone, name: displayName },
    });

    return {
      id: user.id,
      name: user.name,
      phone: user.phone,
      createdAt: user.createdAt.toISOString(),
      address: user.address ?? undefined,
    };
  }

  static async quickLoginUser(input: QuickLoginUserInput): Promise<User> {
    const user = await prisma.user.upsert({
      where: { phone: input.phone },
      update: { name: input.name },
      create: { phone: input.phone, name: input.name },
    });

    return {
      id: user.id,
      name: user.name,
      phone: user.phone,
      createdAt: user.createdAt.toISOString(),
      address: user.address ?? undefined,
    };
  }

  static async getUserByPhone(phone: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { phone: phone.trim() },
    });

    if (!user) return null;

    return {
      id: user.id,
      name: user.name,
      phone: user.phone,
      createdAt: user.createdAt.toISOString(),
      address: user.address ?? undefined,
    };
  }
}
