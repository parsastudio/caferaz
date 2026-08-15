import {
  toJalaali,
  toGregorian,
  jalaaliMonthLength,
} from "@/lib/date/jalali-math";

export function isValidJalaaliDate(
  jy: number,
  jm: number,
  jd: number,
): boolean {
  return (
    jy >= -61 &&
    jy <= 3177 &&
    jm >= 1 &&
    jm <= 12 &&
    jd >= 1 &&
    jd <= jalaaliMonthLength(jy, jm)
  );
}

export function parseJalaliString(
  str: string,
): { gy: number; gm: number; gd: number } | null {
  const match = str.trim().match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (!match) return null;
  const jy = parseInt(match[1], 10);
  const jm = parseInt(match[2], 10);
  const jd = parseInt(match[3], 10);
  if (!isValidJalaaliDate(jy, jm, jd)) return null;
  return toGregorian(jy, jm, jd);
}

function formatJalaliString(jy: number, jm: number, jd: number): string {
  const mm = String(jm).padStart(2, "0");
  const dd = String(jd).padStart(2, "0");
  return `${jy}/${mm}/${dd}`;
}

export function formatGregorianToJalaliString(gregorianStr: string): string {
  const d = new Date(gregorianStr);
  if (isNaN(d.getTime())) return gregorianStr;
  const res = toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate());
  return formatJalaliString(res.jy, res.jm, res.jd);
}

export function getTehranTodayString(): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tehran",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(new Date());
}
