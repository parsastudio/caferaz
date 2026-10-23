"use client";

import React, { useState, useEffect, useTransition, useCallback } from "react";
import { useForm, Resolver, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCheckout } from "@/context/CheckoutContext";
import {
  checkoutFormSchema,
  CheckoutFormValues,
} from "@/domain/validations/order.schema";
import { getCurrentUserAction, sendUserOtpAction } from "@/actions/user-auth";
import { useCouponManager } from "@/hooks/useCouponManager";
import { useCheckoutAuth } from "@/hooks/checkout/useCheckoutAuth";
import { useCheckoutSubmit } from "@/hooks/checkout/useCheckoutSubmit";
import { toEnglishDigits } from "@/lib/utils";

export type Step = "user_info" | "shipping" | "otp" | "success";

export function useCheckoutForm() {
  const { isOpen, checkoutData, closeCheckout } = useCheckout();
  const [step, setStep] = useState<Step>("user_info");
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const methods = useForm<CheckoutFormValues>({
    resolver: zodResolver(
      checkoutFormSchema,
    ) as unknown as Resolver<CheckoutFormValues>,
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      destination: "tehran",
      postalCode: "",
      paymentMethod: "cod",
      shippingAddress: "",
      otp: "",
    },
    mode: "onTouched",
  });

  const { trigger, getValues, reset, setValue, control } = methods;
  const watchedPhone = useWatch({ control, name: "phone" });

  const couponManager = useCouponManager({
    productId: checkoutData?.productId ?? "",
    selectedWeight: checkoutData?.selectedWeight ?? 0,
    quantity: checkoutData?.quantity ?? 1,
    selectedBlend: checkoutData?.selectedBlend ?? "",
    baseFinalPrice: checkoutData?.finalPrice ?? 0,
    baseDirectDiscount: checkoutData?.directDiscountAmount ?? 0,
    baseConditionalDiscount: checkoutData?.conditionalDiscountAmount ?? 0,
    phone: watchedPhone ?? "",
  });

  const authManager = useCheckoutAuth({
    methods,
    startTransition,
    setErrorMessage,
    onLoginSuccess: () => setStep("shipping"),
    onProceedToOtp: () => setStep("otp"),
    onProceedToShipping: () => setStep("shipping"),
  });

  const submitManager = useCheckoutSubmit({
    methods,
    checkoutData,
    appliedCouponCode: couponManager.appliedCoupon?.code ?? null,
    setErrorMessage,
    onSuccess: () => setStep("success"),
  });

  const { setIsLoggedInUser } = authManager;

  useEffect(() => {
    if (isOpen) {
      startTransition(async () => {
        const res = await getCurrentUserAction();
        if (res.success && res.user) {
          setIsLoggedInUser(true);
          const nameParts = res.user.name.split(" ");
          setValue("firstName", nameParts[0] || "");
          setValue("lastName", nameParts.slice(1).join(" ") || "");
          setValue("phone", res.user.phone);
          setValue("shippingAddress", res.user.address || "");
          setStep("shipping");
        } else {
          setIsLoggedInUser(false);
          setStep("user_info");
        }
      });
    }
  }, [isOpen, setValue, setIsLoggedInUser]);

  const { resetCouponState } = couponManager;

  useEffect(() => {
    if (isOpen && checkoutData) {
      resetCouponState(
        checkoutData.finalPrice,
        checkoutData.directDiscountAmount,
        checkoutData.conditionalDiscountAmount,
      );
    }
  }, [isOpen, checkoutData, resetCouponState]);

  const handleReset = useCallback(() => {
    setStep("user_info");
    authManager.setIsLoginMode(false);
    authManager.setOtpPurpose("checkout");
    authManager.setIsLoggedInUser(false);
    setErrorMessage(null);
    setIsSendingOtp(false);
    couponManager.resetCouponState(0, 0, 0);
    reset();
  }, [authManager, couponManager, reset]);

  const handleClose = () => {
    closeCheckout();
    setTimeout(handleReset, 300);
  };

  const handleShippingNext = async (e: React.FormEvent) => {
    e.preventDefault();
    const isAddressValid = await trigger(["shippingAddress"]);
    if (!isAddressValid) return;
    setErrorMessage(null);

    if (authManager.isLoggedInUser) {
      await submitManager.executeOrderSubmission();
    } else {
      const phoneVal = toEnglishDigits(getValues("phone").trim());
      setIsSendingOtp(true);
      try {
        const otpRes = await sendUserOtpAction({
          phone: phoneVal,
          honeypot: authManager.honeypot,
          formToken: authManager.formToken,
        });
        if (otpRes.success) {
          setStep("otp");
        } else {
          setErrorMessage(otpRes.error || "خطا در ارسال کد تایید پیامکی.");
        }
      } catch {
        setErrorMessage("خطا در ارتباط با سامانه ارسال کد پیامکی.");
      } finally {
        setIsSendingOtp(false);
      }
    }
  };

  const handleOtpVerifyAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isOtpValid = await trigger(["otp"]);
    if (!isOtpValid) return;

    if (authManager.otpPurpose === "login") {
      await authManager.handleVerifyLoginOtp(getValues("otp") || "");
    } else {
      await submitManager.executeOrderSubmission(getValues("otp") || "");
    }
  };

  return {
    isOpen,
    step,
    setStep,
    isPending,
    isLoginMode: authManager.isLoginMode,
    setIsLoginMode: authManager.setIsLoginMode,
    otpPurpose: authManager.otpPurpose,
    isLoggedInUser: authManager.isLoggedInUser,
    isSubmitting:
      authManager.isSubmittingAuth ||
      submitManager.isSubmittingOrder ||
      isSendingOtp,
    errorMessage,
    setErrorMessage,
    fakeTrackingCode: submitManager.fakeTrackingCode,
    selectedWeight: checkoutData?.selectedWeight ?? 0,
    quantity: checkoutData?.quantity ?? 1,
    selectedBlend: checkoutData?.selectedBlend ?? "",
    selectedGrind: checkoutData?.selectedGrind ?? "",
    methods,
    handleClose,
    handleUserInfoNext: authManager.handleUserInfoNext,
    handleShippingNext,
    handleOtpVerifyAndSubmit,
    ...couponManager,
    basePrice: checkoutData?.basePrice ?? 0,
    formToken: authManager.formToken,
    honeypot: authManager.honeypot,
  };
}
