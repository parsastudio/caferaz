import React from "react";
import {
  Coins,
  MapPin,
  Sliders,
  Coffee,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";
import { SiteWhyUsContent } from "@/domain/types";
import { DEFAULT_SITE_CONTENT } from "@/lib/content/default-content";

const iconRegistry: Record<string, LucideIcon> = {
  Coins,
  MapPin,
  Sliders,
  Coffee,
};

interface WhyCafeRazProps {
  content?: SiteWhyUsContent;
}

export default function WhyCafeRaz({
  content = DEFAULT_SITE_CONTENT.whyUs,
}: WhyCafeRazProps) {
  const whyUs = content;

  return (
    <section
      className="w-full max-w-7xl mx-auto px-4 py-10 sm:py-16 text-right"
      dir="rtl"
    >
      <div className="text-center md:text-right max-w-2xl mb-8 sm:mb-12">
        <span className="text-[10px] bg-gold-500/10 border border-gold-500/20 text-gold-400 px-3 py-1 rounded-full font-black tracking-widest uppercase">
          {whyUs.badge}
        </span>
        <h2 className="text-xl md:text-3xl font-black text-stone-100 mt-2.5 sm:mt-3">
          {whyUs.title}
        </h2>
        <p className="text-xs md:text-sm text-stone-400 leading-relaxed mt-1.5 sm:mt-2">
          {whyUs.description}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
        {whyUs.items.map((usp) => {
          const IconComponent = iconRegistry[usp.icon] || HelpCircle;

          return (
            <div
              key={usp.id}
              className="bg-stone-900/25 border border-stone-850/80 hover:border-stone-700/80 p-5 rounded-2xl transition-all duration-200 group flex flex-col justify-between shadow-sm"
            >
              <div className="space-y-3.5">
                <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/20 text-gold-400 flex items-center justify-center group-hover:border-gold-500/40 transition-all">
                  <IconComponent className="w-4 h-4" strokeWidth={1.75} />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-black text-stone-200 group-hover:text-gold-400 transition-colors">
                    {usp.title}
                  </h3>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    {usp.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
