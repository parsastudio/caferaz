import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// تابع استاندارد ترکیب کلاس‌های Tailwind برای کامپوننت‌های شادسی‌ان
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
