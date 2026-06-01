"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { loginUserAction } from "@/app/actions/auth";
import { Smartphone, User, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/button";

export default function ProfileLoginClient() {
  const router = useRouter();
  const [step, setStep] = useState<"info" | "otp">("info");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("لطفاً نام خود را وارد کنید.");
      return;
    }
    if (!/^09[0-9]{9}$/.test(phone)) {
      setError("لطفاً یک شماره موبایل معتبر (مانند ۰۹۱۲۳۴۵۶۷۸۹) وارد کنید.");
      return;
    }
    setStep("otp");
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (otp !== "1234") {
      setError("کد تایید پیامک شده نامعتبر است (کد تستی ۱۲۳۴ است).");
      return;
    }

    startTransition(async () => {
      try {
        const result = await loginUserAction({ phone, name });
        if (result.success) {
          router.refresh();
        } else {
          setError(result.error || "خطایی در ثبت رخ داد.");
        }
      } catch {
        setError("خطا در برقراری ارتباط با سیستم.");
      }
    });
  };

  return (
    <div
      className="min-h-screen bg-stone-950 flex flex-col justify-center items-center p-4 relative overflow-hidden"
      dir="rtl"
    >
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl" />

      <div className="w-full max-w-md bg-stone-900/40 border border-stone-800/80 rounded-3xl p-8 backdrop-blur-md relative z-10 space-y-6">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-gold-500/10 border border-gold-500/20 text-gold-500 flex items-center justify-center text-3xl mx-auto">
            ☕
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-black text-stone-100">
              پنل پیگیری کافه راز
            </h1>
            <p className="text-[11px] text-stone-400">
              جهت مشاهده آنلاین وضعیت سفارشات، وارد حساب کاربری شوید
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === "info" ? (
            <motion.form
              key="info"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleInfoSubmit}
              className="space-y-4"
            >
              <div className="space-y-1.5 text-right">
                <label className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-stone-500" />
                  نام و نام خانوادگی
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: رضا محمدی"
                  className="w-full bg-stone-950 border border-stone-850 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 rounded-xl px-4 py-3 text-sm text-stone-100 outline-none text-right"
                />
              </div>

              <div className="space-y-1.5 text-right">
                <label className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-stone-500" />
                  شماره موبایل
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="09123456789"
                  className="w-full bg-stone-950 border border-stone-850 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 rounded-xl px-4 py-3 text-sm text-stone-100 outline-none text-left font-sans"
                  dir="ltr"
                />
              </div>

              {error && (
                <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-3.5 rounded-xl text-right font-bold">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full py-6 text-xs font-black rounded-xl bg-gold-500 hover:bg-gold-600 text-stone-950 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                ارسال کد تایید پیامکی
                <ArrowRight className="w-4 h-4 rotate-180" />
              </Button>
            </motion.form>
          ) : (
            <motion.form
              key="otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleOtpSubmit}
              className="space-y-4"
            >
              <div className="text-center bg-stone-950/40 p-3 border border-stone-850 rounded-xl">
                <p className="text-[11px] text-stone-400 leading-relaxed">
                  کد تایید ۴ رقمی برای شماره{" "}
                  <span className="text-gold-400 font-bold" dir="ltr">
                    {phone}
                  </span>{" "}
                  ارسال شد.
                </p>
                <p className="text-[10px] text-gold-500 font-bold mt-1">
                  💡 کد تست ورود به سیستم: 1234
                </p>
              </div>

              <div className="space-y-1.5 text-right">
                <label className="text-xs font-bold text-stone-300">
                  کد تایید ۴ رقمی
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="••••"
                  className="w-full bg-stone-950 border border-stone-850 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 rounded-xl px-4 py-3 text-sm text-center text-gold-400 tracking-widest outline-none font-sans"
                />
              </div>

              {error && (
                <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-3.5 rounded-xl text-right font-bold">
                  {error}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setError(null);
                    setStep("info");
                  }}
                  className="text-stone-400 hover:text-stone-200 cursor-pointer text-xs"
                >
                  ویرایش اطلاعات
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-6 text-xs font-black rounded-xl bg-gold-500 hover:bg-gold-600 text-stone-950 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      در حال بررسی...
                    </>
                  ) : (
                    "تایید و ورود به داشبورد"
                  )}
                </Button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
