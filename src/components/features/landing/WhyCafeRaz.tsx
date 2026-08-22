"use client";

import React from "react";
import {
  Coins,
  MapPin,
  Sliders,
  Coffee,
  HelpCircle,
  LucideIcon,
} from "lucide-react";
import { useSiteContent } from "@/context/ContentContext";

const iconRegistry: Record<string, LucideIcon> = {
  Coins,
  MapPin,
  Sliders,
  Coffee,
};

export default function WhyCafeRaz() {
  const { whyUs } = useSiteContent();

  return (
    <section
      className="w-full max-w-7xl mx-auto px-4 py-16 text-right"
      dir="rtl"
    >
      <div className="text-center md:text-right max-w-2xl mb-12">
        <span className="text-[10px] bg-gold-500/10 border border-gold-500/20 text-gold-400 px-3 py-1 rounded-full font-black tracking-widest uppercase">
          {whyUs.badge}
        </span>
        <h2 className="text-xl md:text-3xl font-black text-stone-100 mt-3">
          {whyUs.title}
        </h2>
        <p className="text-xs md:text-sm text-stone-400 leading-relaxed mt-2">
          {whyUs.description}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {whyUs.items.map((usp) => {
          const IconComponent = iconRegistry[usp.icon] || HelpCircle;

          return (
            <div
              key={usp.id}
              className="bg-stone-900/20 border border-stone-900 hover:border-gold-500/25 p-6 rounded-3xl transition-all duration-300 group flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-gold-500/5 border border-gold-500/10 text-gold-500 flex items-center justify-center group-hover:bg-gold-500/10 group-hover:border-gold-500/25 transition-all">
                  <IconComponent className="w-5 h-5" />
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
