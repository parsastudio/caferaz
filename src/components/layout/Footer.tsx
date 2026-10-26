import React from "react";
import { Phone, MapPin, ShieldCheck, Award, Coffee } from "lucide-react";
import { toPersianDigits } from "@/lib/utils";
import { SiteLayoutContent } from "@/domain/types";
import { DEFAULT_SITE_CONTENT } from "@/lib/content/default-content";

interface FooterProps {
  content?: SiteLayoutContent;
}

export default function Footer({
  content = DEFAULT_SITE_CONTENT.layout,
}: FooterProps) {
  const layout = content;

  const phones =
    layout.phones && layout.phones.length > 0
      ? layout.phones
      : ["09002570060", "09002570040", "021-77311806"];
  const address = layout.address || "تهران، کافه راز";

  return (
    <footer
      className="w-full bg-stone-950 border-t border-stone-900 text-stone-300 py-10 sm:py-12 px-4 sm:px-6"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start">
        <div className="md:col-span-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/20 text-gold-500 flex items-center justify-center shrink-0">
              <Coffee className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div>
              <span className="text-base font-black text-stone-100 tracking-tight block">
                {layout.brandName}
              </span>
              <span className="text-xs text-gold-400 font-medium block mt-0.5">
                {layout.brandSubtitle}
              </span>
            </div>
          </div>
          <p className="text-xs text-stone-400 leading-relaxed max-w-sm">
            {layout.footerAbout}
          </p>
          <div className="flex items-center gap-2.5 pt-1">
            <a
              href="https://eitaa.com/cafe_raz"
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="w-10 h-10 rounded-xl bg-stone-900 border border-stone-850 hover:border-gold-500/40 hover:text-gold-500 text-stone-400 flex items-center justify-center transition-all cursor-pointer group hover:bg-gold-500/5 active:scale-95 shadow-sm"
              title="کانال ایتا کافه راز"
              aria-label="کانال ایتا کافه راز"
            >
              <svg
                fill="currentColor"
                viewBox="0 0 24 24"
                className="w-5 h-5 transition-transform duration-200 group-hover:scale-110"
                aria-hidden="true"
              >
                <path d="M5.968 23.942a6.624 6.624 0 0 1-2.332-.83c-1.62-.929-2.829-2.593-3.217-4.426-.151-.717-.17-1.623-.15-7.207C.288 5.47.274 5.78.56 4.79c.142-.493.537-1.34.823-1.767C2.438 1.453 3.99.445 5.913.08c.384-.073.94-.08 6.056-.08 6.251 0 6.045-.009 7.066.314a6.807 6.807 0 0 1 4.314 4.184c.33.937.346 1.087.369 3.555l.02 2.23-.391.268c-.558.381-1.29 1.06-2.316 2.15-1.182 1.256-2.376 2.42-2.982 2.907-1.309 1.051-2.508 1.651-3.726 1.864-.634.11-1.682.067-2.302-.095-.553-.144-.517-.168-.726.464a6.355 6.355 0 0 0-.318 1.546l-.031.407-.146-.03c-1.215-.241-2.419-1.285-2.884-2.5a3.583 3.583 0 0 1-.26-1.219l-.016-.34-.309-.284c-.644-.59-1.063-1.312-1.195-2.061-.212-1.193.34-2.542 1.538-3.756 1.264-1.283 3.127-2.29 4.953-2.68.658-.14 1.818-.177 2.403-.075 1.138.198 2.067.773 2.645 1.639.182.271.195.31.177.555a.812.812 0 0 1-.183.493c-.465.651-1.848 1.348-3.336 1.68-2.625.585-4.294-.142-4.033-1.759.026-.163.04-.304.031-.313-.032-.032-.293.104-.575.3-.479.334-.903.984-1.05 1.607-.036.156-.05.406-.034.65.02.331.053.454.192.736.092.186.275.45.408.589l.24.251-.096.122a4.845 4.845 0 0 0-.677 1.217 3.635 3.635 0 0 0-.105 1.815c.103.461.421 1.095.739 1.468.242.285.797.764.886.764.024 0 .044-.048.044-.106.001-.23.184-.973.326-1.327.423-1.058 1.351-1.96 2.82-2.74.245-.13.952-.47 1.572-.757 1.36-.63 2.103-1.015 2.511-1.305 1.176-.833 1.903-2.065 2.14-3.625.086-.57.086-1.634 0-2.207-.368-2.438-2.195-4.096-4.818-4.37-2.925-.307-6.648 1.953-8.942 5.427-1.116 1.69-1.87 3.565-2.187 5.443-.123.728-.169 2.08-.093 2.75.193 1.704.822 3.078 1.903 4.156a6.531 6.531 0 0 0 1.87 1.313c2.368 1.13 4.99 1.155 7.295.071.996-.469 1.974-1.196 3.023-2.25 1.02-1.025 1.71-1.88 3.592-4.458 1.04-1.423 1.864-2.368 2.272-2.605l.15-.086-.019 3.091c-.018 2.993-.022 3.107-.123 3.561-.6 2.678-2.54 4.636-5.195 5.242l-.468.107-5.775.01c-4.734.008-5.85-.002-6.19-.056z" />
              </svg>
            </a>

            <a
              href="https://t.me/cafe_raz"
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="w-10 h-10 rounded-xl bg-stone-900 border border-stone-850 hover:border-gold-500/40 hover:text-gold-500 text-stone-400 flex items-center justify-center transition-all cursor-pointer group hover:bg-gold-500/5 active:scale-95 shadow-sm"
              title="کانال تلگرام کافه راز"
              aria-label="کانال تلگرام کافه راز"
            >
              <svg
                fill="currentColor"
                viewBox="0 0 24 24"
                className="w-5 h-5 transition-transform duration-200 group-hover:scale-110"
                aria-hidden="true"
              >
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.832.946z" />
              </svg>
            </a>

            <a
              href="https://instagram.com/cafe_raz"
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="w-10 h-10 rounded-xl bg-stone-900 border border-stone-850 hover:border-gold-500/40 hover:text-gold-500 text-stone-400 flex items-center justify-center transition-all cursor-pointer group hover:bg-gold-500/5 active:scale-95 shadow-sm"
              title="صفحه اینستاگرام کافه راز"
              aria-label="صفحه اینستاگرام کافه راز"
            >
              <svg
                fill="currentColor"
                viewBox="0 0 24 24"
                className="w-5 h-5 transition-transform duration-200 group-hover:scale-110"
                aria-hidden="true"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
          </div>
        </div>

        <div className="md:col-span-6 space-y-4">
          <h4 className="text-xs font-black text-stone-200 tracking-wider">
            {layout.contactHeading}
          </h4>
          <ul className="space-y-3.5 text-xs text-stone-400">
            {phones.length > 0 && (
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" />
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-sans">
                  <span className="font-bold text-stone-300">
                    {layout.phonesLabel}
                  </span>
                  {phones.map((phoneItem, index) => (
                    <React.Fragment key={index}>
                      <span dir="ltr" className="inline-block font-medium">
                        {toPersianDigits(phoneItem)}
                      </span>
                      {index < phones.length - 1 && (
                        <span className="text-stone-600">|</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </li>
            )}
            <li className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{address}</span>
            </li>
          </ul>

          <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-stone-900/30 border border-stone-800/80 hover:border-stone-700/80 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <div className="text-right space-y-0.5">
                <span className="text-xs font-bold text-stone-100 block">
                  {layout.securePaymentTitle}
                </span>
                <span className="text-[11px] text-stone-400 block leading-snug">
                  {layout.securePaymentSub}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-stone-900/30 border border-stone-800/80 hover:border-stone-700/80 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/20 text-gold-400 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <div className="text-right space-y-0.5">
                <span className="text-xs font-bold text-stone-100 block">
                  {layout.originalQualityTitle}
                </span>
                <span className="text-[11px] text-stone-400 block leading-snug">
                  {layout.originalQualitySub}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-stone-900/80 mt-10 pt-6 text-center">
        <p className="text-[10px] text-stone-600 leading-normal font-sans">
          {layout.copyrightText} {toPersianDigits(new Date().getFullYear())}
        </p>
      </div>
    </footer>
  );
}
