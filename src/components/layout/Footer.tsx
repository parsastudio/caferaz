"use client";

import React from "react";
import { Phone, MapPin, Send, ShieldCheck, Award } from "lucide-react";

export interface FooterConfig {
  phones: string[];
  address: string;
  instagram: string;
  telegram: string;
  eitaa: string;
  website: string;
}

interface FooterProps {
  config?: FooterConfig | null;
}

function toPersianDigits(str: string): string {
  return str
    .replace(/0/g, "۰")
    .replace(/1/g, "۱")
    .replace(/2/g, "۲")
    .replace(/3/g, "۳")
    .replace(/4/g, "۴")
    .replace(/5/g, "۵")
    .replace(/6/g, "۶")
    .replace(/7/g, "۷")
    .replace(/8/g, "۸")
    .replace(/9/g, "۹");
}

export default function Footer({ config }: FooterProps) {
  const phones = config?.phones || [
    "09002570060",
    "09002570040",
    "021-77311806",
  ];
  const address = config?.address || "تهران، کافه راز";
  const eitaa = config?.eitaa || "https://eitaa.com/razcoffee";

  return (
    <footer
      className="w-full bg-stone-950 border-t border-stone-900 text-stone-300 py-12 px-6"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        <div className="md:col-span-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/20 text-gold-500 flex items-center justify-center text-xl font-black">
              ☕
            </div>
            <div>
              <span className="text-md font-black text-stone-100 tracking-tight block">
                کافه راز
              </span>
              <span className="text-[10px] text-gold-500 font-bold block mt-0.5">
                عرضه مستقیم و پخش عمده قهوه فله باکیفیت
              </span>
            </div>
          </div>
          <p className="text-xs text-stone-400 leading-relaxed max-w-sm">
            کافه راز یک فروشگاه مستقیم برای خرید قهوه فله باکیفیت و
            مقرون‌به‌صرفه است. ما با حذف واسطه‌ها، انواع میکس‌های قهوه را با
            قیمت بسیار منصفانه، کیفیت مناسب و ارسال سریع به دست شما می‌رسانیم.
          </p>
          <div className="flex items-center gap-3">
            <a
              href={eitaa}
              target="_blank"
              rel="nofollow"
              className="px-4 py-2 rounded-xl bg-stone-900 border border-stone-850 hover:border-gold-500/40 hover:text-gold-500 flex items-center gap-2 transition-all cursor-pointer text-xs font-bold"
              title="کانال رسمی ایتا کافه راز"
            >
              <Send className="w-4 h-4 text-gold-500" />
              <span>کانال رسمی ایتا</span>
            </a>
          </div>
        </div>

        <div className="md:col-span-6 space-y-4">
          <h4 className="text-xs font-black text-stone-200 tracking-wider">
            تماس و اطلاعات ارتباطی
          </h4>
          <ul className="space-y-3.5 text-xs text-stone-400">
            <li className="flex items-start gap-2.5">
              <Phone className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1.5 font-sans">
                <span className="font-sans">
                  پشتیبانی همراه:{" "}
                  <span dir="ltr" className="inline-block">
                    {toPersianDigits(phones[0])}
                  </span>{" "}
                  |{" "}
                  <span dir="ltr" className="inline-block">
                    {toPersianDigits(phones[1])}
                  </span>
                </span>
                <span className="font-sans">
                  شماره ثابت:{" "}
                  <span dir="ltr" className="inline-block">
                    {toPersianDigits(phones[2])}
                  </span>
                </span>
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{address}</span>
            </li>
          </ul>

          <div className="pt-4 flex items-center gap-3">
            <div className="w-24 h-24 rounded-2xl bg-stone-900/40 border border-stone-850/80 flex flex-col items-center justify-center text-center p-2 hover:border-gold-500/20 transition-all select-none">
              <ShieldCheck className="w-7 h-7 text-gold-500 mb-1" />
              <span className="text-[9px] text-stone-200 font-black">
                پرداخت امن
              </span>
              <span className="text-[8px] text-stone-500 mt-0.5">
                در محل خریدار
              </span>
            </div>
            <div className="w-24 h-24 rounded-2xl bg-stone-900/40 border border-stone-850/80 flex flex-col items-center justify-center text-center p-2 hover:border-gold-500/20 transition-all select-none">
              <Award className="w-7 h-7 text-gold-500 mb-1" />
              <span className="text-[9px] text-stone-200 font-black">
                ضمانت اصالت
              </span>
              <span className="text-[8px] text-stone-500 mt-0.5">
                ۱۰۰٪ دانه باکیفیت
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-stone-900/80 mt-10 pt-6 text-center">
        <p className="text-[10px] text-stone-600 leading-normal font-sans">
          کلیه حقوق این وب‌سایت متعلق به مجموعه کافه راز می‌باشد. ©{" "}
          {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
