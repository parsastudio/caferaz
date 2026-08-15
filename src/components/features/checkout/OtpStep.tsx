"use client";

import React, { useEffect, useState, useRef } from "react";
import { Smartphone, Loader2 } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { CheckoutFormValues } from "@/domain/validations/order.schema";
import { toEnglishDigits } from "@/lib/utils";
import { sendUserOtpAction } from "@/actions/auth";
import OrderSummaryCard from "@/components/features/checkout/components/OrderSummaryCard";

interface OtpStepProps {
  phone: string;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  finalPrice: number;
  summaryData?: {
    blend: string;
    grind: string;
    weightGrams: number;
    quantity: number;
  } | null;
}

export default function OtpStep({
  phone,
  onBack,
  onSubmit,
  isSubmitting,
  finalPrice,
  summaryData,
}: OtpStepProps) {
  const {
    setValue,
    formState: { errors },
  } = useFormContext<CheckoutFormValues>();

  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", ""]);
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const [timer, setTimer] = useState(120);
  const isResendDisabled = timer > 0;

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpChange = (value: string, index: number) => {
    const cleanValue = toEnglishDigits(value).replace(/[^0-9]/g, "");

    const newOtp = [...otpDigits];
    newOtp[index] = cleanValue
      ? cleanValue.substring(cleanValue.length - 1)
      : "";
    setOtpDigits(newOtp);

    const fullOtpString = newOtp.join("");
    setValue("otp", fullOtpString, { shouldValidate: true });

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
    const pastedData = toEnglishDigits(e.clipboardData.getData("text"))
      .replace(/[^0-9]/g, "")
      .substring(0, 4);
    if (pastedData.length === 4) {
      const digits = pastedData.split("");
      setOtpDigits(digits);
      setValue("otp", pastedData, { shouldValidate: true });
      otpInputsRef.current[3]?.focus();
    }
  };

  const handleResendCode = async () => {
    try {
      const res = await sendUserOtpAction({ phone });
      if (res.success) {
        const cleared = ["", "", "", ""];
        setOtpDigits(cleared);
        setValue("otp", "", { shouldValidate: true });
        setTimer(120);
        otpInputsRef.current[0]?.focus();
      }
    } catch (err) {
      console.error("OTP resend error:", err);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 text-right" dir="rtl">
      {summaryData && (
        <OrderSummaryCard
          blend={summaryData.blend}
          grind={summaryData.grind}
          weightGrams={summaryData.weightGrams}
          quantity={summaryData.quantity}
        />
      )}

      <div className="text-center space-y-1.5 pt-1">
        <div className="w-10 h-10 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-500 flex items-center justify-center mx-auto mb-1">
          <Smartphone className="w-5 h-5" />
        </div>
        <p className="text-xs font-black text-stone-200">
          کد تایید پیامک‌شده را وارد کنید
        </p>
        <p className="text-[11px] text-stone-400 leading-relaxed max-w-xs mx-auto">
          کد تایید ۴ رقمی برای شماره{" "}
          <span
            className="text-gold-400 font-bold tracking-wider font-sans"
            dir="ltr"
          >
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
            <span className="text-stone-300 font-bold font-sans">
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

      <div className="border-t border-stone-850 pt-4 mt-4 flex items-center justify-between">
        <div className="text-right">
          <span className="text-[10px] text-stone-500 block font-bold">
            پرداخت در محل:
          </span>
          <span className="text-sm font-black text-gold-500 font-sans">
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
            ویرایش
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-gold-500 hover:bg-gold-600 text-stone-950 font-bold px-5 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer text-xs"
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
