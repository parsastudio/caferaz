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
    <div className="space-y-4">
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-stone-900/90 border border-stone-800/90 shadow-2xl shadow-black/80 ring-1 ring-white/5">
        <div className="absolute top-4 right-4 z-10 bg-stone-950/80 border border-stone-800/80 text-gold-400 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 backdrop-blur-md shadow-sm">
          <Star className="w-3.5 h-3.5 fill-gold-500 text-gold-500" />
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
            unoptimized
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

      <div className="grid grid-cols-3 gap-2 text-center bg-stone-900/30 p-3 rounded-xl border border-stone-850/80">
        <div className="flex flex-col items-center justify-center p-1">
          <Truck className="w-4 h-4 text-gold-500 mb-1" strokeWidth={1.5} />
          <span className="text-[11px] font-bold text-stone-300">
            {hero.fastShippingText}
          </span>
        </div>
        <div className="flex flex-col items-center justify-center p-1 border-x border-stone-800/80">
          <ShieldCheck className="w-4 h-4 text-emerald-400 mb-1" strokeWidth={1.5} />
          <span className="text-[11px] font-bold text-stone-300">
            {hero.qualityGuaranteeText}
          </span>
        </div>
        <div className="flex flex-col items-center justify-center p-1">
          <ShieldCheck className="w-4 h-4 text-amber-500 mb-1" strokeWidth={1.5} />
          <span className="text-[11px] font-bold text-stone-300">
            {hero.sealedPackageText}
          </span>
        </div>
      </div>
    </div>
  );
}
