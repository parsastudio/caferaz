import crypto from "crypto";

const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  "razcoffee_secure_fallback_secret_32_chars_long";

/**
 * ایجاد توکن نشست به همراه مهر زمانی انقضای رمزنگاری‌شده در سمت سرور
 * زمان انقضای پیش‌فرض: ۳۰ روز
 */
export function createSignedToken(
  payload: string,
  maxAgeMs: number = 30 * 24 * 60 * 60 * 1000,
): string {
  const expiresAt = Date.now() + maxAgeMs;
  const rawPayload = `${payload}|${expiresAt}`;
  const hmac = crypto.createHmac("sha256", SESSION_SECRET);
  hmac.update(rawPayload);
  const signature = hmac.digest("hex");
  return `${rawPayload}.${signature}`;
}

/**
 * اعتبارسنجی همزمان امضای دیجیتال و منقضی نشدن برچسب زمانی توکن
 */
export function verifySignedToken(token: string): string | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [rawPayload, signature] = parts;
  const hmac = crypto.createHmac("sha256", SESSION_SECRET);
  hmac.update(rawPayload);
  const expectedSignature = hmac.digest("hex");

  try {
    const signatureBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expectedSignature, "hex");

    if (signatureBuffer.length !== expectedBuffer.length) {
      return null;
    }

    const isMatched = crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
    if (!isMatched) return null;

    const pipeIndex = rawPayload.lastIndexOf("|");
    if (pipeIndex === -1) return null;

    const payload = rawPayload.substring(0, pipeIndex);
    const expiresAtStr = rawPayload.substring(pipeIndex + 1);
    const expiresAt = parseInt(expiresAtStr, 10);

    if (isNaN(expiresAt) || Date.now() > expiresAt) {
      return null; // توکن منقضی شده یا دستکاری شده است
    }

    return payload;
  } catch {
    return null;
  }
}
