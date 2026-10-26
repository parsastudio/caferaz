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
  if (!gregorianStr || !gregorianStr.trim()) return "";
  const clean = gregorianStr.trim();

  const matchYmd = clean.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (matchYmd) {
    const y = parseInt(matchYmd[1], 10);
    const m = parseInt(matchYmd[2], 10);
    const d = parseInt(matchYmd[3], 10);
    if (y < 1700) {
      return formatJalaliString(y, m, d);
    }
    const res = toJalaali(y, m, d);
    return formatJalaliString(res.jy, res.jm, res.jd);
  }

  const d = new Date(clean);
  if (isNaN(d.getTime())) return clean;

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

export function calculateGregorianDateFromDaysAgo(daysAgo: number): string {
  const safeDaysAgo = Math.max(0, Math.floor(daysAgo));
  const tehranToday = getTehranTodayString();
  const [gy, gm, gd] = tehranToday.split("-").map((p) => parseInt(p, 10));
  const d = new Date(Date.UTC(gy, gm - 1, gd, 12, 0, 0));
  d.setUTCDate(d.getUTCDate() - safeDaysAgo);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function calculateDaysAgoFromGregorian(
  dateStr?: string | null,
  todayGregorianStr?: string,
): number | null {
  if (!dateStr || !dateStr.trim()) return null;
  const clean = dateStr.trim();

  let targetDate: Date | null = null;
  const matchIso = clean.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (matchIso) {
    const y = parseInt(matchIso[1], 10);
    const m = parseInt(matchIso[2], 10);
    const d = parseInt(matchIso[3], 10);
    if (y > 1700) {
      targetDate = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
    } else {
      const parsedJalali = parseJalaliString(clean);
      if (parsedJalali) {
        targetDate = new Date(
          Date.UTC(parsedJalali.gy, parsedJalali.gm - 1, parsedJalali.gd, 12, 0, 0),
        );
      }
    }
  } else {
    const parsed = new Date(clean);
    if (!isNaN(parsed.getTime())) {
      targetDate = new Date(
        Date.UTC(
          parsed.getUTCFullYear(),
          parsed.getUTCMonth(),
          parsed.getUTCDate(),
          12,
          0,
          0,
        ),
      );
    }
  }

  if (!targetDate) return null;

  const todayStr = todayGregorianStr || getTehranTodayString();
  const [ty, tm, td] = todayStr.split("-").map((p) => parseInt(p, 10));
  const todayDate = new Date(Date.UTC(ty, tm - 1, td, 12, 0, 0));

  const diffMs = todayDate.getTime() - targetDate.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export interface RoastDateDisplayInfo {
  isFresh: boolean;
  formattedDate: string;
  daysAgo: number;
  freshnessLabel: string;
}

export function getRoastDateDisplayInfo(
  roastDateStr?: string | null,
  todayGregorianStr?: string,
): RoastDateDisplayInfo | null {
  if (!roastDateStr || !roastDateStr.trim()) return null;

  const daysAgo = calculateDaysAgoFromGregorian(
    roastDateStr,
    todayGregorianStr,
  );
  if (daysAgo === null || daysAgo < 0 || daysAgo > 21) {
    return null;
  }

  const clean = roastDateStr.trim();
  const formattedDate =
    clean.startsWith("14") || clean.startsWith("13")
      ? clean
      : formatGregorianToJalaliString(clean);

  let freshnessLabel = "رست تازه کارگاه";
  if (daysAgo === 0) {
    freshnessLabel = "رست داغ امروز";
  } else if (daysAgo <= 3) {
    freshnessLabel = "فوق‌العاده تازه (کمتر از ۳ روز)";
  } else if (daysAgo <= 7) {
    freshnessLabel = "رست تازه هفته جاری";
  }

  return {
    isFresh: true,
    formattedDate,
    daysAgo,
    freshnessLabel,
  };
}
