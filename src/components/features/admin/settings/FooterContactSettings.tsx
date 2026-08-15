"use client";

import React, { useState, useTransition } from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateSettingsAction } from "@/actions/settings";
import { FooterConfig } from "@/types";

interface FooterContactSettingsProps {
  initialFooter: FooterConfig;
}

export default function FooterContactSettings({
  initialFooter,
}: FooterContactSettingsProps) {
  const [isPending, startTransition] = useTransition();

  const [footer, setFooter] = useState({
    phones: initialFooter?.phones?.join(", ") || "",
    address: initialFooter?.address || "",
    eitaa: initialFooter?.eitaa || "",
    website: initialFooter?.website || "",
  });

  const handleSave = () => {
    const cleanedFooter = {
      phones: footer.phones
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean),
      address: footer.address,
      eitaa: footer.eitaa,
      website: footer.website,
    };

    startTransition(async () => {
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
            onChange={(e) => setFooter({ ...footer, website: e.target.value })}
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
          onClick={handleSave}
          disabled={isPending}
          className="bg-gold-500 hover:bg-gold-600 text-stone-950 font-black px-6 py-2.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Check className="w-4 h-4 ml-1" />
          )}
          ذخیره اطلاعات تماس فوتر
        </Button>
      </div>
    </div>
  );
}
