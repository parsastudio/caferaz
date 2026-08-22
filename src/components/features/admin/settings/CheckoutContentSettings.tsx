"use client";

import React, { useState, useTransition } from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateSiteContentSectionAction } from "@/actions/content";
import { SiteContent } from "@/domain/validations/content.schema";

interface CheckoutContentSettingsProps {
  initialCheckout: SiteContent["checkout"];
}

export default function CheckoutContentSettings({
  initialCheckout,
}: CheckoutContentSettingsProps) {
  const [isPending, startTransition] = useTransition();
  const [checkout, setCheckout] = useState(initialCheckout);

  const handleSave = () => {
    startTransition(async () => {
      const res = await updateSiteContentSectionAction("checkout", checkout);
      if (res.success) {
        toast.success("متون فرآیند تسویه حساب با موفقیت ذخیره شدند.");
      } else {
        toast.error(res.error || "خطا در ذخیره‌سازی اطلاعات.");
      }
    });
  };

  return (
    <div className="bg-stone-900/30 border border-stone-800 p-6 rounded-2xl space-y-5">
      <h3 className="text-sm font-black text-stone-200 border-b border-stone-800/50 pb-2">
        متون و راهنماهای تسویه حساب (Checkout)
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-stone-300 block">
            عنوان پنجره تسویه:
          </label>
          <input
            type="text"
            value={checkout.modalTitle}
            onChange={(e) =>
              setCheckout({ ...checkout, modalTitle: e.target.value })
            }
            className="w-full bg-stone-950 border border-stone-800 focus:border-gold-500 focus:ring-1 rounded-xl px-4 py-3 text-sm text-stone-100 outline-none transition-all text-right font-medium"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-stone-300 block">
            عنوان پنجره موفقیت:
          </label>
          <input
            type="text"
            value={checkout.modalSuccessTitle}
            onChange={(e) =>
              setCheckout({ ...checkout, modalSuccessTitle: e.target.value })
            }
            className="w-full bg-stone-950 border border-stone-800 focus:border-gold-500 focus:ring-1 rounded-xl px-4 py-3 text-sm text-stone-100 outline-none transition-all text-right font-medium"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-stone-300 block">
            متن دکمه تکمیل سفارش:
          </label>
          <input
            type="text"
            value={checkout.completeOrderButton}
            onChange={(e) =>
              setCheckout({ ...checkout, completeOrderButton: e.target.value })
            }
            className="w-full bg-stone-950 border border-stone-800 focus:border-gold-500 focus:ring-1 rounded-xl px-4 py-3 text-sm text-stone-100 outline-none transition-all text-right font-medium"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-stone-300 block">
            متن شیوه پرداخت در محل:
          </label>
          <input
            type="text"
            value={checkout.codPaymentTitle}
            onChange={(e) =>
              setCheckout({ ...checkout, codPaymentTitle: e.target.value })
            }
            className="w-full bg-stone-950 border border-stone-800 focus:border-gold-500 focus:ring-1 rounded-xl px-4 py-3 text-sm text-stone-100 outline-none transition-all text-right font-medium"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-stone-300 block">
          پیام اعتماد و پرداخت بدون نیاز به کارت:
        </label>
        <textarea
          rows={2}
          value={checkout.codTrustNotice}
          onChange={(e) =>
            setCheckout({ ...checkout, codTrustNotice: e.target.value })
          }
          className="w-full bg-stone-950 border border-stone-800 focus:border-gold-500 focus:ring-1 rounded-xl px-4 py-3 text-sm text-stone-100 outline-none transition-all resize-none leading-relaxed text-right font-medium"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-stone-300 block">
          پیام نهایی ثبت سفارش در مرحله موفقیت:
        </label>
        <textarea
          rows={3}
          value={checkout.successNoticeText}
          onChange={(e) =>
            setCheckout({ ...checkout, successNoticeText: e.target.value })
          }
          className="w-full bg-stone-950 border border-stone-800 focus:border-gold-500 focus:ring-1 rounded-xl px-4 py-3 text-sm text-stone-100 outline-none transition-all resize-none leading-relaxed text-right font-medium"
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
          ذخیره متون تسویه حساب
        </Button>
      </div>
    </div>
  );
}
