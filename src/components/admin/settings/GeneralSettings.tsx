"use client";

import React, { useState, useTransition } from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateSettingsAction } from "@/app/actions/settings";
import { updateProductBasicInfoAction } from "@/app/actions/product";

interface GeneralSettingsProps {
  initialSettings: {
    siteSubtitle: string;
    siteFooter: {
      phones: string[];
      address: string;
      eitaa: string;
      website: string;
    };
    productName: string;
    productDescription: string;
  };
}

export default function GeneralSettings({
  initialSettings,
}: GeneralSettingsProps) {
  const [isPendingProduct, startProductTransition] = useTransition();
  const [isPendingFooter, startFooterTransition] = useTransition();

  const [subtitle, setSubtitle] = useState(initialSettings.siteSubtitle);
  const [productName, setProductName] = useState(initialSettings.productName);
  const [productDescription, setProductDescription] = useState(
    initialSettings.productDescription,
  );

  const [footer, setFooter] = useState({
    phones: initialSettings.siteFooter?.phones?.join(", ") || "",
    address: initialSettings.siteFooter?.address || "",
    eitaa: initialSettings.siteFooter?.eitaa || "",
    website: initialSettings.siteFooter?.website || "",
  });

  const handleSaveProductAndSubtitle = () => {
    startProductTransition(async () => {
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

  const handleSaveFooter = () => {
    const cleanedFooter = {
      phones: footer.phones
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean),
      address: footer.address,
      eitaa: footer.eitaa,
      website: footer.website,
    };

    startFooterTransition(async () => {
      const res = await updateSettingsAction({
        key: "site_footer",
        value: cleanedFooter,
      });
      if (res.success) {
        toast.success("اطلاعات ارتباطی فوتر با موفقیت ذخیره شد.");
      } else {
        toast.error(res.error || "خطا در ثبت اطلاعات.");
      }
    });
  };

  return (
    <div
      className="space-y-6 max-w-3xl text-right animate-in fade-in duration-200"
      dir="rtl"
    >
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
            onClick={handleSaveProductAndSubtitle}
            disabled={isPendingProduct}
            className="bg-gold-500 hover:bg-gold-600 text-stone-950 font-black px-6 py-2.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
          >
            {isPendingProduct ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4 ml-1" />
            )}
            ذخیره مشخصات و متون محصول
          </Button>
        </div>
      </div>

      <div className="bg-stone-900/30 border border-stone-800 p-6 rounded-2xl space-y-5">
        <h3 className="text-sm font-black text-stone-200 border-b border-stone-800/50 pb-2">
          اطلاعات ارتباطی فوتر
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-300 block">
              شماره‌های پشتیبانی (با کاما جدا کنید):
            </label>
            <input
              type="text"
              value={footer.phones}
              onChange={(e) => setFooter({ ...footer, phones: e.target.value })}
              className="w-full bg-stone-950 border border-stone-800 focus:border-gold-500 focus:ring-1 rounded-xl px-4 py-3 text-sm text-stone-100 outline-none transition-all font-sans text-right font-bold"
              dir="ltr"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-300 block">
              آدرس وب‌سایت اصلی:
            </label>
            <input
              type="text"
              value={footer.website}
              onChange={(e) =>
                setFooter({ ...footer, website: e.target.value })
              }
              className="w-full bg-stone-950 border border-stone-800 focus:border-gold-500 focus:ring-1 rounded-xl px-4 py-3 text-sm text-stone-100 outline-none transition-all font-sans text-right font-bold"
              dir="ltr"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-stone-300 block">
            آدرس پستی کارگاه:
          </label>
          <textarea
            rows={2}
            value={footer.address}
            onChange={(e) => setFooter({ ...footer, address: e.target.value })}
            className="w-full bg-stone-950 border border-stone-800 focus:border-gold-500 focus:ring-1 rounded-xl px-4 py-3 text-sm text-stone-100 outline-none transition-all resize-none leading-relaxed text-right font-medium"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-stone-300 block">
            لینک رسمی کانال ایتا:
          </label>
          <input
            type="text"
            value={footer.eitaa}
            onChange={(e) => setFooter({ ...footer, eitaa: e.target.value })}
            className="w-full bg-stone-950 border border-stone-800 focus:border-gold-500 focus:ring-1 rounded-xl px-4 py-3 text-sm text-stone-100 outline-none transition-all font-sans text-right font-bold"
            dir="ltr"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <Button
            onClick={handleSaveFooter}
            disabled={isPendingFooter}
            className="bg-gold-500 hover:bg-gold-600 text-stone-950 font-black px-6 py-2.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
          >
            {isPendingFooter ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4 ml-1" />
            )}
            ذخیره اطلاعات تماس فوتر
          </Button>
        </div>
      </div>
    </div>
  );
}
