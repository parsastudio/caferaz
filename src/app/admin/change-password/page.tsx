"use client";

import React, { useState, useTransition } from "react";
import { updateAdminPasswordAction } from "@/actions/auth";
import { toast } from "sonner";
import { Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ChangePasswordPage() {
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!oldPass || !newPass || !confirmPass) {
      toast.error("لطفاً تمامی فیلدها را تکمیل کنید.");
      return;
    }

    if (newPass !== confirmPass) {
      toast.error("رمز عبور جدید با تاییدیه آن مطابقت ندارد.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await updateAdminPasswordAction({ oldPass, newPass });
        if (result.success) {
          toast.success(result.message || "تغییر رمز عبور با موفقیت انجام شد.");
          setOldPass("");
          setNewPass("");
          setConfirmPass("");
        } else {
          toast.error(result.error || "خطایی رخ داد.");
        }
      } catch {
        toast.error("خطا در ارتباط با سرور.");
      }
    });
  };

  return (
    <div className="space-y-8 text-right max-w-xl" dir="rtl">
      <div>
        <h1 className="text-2xl font-black text-stone-100">
          تغییر رمز عبور مدیریت
        </h1>
        <p className="text-xs text-stone-400 mt-1">
          به‌روزرسانی کلید امنیتی دسترسی به پنل مدیریت کافه راز
        </p>
      </div>

      <div className="bg-stone-900/30 border border-stone-800 p-6 rounded-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-300 block">
              رمز عبور فعلی:
            </label>
            <input
              type="password"
              value={oldPass}
              onChange={(e) => setOldPass(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 rounded-xl px-4 py-3 text-sm text-stone-100 outline-none transition-all text-left font-sans"
              dir="ltr"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-300 block">
              رمز عبور جدید:
            </label>
            <input
              type="password"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 rounded-xl px-4 py-3 text-sm text-stone-100 outline-none transition-all text-left font-sans"
              dir="ltr"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-300 block">
              تکرار رمز عبور جدید:
            </label>
            <input
              type="password"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 rounded-xl px-4 py-3 text-sm text-stone-100 outline-none transition-all text-left font-sans"
              dir="ltr"
            />
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-gold-500 hover:bg-gold-600 text-stone-950 font-black py-6 rounded-xl transition-colors cursor-pointer text-xs flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  در حال ذخیره‌سازی...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  تغییر رمز عبور
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      <div className="bg-stone-950/40 p-4 border border-stone-850 rounded-xl">
        <p className="text-[11px] text-stone-400 leading-relaxed">
          🔐 لطفاً رمز عبور جدید خود را در جای امنی یادداشت فرمایید. پس از تغییر
          رمز عبور، برای بررسی‌های بعدی اعتبار ورود شما با کلید امنیتی جدید
          تطبیق داده خواهد شد.
        </p>
      </div>
    </div>
  );
}
