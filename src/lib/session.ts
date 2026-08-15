import "server-only";
import crypto from "crypto";

const rawSecret = process.env.SESSION_SECRET;

if (!rawSecret && process.env.NODE_ENV === "production") {
  throw new Error(
    "متغیر محیطی SESSION_SECRET در محیط پروداکشن تنظیم نشده است!",
  );
}

const SESSION_SECRET =
  rawSecret || "razcoffee_default_dev_fallback_secret_key_32_chars";

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
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
