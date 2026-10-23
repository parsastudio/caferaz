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

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tehran",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });

  const parts = formatter.formatToParts(d);
  const gy = parseInt(
    parts.find((p) => p.type === "year")?.value || "1970",
    10,
  );
  const gm = parseInt(parts.find((p) => p.type === "month")?.value || "1", 10);
  const gd = parseInt(parts.find((p) => p.type === "day")?.value || "1", 10);

  const res = toJalaali(gy, gm, gd);
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

export function getTodayJalaliString(): string {
  const tehranToday = getTehranTodayString();
  return formatGregorianToJalaliString(tehranToday);
}

export interface RoastDateDisplayInfo {
  isFresh: boolean;
  formattedDate: string;
  daysAgo: number;
}

export function getRoastDateDisplayInfo(
  roastDateJalaliStr?: string | null,
  todayGregorianStr?: string,
): RoastDateDisplayInfo | null {
  if (!roastDateJalaliStr || !roastDateJalaliStr.trim()) return null;

  const parsed = parseJalaliString(roastDateJalaliStr.trim());
  if (!parsed) return null;

  const roastDate = new Date(
    Date.UTC(parsed.gy, parsed.gm - 1, parsed.gd, 12, 0, 0),
  );

  const todayStr = todayGregorianStr || getTehranTodayString();
  const todayParts = todayStr.split("-").map((p) => parseInt(p, 10));
  const todayDate = new Date(
    Date.UTC(todayParts[0], todayParts[1] - 1, todayParts[2], 12, 0, 0),
  );

  const diffMs = todayDate.getTime() - roastDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0 || diffDays > 21) {
    return null;
  }

  return {
    isFresh: true,
    formattedDate: roastDateJalaliStr.trim(),
    daysAgo: diffDays,
  };
}
