"use client";

import React, { useEffect, useState, useRef } from "react";
import { Smartphone, Loader2 } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { Button } from "../ui/button";
import { CheckoutFormValues } from "./schema";

interface OtpStepProps {
  phone: string;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  finalPrice: number;
}

export default function OtpStep({
  phone,
  onBack,
  onSubmit,
  isSubmitting,
  finalPrice,
}: OtpStepProps) {
  const {
    setValue,
    formState: { errors },
  } = useFormContext<CheckoutFormValues>();

  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", ""]);
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const [timer, setTimer] = useState(120);
  const [isResendDisabled, setIsResendDisabled] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setIsResendDisabled(false);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpChange = (value: string, index: number) => {
    const cleanValue = value.replace(/[^0-9]/g, "");
    if (!cleanValue) return;

    const newOtp = [...otpDigits];
    newOtp[index] = cleanValue.substring(cleanValue.length - 1);
    setOtpDigits(newOtp);

    const fullOtpString = newOtp.join("");
    setValue("otp", fullOtpString, { shouldValidate: true });

    if (index < 3) {
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
          setValue("otp", newOtp.join(""), { shouldValidate: true });
          otpInputsRef.current[index - 1]?.focus();
        }
      } else {
        newOtp[index] = "";
        setOtpDigits(newOtp);
        setValue("otp", newOtp.join(""), { shouldValidate: true });
      }
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/[^0-9]/g, "")
      .substring(0, 4);
    if (pastedData.length === 4) {
      const digits = pastedData.split("");
      setOtpDigits(digits);
      setValue("otp", pastedData, { shouldValidate: true });
      otpInputsRef.current[3]?.focus();
    }
  };

  const handleResendCode = () => {
    const cleared = ["", "", "", ""];
    setOtpDigits(cleared);
    setValue("otp", "", { shouldValidate: true });
    setTimer(120);
    setIsResendDisabled(true);
    otpInputsRef.current[0]?.focus();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5 text-right" dir="rtl">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-500 flex items-center justify-center mx-auto mb-1">
          <Smartphone className="w-6 h-6" />
        </div>
        <p className="text-sm font-black text-stone-200">
          کد تایید را وارد کنید
        </p>
        <p className="text-[11px] text-stone-400 leading-relaxed max-w-xs mx-auto">
          یک پیامک تستی حاوی کد تایید برای شماره{" "}
          <span className="text-gold-400 font-bold tracking-wider" dir="ltr">
            {phone}
          </span>{" "}
          ارسال گردید.
        </p>
      </div>

      <div className="flex justify-center gap-3" dir="ltr">
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
            className={`w-12 h-14 text-center text-xl font-black bg-stone-950 border-2 rounded-xl outline-none text-gold-400 transition-all shadow-inner ${
              errors.otp
                ? "border-destructive/60 focus:border-destructive focus:ring-destructive/30"
                : "border-stone-800/80 focus:border-gold-500 focus:ring-gold-500"
            }`}
          />
        ))}
      </div>

      {errors.otp && (
        <p className="text-[10px] text-destructive font-bold text-center mt-1">
          {errors.otp.message}
        </p>
      )}

      <div className="text-center">
        {timer > 0 ? (
          <span className="text-xs text-stone-500 font-medium">
            امکان ارسال مجدد کد در:{" "}
            <span className="text-stone-300 font-bold">
              {formatTime(timer)}
            </span>
          </span>
        ) : (
          <button
            type="button"
            disabled={isResendDisabled}
            onClick={handleResendCode}
            className="text-xs text-gold-500 hover:text-gold-400 font-bold hover:underline cursor-pointer"
          >
            ارسال مجدد کد تایید
          </button>
        )}
      </div>

      <div className="border-t border-stone-850 pt-4 mt-6 flex items-center justify-between">
        <div className="text-right">
          <span className="text-[10px] text-stone-500 block font-bold">
            پرداخت در محل:
          </span>
          <span className="text-sm font-black text-gold-500">
            {finalPrice.toLocaleString()} تومان
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            className="text-stone-400 hover:text-stone-200 cursor-pointer text-xs"
            disabled={isSubmitting}
          >
            ویرایش آدرس
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-gold-500 hover:bg-gold-600 text-stone-950 font-bold px-5 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                درحال بررسی...
              </>
            ) : (
              "تایید نهایی و ثبت"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
