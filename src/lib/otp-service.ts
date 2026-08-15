import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function sendOtpCode(
  phone: string,
  ip: string,
): Promise<{ success: boolean; error?: string; message?: string }> {
  const cleanPhone = phone.trim();
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
      phone: cleanPhone,
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
      phone: cleanPhone,
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
      phone: cleanPhone,
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
