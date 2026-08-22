import { toEnglishDigits, toPersianDigits } from "@/lib/utils";

export function normalizePhone(phone: string | null | undefined): string {
  if (!phone) return "";
  return toEnglishDigits(phone.trim()).replace(/[^0-9]/g, "");
}

export function isValidIranianPhone(phone: string | null | undefined): boolean {
  if (!phone) return false;
  const normalized = normalizePhone(phone);
  return /^09[0-9]{9}$/.test(normalized);
}

export function formatPersianPhone(phone: string): string {
  return toPersianDigits(normalizePhone(phone));
}
