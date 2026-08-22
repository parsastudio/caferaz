"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Star, Flame, Truck, ShieldCheck } from "lucide-react";
import { useSiteContent } from "@/context/ContentContext";

interface ProductVisualsProps {
  productName: string;
}

export default function ProductVisuals({ productName }: ProductVisualsProps) {
  const { hero } = useSiteContent();
  const [imgError, setImgError] = useState(false);

  return (
    <div className="space-y-6">
      <div className="relative aspect-square rounded-3xl overflow-hidden bg-stone-900 border border-stone-800 shadow-2xl">
        <div className="absolute top-4 right-4 z-10 bg-stone-950/85 border border-stone-800 text-gold-500 px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 backdrop-blur-md">
          <Star className="w-4 h-4 fill-gold-500 text-gold-500" />
          <span>{hero.ratingText}</span>
        </div>

        {!imgError ? (
          <Image
            src="/landing-page-main-pic.webp"
            alt={productName}
            fill
            sizes="(max-width: 768px) 100vw, 500px"
            className="object-cover"
            onError={() => setImgError(true)}
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-stone-900 to-stone-950 flex flex-col items-center justify-center text-stone-600 gap-2 p-6 text-center">
            <Flame className="w-16 h-16 text-gold-600 animate-pulse" />
            <span className="text-stone-400 font-black text-lg mt-2">
              {productName}
            </span>
            <span className="text-xs text-stone-500">
              {hero.fallbackVisualText}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 text-center bg-stone-900/40 p-4 rounded-2xl border border-stone-800/60">
        <div className="flex flex-col items-center justify-center p-1.5">
          <Truck className="w-5 h-5 text-gold-500 mb-1.5" />
          <span className="text-[11px] font-bold text-stone-300">
            {hero.fastShippingText}
          </span>
        </div>
        <div className="flex flex-col items-center justify-center p-1.5 border-x border-stone-800">
          <ShieldCheck className="w-5 h-5 text-emerald-500 mb-1.5" />
          <span className="text-[11px] font-bold text-stone-300">
            {hero.qualityGuaranteeText}
          </span>
        </div>
        <div className="flex flex-col items-center justify-center p-1.5">
          <ShieldCheck className="w-5 h-5 text-orange-500 mb-1.5" />
          <span className="text-[11px] font-bold text-stone-300">
            {hero.sealedPackageText}
          </span>
        </div>
      </div>
    </div>
  );
}
