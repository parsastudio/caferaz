"use client";

import React, { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { CheckoutFormValues } from "@/domain/validations/order.schema";
import {
  checkPhoneRegisteredAction,
  loginUserWithOtpAction,
} from "@/actions/user-auth";
import { toEnglishDigits } from "@/lib/utils";

export type OtpPurpose = "login" | "checkout";

interface UseCheckoutAuthProps {
  methods: UseFormReturn<CheckoutFormValues>;
  startTransition: React.TransitionStartFunction;
  setErrorMessage: (msg: string | null) => void;
  onLoginSuccess: () => void;
  onProceedToOtp: (purpose: OtpPurpose) => void;
  onProceedToShipping: () => void;
}

export function useCheckoutAuth({
  methods,
  startTransition,
  setErrorMessage,
  onLoginSuccess,
  onProceedToOtp,
  onProceedToShipping,
}: UseCheckoutAuthProps) {
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [otpPurpose, setOtpPurpose] = useState<OtpPurpose>("checkout");
  const [isLoggedInUser, setIsLoggedInUser] = useState(false);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);

  const { trigger, getValues, setValue } = methods;

  const handleUserInfoNext = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (isLoginMode) {
      const isPhoneValid = await trigger(["phone"]);
      if (!isPhoneValid) return;

      const phoneVal = toEnglishDigits(getValues("phone").trim());
      startTransition(async () => {
        const checkRes = await checkPhoneRegisteredAction({ phone: phoneVal });
        if (checkRes.success && checkRes.registered && checkRes.user) {
          const nameParts = checkRes.user.name.split(" ");
          setValue("firstName", nameParts[0] || "");
          setValue("lastName", nameParts.slice(1).join(" ") || "");
          setValue("shippingAddress", checkRes.user.address || "");
          setOtpPurpose("login");
          onProceedToOtp("login");
        } else {
          setErrorMessage(
            "این شماره همراه قبلاً ثبت‌نام نکرده است. لطفاً ثبت‌نام کنید.",
          );
        }
      });
    } else {
      const isFieldsValid = await trigger(["firstName", "lastName", "phone"]);
      if (isFieldsValid) {
        setOtpPurpose("checkout");
        onProceedToShipping();
      }
    }
  };

  const handleVerifyLoginOtp = async (otpCode: string): Promise<boolean> => {
    setIsSubmittingAuth(true);
    setErrorMessage(null);
    const cleanPhone = toEnglishDigits(getValues("phone").trim());

    try {
      const loginRes = await loginUserWithOtpAction({
        phone: cleanPhone,
        otp: otpCode,
      });

      if (loginRes.success) {
        setIsLoggedInUser(true);
        setIsLoginMode(false);
        setValue("otp", "");
        onLoginSuccess();
        return true;
      } else {
        throw new Error(loginRes.error);
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "خطا در احراز هویت.",
      );
      return false;
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  return {
    isLoginMode,
    setIsLoginMode,
    otpPurpose,
    setOtpPurpose,
    isLoggedInUser,
    setIsLoggedInUser,
    isSubmittingAuth,
    handleUserInfoNext,
    handleVerifyLoginOtp,
  };
}
