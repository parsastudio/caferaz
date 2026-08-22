"use client";

import React, { useState, useTransition } from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateSiteContentSectionAction } from "@/actions/content";
import { SiteContent } from "@/domain/validations/content.schema";

interface HeroContentSettingsProps {
  initialHero: SiteContent["hero"];
  initialWhyUs: SiteContent["whyUs"];
}

export default function HeroContentSettings({
  initialHero,
  initialWhyUs,
}: HeroContentSettingsProps) {
  const [isPending, startTransition] = useTransition();
  const [hero, setHero] = useState(initialHero);
  const [whyUs, setWhyUs] = useState(initialWhyUs);

  const handleSave = () => {
    startTransition(async () => {
      const heroRes = await updateSiteContentSectionAction("hero", hero);
      const whyUsRes = await updateSiteContentSectionAction("whyUs", whyUs);

      if (heroRes.success && whyUsRes.success) {
        toast.success("متون بخش هیرو و مزایای رقابتی ذخیره شدند.");
      } else {
        toast.error(
          heroRes.error || whyUsRes.error || "خطا در ذخیره‌سازی متون.",
        );
      }
    });
  };

  return (
    <div className="bg-stone-900/30 border border-stone-800 p-6 rounded-2xl space-y-6">
      <h3 className="text-sm font-black text-stone-200 border-b border-stone-800/50 pb-2">
        متون هیرو و بج‌های تضمین کیفیت
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-stone-300 block">
            متن امتیاز و نظرات روی عکس:
          </label>
          <input
            type="text"
            value={hero.ratingText}
            onChange={(e) => setHero({ ...hero, ratingText: e.target.value })}
            className="w-full bg-stone-950 border border-stone-800 focus:border-gold-500 focus:ring-1 rounded-xl px-4 py-3 text-sm text-stone-100 outline-none transition-all text-right font-medium"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-stone-300 block">
            باکس ۱: ارسال سریع:
          </label>
          <input
            type="text"
            value={hero.fastShippingText}
            onChange={(e) =>
              setHero({ ...hero, fastShippingText: e.target.value })
            }
            className="w-full bg-stone-950 border border-stone-800 focus:border-gold-500 focus:ring-1 rounded-xl px-4 py-3 text-sm text-stone-100 outline-none transition-all text-right font-medium"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-stone-300 block">
            باکس ۲: تضمین کیفیت:
          </label>
          <input
            type="text"
            value={hero.qualityGuaranteeText}
            onChange={(e) =>
              setHero({ ...hero, qualityGuaranteeText: e.target.value })
            }
            className="w-full bg-stone-950 border border-stone-800 focus:border-gold-500 focus:ring-1 rounded-xl px-4 py-3 text-sm text-stone-100 outline-none transition-all text-right font-medium"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-stone-300 block">
            باکس ۳: پلمپ بسته‌بندی:
          </label>
          <input
            type="text"
            value={hero.sealedPackageText}
            onChange={(e) =>
              setHero({ ...hero, sealedPackageText: e.target.value })
            }
            className="w-full bg-stone-950 border border-stone-800 focus:border-gold-500 focus:ring-1 rounded-xl px-4 py-3 text-sm text-stone-100 outline-none transition-all text-right font-medium"
          />
        </div>
      </div>

      <h3 className="text-sm font-black text-stone-200 border-b border-stone-800/50 pb-2 pt-4">
        بخش «چرا خرید از کافه راز» (مزایای رقابتی)
      </h3>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-300 block">
              برچسب کوچک بالای عنوان:
            </label>
            <input
              type="text"
              value={whyUs.badge}
              onChange={(e) => setWhyUs({ ...whyUs, badge: e.target.value })}
              className="w-full bg-stone-950 border border-stone-800 focus:border-gold-500 focus:ring-1 rounded-xl px-4 py-3 text-sm text-stone-100 outline-none transition-all text-right font-medium"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-300 block">
              عنوان اصلی سکشن:
            </label>
            <input
              type="text"
              value={whyUs.title}
              onChange={(e) => setWhyUs({ ...whyUs, title: e.target.value })}
              className="w-full bg-stone-950 border border-stone-800 focus:border-gold-500 focus:ring-1 rounded-xl px-4 py-3 text-sm text-stone-100 outline-none transition-all text-right font-medium"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-stone-300 block">
            توضیحات معرفی مزایا:
          </label>
          <textarea
            rows={2}
            value={whyUs.description}
            onChange={(e) =>
              setWhyUs({ ...whyUs, description: e.target.value })
            }
            className="w-full bg-stone-950 border border-stone-800 focus:border-gold-500 focus:ring-1 rounded-xl px-4 py-3 text-sm text-stone-100 outline-none transition-all resize-none leading-relaxed text-right font-medium"
          />
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isPending}
          className="bg-gold-500 hover:bg-gold-600 text-stone-950 font-black px-6 py-2.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Check className="w-4 h-4 ml-1" />
          )}
          ذخیره تغییرات هیرو و مزایا
        </Button>
      </div>
    </div>
  );
}
