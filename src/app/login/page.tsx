"use client";

import React, { useState, useTransition, Suspense, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  sendUserOtpAction,
  loginUserWithOtpAction,
  checkPhoneRegisteredAction,
  registerUserAction,
} from "@/actions/auth";
import {
  Smartphone,
  ArrowRight,
  Loader2,
  MessageSquare,
  User,
  MapPin,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toEnglishDigits } from "@/lib/utils";

function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [step, setStep] = useState<"phone_or_details" | "otp">(
    "phone_or_details",
  );

  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [otp, setOtp] = useState("");

  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", ""]);
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!/^09[0-9]{9}$/.test(phone)) {
      setError("لطفاً یک شماره موبایل معتبر (مانند ۰۹۱۲۳۴۵۶۷۸۹) وارد کنید.");
      return;
    }

    if (mode === "register" && (!name.trim() || !address.trim())) {
      setError("لطفاً تمامی فیلدهای ثبت‌نام را به درستی پر کنید.");
      return;
    }

    startTransition(async () => {
      const checkRes = await checkPhoneRegisteredAction({ phone });
      if (checkRes.success) {
        if (mode === "login" && !checkRes.registered) {
          setMode("register");
          setError(
            "شماره همراه شما ثبت نشده است. لطفاً فرم ثبت‌نام زیر را تکمیل فرمایید.",
          );
          return;
        }
        if (mode === "register" && checkRes.registered) {
          setMode("login");
          setError("این شماره از قبل ثبت شده است. به بخش ورود منتقل شدید.");
          return;
        }

        const otpRes = await sendUserOtpAction({ phone });
        if (otpRes.success) {
          setStep("otp");
        } else {
          setError(otpRes.error || "خطا در ارسال کد تایید.");
        }
      }
    });
  };

  const handleOtpChange = (value: string, index: number) => {
    const cleanValue = toEnglishDigits(value).replace(/[^0-9]/g, "");
    const newOtp = [...otpDigits];
    newOtp[index] = cleanValue
      ? cleanValue.substring(cleanValue.length - 1)
      : "";
    setOtpDigits(newOtp);

    const fullOtpString = newOtp.join("");
    setOtp(fullOtpString);

    if (cleanValue && index < 3) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Backspace") {
      const newOtp = [...otpDigits];
      if (otpDigits[index] === "") {
        if (index > 0) {
          newOtp[index - 1] = "";
          setOtpDigits(newOtp);
          setOtp(newOtp.join(""));
          otpInputsRef.current[index - 1]?.focus();
        }
      } else {
        newOtp[index] = "";
        setOtpDigits(newOtp);
        setOtp(newOtp.join(""));
      }
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = toEnglishDigits(e.clipboardData.getData("text"))
      .replace(/[^0-9]/g, "")
      .substring(0, 4);
    if (pastedData.length === 4) {
      const digits = pastedData.split("");
      setOtpDigits(digits);
      setOtp(pastedData);
      otpInputsRef.current[3]?.focus();
    }
  };

  const handleOtpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (otp.length !== 4) {
      setError("لطفاً کد تایید ۴ رقمی را به طور کامل وارد کنید.");
      return;
    }

    startTransition(async () => {
      try {
        if (mode === "register") {
          const regRes = await registerUserAction({
            phone,
            name,
            address,
            otp,
          });
          if (regRes.success) {
            window.location.href = "/profile";
          } else {
            setError(regRes.error || "خطایی در ثبت‌نام رخ داد.");
          }
        } else {
          const loginRes = await loginUserWithOtpAction({ phone, otp });
          if (loginRes.success) {
            window.location.href = "/profile";
          } else {
            setError(loginRes.error || "کد تایید اشتباه است.");
          }
        }
      } catch {
        setError("خطای سیستمی رخ داد.");
      }
    });
  };

  return (
    <AnimatePresence mode="wait">
      {step === "phone_or_details" ? (
        <motion.form
          key={mode}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          onSubmit={handlePhoneSubmit}
          className="space-y-4"
        >
          <div className="flex bg-stone-950 p-1 rounded-xl border border-stone-850">
            <button
              type="button"
              onClick={() => {
                setError(null);
                setMode("login");
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === "login"
                  ? "bg-gold-500 text-stone-950"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              ورود سریع
            </button>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setMode("register");
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === "register"
                  ? "bg-gold-500 text-stone-950"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              ثبت‌نام جدید
            </button>
          </div>

          <div className="space-y-1.5 text-right">
            <label className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-stone-500" />
              شماره تلفن همراه <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(toEnglishDigits(e.target.value))}
              placeholder="09123456789"
              className="w-full bg-stone-950 border border-stone-800 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 rounded-xl px-4 py-3 text-sm text-stone-100 outline-none text-left font-sans"
              dir="ltr"
              required
              disabled={isPending}
            />
          </div>

          {mode === "register" && (
            <>
              <div className="space-y-1.5 text-right animate-in fade-in duration-200">
                <label className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-stone-500" />
                  نام و نام خانوادگی <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: مریم فتاحی"
                  className="w-full bg-stone-950 border border-stone-800 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 rounded-xl px-4 py-3 text-sm text-stone-100 outline-none text-right"
                  required
                  disabled={isPending}
                />
              </div>

              <div className="space-y-1.5 text-right animate-in fade-in duration-200">
                <label className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-stone-500" />
                  آدرس تحویل دیفالت <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="خیابان، کوچه، پلاک..."
                  className="w-full bg-stone-950 border border-stone-800 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 rounded-xl px-4 py-3 text-sm text-stone-100 outline-none text-right resize-none"
                  required
                  disabled={isPending}
                />
              </div>
            </>
          )}

          {error && (
            <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-3.5 rounded-xl text-right font-bold">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={isPending}
            className="w-full py-6 text-xs font-black rounded-xl bg-gold-500 hover:bg-gold-600 text-stone-950 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                در حال پردازش...
              </>
            ) : (
              <>
                {mode === "login"
                  ? "دریافت کد ورود سریع"
                  : "ثبت‌نام و دریافت کد تایید"}
                <ArrowRight className="w-4 h-4 rotate-180" />
              </>
            )}
          </Button>
        </motion.form>
      ) : (
        <motion.form
          key="otp"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          onSubmit={handleOtpVerify}
          className="space-y-4"
        >
          <div className="text-center bg-stone-950/40 p-3 border border-stone-850 rounded-xl">
            <p className="text-[11px] text-stone-400 leading-relaxed">
              کد تایید ۴ رقمی پیامکی به شماره{" "}
              <span className="text-gold-400 font-bold font-sans" dir="ltr">
                {phone}
              </span>{" "}
              ارسال گردید.
            </p>
          </div>

          <div className="space-y-1.5 text-right">
            <label className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-stone-500" />
              کد تایید پیامکی <span className="text-red-500">*</span>
            </label>

            <div
              className="flex justify-center gap-3 py-2 animate-in fade-in duration-200 font-sans"
              dir="ltr"
            >
              {otpDigits.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  ref={(el) => {
                    otpInputsRef.current[index] = el;
                  }}
                  onChange={(e) => handleOtpChange(e.target.value, index)}
                  onKeyDown={(e) => handleOtpKeyDown(e, index)}
                  onPaste={handleOtpPaste}
                  disabled={isPending}
                  className={`w-12 h-14 text-center text-xl font-black bg-stone-950 border-2 rounded-xl outline-none text-gold-400 transition-all shadow-inner ${
                    error
                      ? "border-destructive/60 focus:border-destructive focus:ring-destructive/30"
                      : "border-stone-800/80 focus:border-gold-500 focus:ring-gold-500"
                  }`}
                />
              ))}
            </div>
          </div>

          {error && (
            <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-right font-bold">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setError(null);
                setOtpDigits(["", "", "", ""]);
                setOtp("");
                setStep("phone_or_details");
              }}
              className="text-stone-400 hover:text-stone-200 cursor-pointer text-xs"
              disabled={isPending}
            >
              اصلاح مشخصات
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
                "ورود نهایی به پیشخوان"
              )}
            </Button>
          </div>
        </motion.form>
      )}
    </AnimatePresence>
  );
}

export default function UserLoginPage() {
  return (
    <div
      className="min-h-screen bg-stone-950 flex flex-col justify-center items-center p-4 relative overflow-hidden"
      dir="rtl"
    >
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl" />

      <div className="w-full max-w-md md:max-w-lg bg-stone-900/40 border border-stone-800/80 rounded-3xl p-8 backdrop-blur-md relative z-10 space-y-6">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-gold-500/10 border border-gold-500/20 text-gold-500 flex items-center justify-center text-3xl mx-auto">
            ☕
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-black text-stone-100">
              ورود به پنل کاربری
            </h1>
            <p className="text-[11px] text-stone-400">
              جهت پیگیری آنلاین سفارشات مشخصات خود را وارد کنید
            </p>
          </div>
        </div>

        <Suspense
          fallback={
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-gold-500" />
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
