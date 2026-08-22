"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  sendUserOtpAction,
  loginUserWithOtpAction,
  checkPhoneRegisteredAction,
  registerUserAction,
  getOtpFormTokenAction,
} from "@/actions/user-auth";
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
import OtpInput from "@/components/ui/otp-input";
import { normalizePhone, isValidIranianPhone } from "@/lib/phone";
import { useSiteContent } from "@/context/ContentContext";

export default function UserLoginForm() {
  const { auth: authCopy } = useSiteContent();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [step, setStep] = useState<"phone_or_details" | "otp">(
    "phone_or_details",
  );

  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [otp, setOtp] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [formToken, setFormToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getOtpFormTokenAction().then((res) => {
      if (res.success && res.data) {
        setFormToken(res.data);
      }
    });
  }, []);

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanPhone = normalizePhone(phone);
    if (!isValidIranianPhone(cleanPhone)) {
      setError("لطفاً یک شماره موبایل معتبر (مانند ۰۹۱۲۳۴۵۶۷۸۹) وارد کنید.");
      return;
    }

    if (mode === "register" && (!name.trim() || !address.trim())) {
      setError("لطفاً تمامی فیلدهای ثبت‌نام را به درستی پر کنید.");
      return;
    }

    startTransition(async () => {
      const checkRes = await checkPhoneRegisteredAction({ phone: cleanPhone });
      if (checkRes.success) {
        if (mode === "login" && !checkRes.registered) {
          setMode("register");
          setError(authCopy.unregisteredHint);
          return;
        }
        if (mode === "register" && checkRes.registered) {
          setMode("login");
          setError(authCopy.registeredHint);
          return;
        }

        const otpRes = await sendUserOtpAction({
          phone: cleanPhone,
          honeypot,
          formToken,
        });
        if (otpRes.success) {
          setStep("otp");
        } else {
          setError(otpRes.error || "خطا در ارسال کد تایید.");
        }
      }
    });
  };

  const handleOtpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (otp.length !== 4) {
      setError("لطفاً کد تایید ۴ رقمی را به طور کامل وارد کنید.");
      return;
    }

    const cleanPhone = normalizePhone(phone);

    startTransition(async () => {
      try {
        if (mode === "register") {
          const regRes = await registerUserAction({
            phone: cleanPhone,
            name,
            address,
            otp,
          });
          if (regRes.success) {
            router.push("/profile");
            router.refresh();
          } else {
            setError(regRes.error || "خطایی در ثبت‌نام رخ داد.");
          }
        } else {
          const loginRes = await loginUserWithOtpAction({
            phone: cleanPhone,
            otp,
          });
          if (loginRes.success) {
            router.push("/profile");
            router.refresh();
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
          <div className="flex bg-stone-950 p-1 rounded-xl border border-stone-855">
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
              {authCopy.loginTab}
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
              {authCopy.registerTab}
            </button>
          </div>

          <div
            style={{
              position: "absolute",
              opacity: 0,
              top: 0,
              left: "-9999px",
              height: 0,
              width: 0,
              overflow: "hidden",
            }}
            aria-hidden="true"
          >
            <input
              type="text"
              name="company_website_url"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <div className="space-y-1.5 text-right">
            <label className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-stone-500" />
              {authCopy.phoneLabel} <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(normalizePhone(e.target.value))}
              placeholder={authCopy.phonePlaceholder}
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
                  {authCopy.nameLabel} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={authCopy.namePlaceholder}
                  className="w-full bg-stone-950 border border-stone-800 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 rounded-xl px-4 py-3 text-sm text-stone-100 outline-none text-right"
                  required
                  disabled={isPending}
                />
              </div>

              <div className="space-y-1.5 text-right animate-in fade-in duration-200">
                <label className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-stone-500" />
                  {authCopy.addressLabel}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={authCopy.addressPlaceholder}
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
                {authCopy.processingText}
              </>
            ) : (
              <>
                {mode === "login" ? authCopy.loginCta : authCopy.registerCta}
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
              {authCopy.otpNoticePrefix}{" "}
              <span className="text-gold-400 font-bold font-sans" dir="ltr">
                {phone}
              </span>
            </p>
          </div>

          <div className="space-y-1.5 text-right">
            <label className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-stone-500" />
              {authCopy.otpLabel} <span className="text-red-500">*</span>
            </label>
            <OtpInput
              value={otp}
              onChange={setOtp}
              disabled={isPending}
              hasError={Boolean(error)}
            />
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
                setOtp("");
                setStep("phone_or_details");
              }}
              className="text-stone-400 hover:text-stone-200 cursor-pointer text-xs"
              disabled={isPending}
            >
              {authCopy.fixDetailsButton}
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 py-6 text-xs font-black rounded-xl bg-gold-500 hover:bg-gold-600 text-stone-950 cursor-pointer flex items-center justify-center gap-1.5"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {authCopy.verifyingText}
                </>
              ) : (
                authCopy.loginFinalCta
              )}
            </Button>
          </div>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
