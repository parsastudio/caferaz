"use client";

import React, { useState, useTransition } from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateSettingsAction } from "@/actions/settings";
import { updateProductBasicInfoAction } from "@/actions/product";

interface ProductContentSettingsProps {
  initialProductName: string;
  initialProductDescription: string;
  initialSiteSubtitle: string;
}

export default function ProductContentSettings({
  initialProductName,
  initialProductDescription,
  initialSiteSubtitle,
}: ProductContentSettingsProps) {
  const [isPending, startTransition] = useTransition();
  const [productName, setProductName] = useState(initialProductName);
  const [productDescription, setProductDescription] = useState(
    initialProductDescription,
  );
  const [subtitle, setSubtitle] = useState(initialSiteSubtitle);

  const handleSave = () => {
    startTransition(async () => {
      const resProd = await updateProductBasicInfoAction({
        productId: "prod_coffee_bulk_01",
        name: productName,
        description: productDescription,
      });

      if (!resProd.success) {
        toast.error(resProd.error || "خطا در ثبت مشخصات کالا.");
        return;
      }

      const resSub = await updateSettingsAction({
        key: "site_subtitle",
        value: subtitle,
      });

      if (resSub.success) {
        toast.success("مشخصات، زیرتیتر و توضیحات محصول با موفقیت ذخیره شدند.");
      } else {
        toast.error(resSub.error || "خطا در ثبت زیرتیتر لندینگ.");
      }
    });
  };

  return (
    <div className="bg-stone-900/30 border border-stone-800 p-6 rounded-2xl space-y-5">
      <h3 className="text-sm font-black text-stone-200 border-b border-stone-800/50 pb-2">
        مشخصات، متون و معرفی محصول
      </h3>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-stone-300 block">
            نام کامل محصول (نام تجاری):
          </label>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="w-full bg-stone-950 border border-stone-800 focus:border-gold-500 focus:ring-1 rounded-xl px-4 py-3 text-sm text-stone-100 outline-none transition-all text-right font-bold"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-stone-300 block">
            زیر تیتر بخش هیرو سایت (Subtitle):
          </label>
          <textarea
            rows={2}
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className="w-full bg-stone-950 border border-stone-800 focus:border-gold-500 focus:ring-1 rounded-xl px-4 py-3 text-sm text-stone-100 outline-none transition-all resize-none leading-relaxed text-right font-medium"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-stone-300 block">
            معرفی و توضیحات تخصصی کالا:
          </label>
          <textarea
            rows={4}
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
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
          ذخیره مشخصات و متون محصول
        </Button>
      </div>
    </div>
  );
}
