export function toJalaali(
  gy: number,
  gm: number,
  gd: number,
): { jy: number; jm: number; jd: number } {
  return d2j(g2d(gy, gm, gd));
}

export function toGregorian(
  jy: number,
  jm: number,
  jd: number,
): { gy: number; gm: number; gd: number } {
  return d2g(j2d(jy, jm, jd));
}

function isLeapJalaaliYear(jy: number): boolean {
  return jalCalLeap(jy) === 0;
}

export function jalaaliMonthLength(jy: number, jm: number): number {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  if (isLeapJalaaliYear(jy)) return 30;
  return 29;
}

function jalCalLeap(jy: number): number {
  return jalCal(jy).leap;
}

function jalCal(jy: number): { leap: number; gy: number; march: number } {
  const breaks = [
    -61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097,
    2192, 2262, 2324, 2394, 2456, 3178,
  ];
  const bl = breaks.length;
  const gy = jy + 621;
  let leapJ = -14;
  let jp = breaks[0];
  let jump = 0;

  if (jy < jp || jy >= breaks[bl - 1]) {
    throw new Error("Invalid Jalaali year " + jy);
  }

  for (let i = 1; i < bl; i += 1) {
    const jb = breaks[i];
    const n = jb - jp;
    if (jy < jb) {
      jump = Math.floor(n / 33) * 4 + Math.floor((n % 33) / 4);
      break;
    }
    leapJ += Math.floor(n / 33) * 8 + Math.floor(((n % 33) + 3) / 4);
    jp = jb;
  }

  const n = jy - jp;
  leapJ += Math.floor(n / 33) * 4 + Math.floor(((n % 33) + 3) / 4);
  if (jump > 0 && (jump - n) % 33 === 0) {
    leapJ += Math.floor((jump - n) / 33) - 1;
  }

  const leapG =
    Math.floor(gy / 4) - Math.floor(((Math.floor(gy / 100) + 1) * 3) / 4) - 150;
  const march = 20 + leapJ - leapG;

  if ((jump - n) % 33 === 0) {
    return { leap: 0, gy, march };
  }
  const nextLeap = (jump - n) % 33;
  if (nextLeap < 0) {
    return { leap: ((n - jump) % 33) % 4 === 0 ? 0 : 1, gy, march };
  }
  return { leap: nextLeap % 4 === 0 ? 0 : 1, gy, march };
}

function j2d(jy: number, jm: number, jd: number): number {
  const r = jalCal(jy);
  return (
    g2d(r.gy, 3, r.march) +
    (jm - 1) * 31 -
    Math.floor(jm / 7) * (jm - 7) +
    jd -
    1
  );
}

function d2j(jdn: number): { jy: number; jm: number; jd: number } {
  const gy = d2g(jdn).gy;
  let jy = gy - 621;
  const r = jalCal(jy);
  const jdn1f = g2d(gy, 3, r.march);
  let k = jdn - jdn1f;
  if (k >= 0) {
    if (k <= 185) {
      const jm = 1 + Math.floor(k / 31);
      const jd = (k % 31) + 1;
      return { jy, jm, jd };
    }
    k -= 186;
  } else {
    jy -= 1;
    k += 179;
    if (r.leap === 1) k += 1;
  }
  const jm = 7 + Math.floor(k / 30);
  const jd = (k % 30) + 1;
  return { jy, jm, jd };
}

function g2d(gy: number, gm: number, gd: number): number {
  const d =
    Math.floor(((gy + Math.floor((gm - 8) / 6) + 100100) * 1461) / 4) +
    Math.floor((153 * ((gm + 9) % 12) + 2) / 5) +
    gd -
    34840408;
  return (
    d -
    (Math.floor((gy + Math.floor((gm - 8) / 6) + 100100) / 100) * 3) / 4 +
    38
  );
}

function d2g(d: number): { gy: number; gm: number; gd: number } {
  let j = 4 * d + 139361631;
  j +=
    Math.floor((Math.floor((4 * d + 183187720) / 146097) * 3) / 4) * 4 - 3908;
  const i = Math.floor((j % 1461) / 4) * 5 + 308;
  const gd = Math.floor((i % 153) / 5) + 1;
  const gm = ((Math.floor(i / 153) + 2) % 12) + 1;
  const gy = Math.floor(j / 1461) - 100100 + Math.floor((7 - gm) / 6);
  return { gy, gm, gd };
}
