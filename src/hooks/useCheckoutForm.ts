"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useForm, Resolver, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCheckout } from "@/context/CheckoutContext";
import {
  checkoutSchema,
  CheckoutFormValues,
} from "@/components/features/checkout/schema";
import { submitOrderAction } from "@/actions/order";
import {
  getCurrentUserAction,
  checkPhoneRegisteredAction,
  loginUserWithOtpAction,
} from "@/actions/auth";
import { useCouponManager } from "@/hooks/useCouponManager";
import { toEnglishDigits } from "@/lib/utils";

export type Step = "user_info" | "shipping" | "otp" | "success";

export function useCheckoutForm() {
  const { isOpen, checkoutData, closeCheckout } = useCheckout();
  const [step, setStep] = useState<Step>("user_info");
  const [isPending, startTransition] = useTransition();

  const [isLoginMode, setIsLoginMode] = useState(false);
  const [otpPurpose, setOtpPurpose] = useState<"login" | "checkout">(
    "checkout",
  );
  const [isLoggedInUser, setIsLoggedInUser] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fakeTrackingCode, setFakeTrackingCode] = useState("");

  const methods = useForm<CheckoutFormValues>({
    resolver: zodResolver(
      checkoutSchema,
    ) as unknown as Resolver<CheckoutFormValues>,
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
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
  }, [isOpen, setValue]);

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

  const handleReset = () => {
    setStep("user_info");
    setIsLoginMode(false);
    setOtpPurpose("checkout");
    setIsLoggedInUser(false);
    setErrorMessage(null);
    couponManager.resetCouponState(0, 0, 0);
    reset();
  };

  const handleClose = () => {
    closeCheckout();
    setTimeout(handleReset, 300);
  };

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
          setStep("otp");
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
        setStep("shipping");
      }
    }
  };

  const executeOrderSubmission = async (otpCode: string) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    const values = getValues();
    const cleanPhone = toEnglishDigits(values.phone.trim());

    try {
      const result = await submitOrderAction({
        productId: checkoutData?.productId ?? "",
        weightGrams: checkoutData?.selectedWeight ?? 0,
        quantity: checkoutData?.quantity ?? 1,
        blend: checkoutData?.selectedBlend ?? "",
        grind: checkoutData?.selectedGrind ?? "",
        customerName: `${values.firstName} ${values.lastName}`.trim(),
        customerPhone: cleanPhone,
        customerAddress: values.shippingAddress,
        otp: otpCode,
        appliedCouponCode: couponManager.appliedCoupon?.code ?? null,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      setFakeTrackingCode(result.data.id);
      setStep("success");
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "خطا در پردازش اطلاعات.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShippingNext = async (e: React.FormEvent) => {
    e.preventDefault();
    const isAddressValid = await trigger(["shippingAddress"]);
    if (!isAddressValid) return;
    setErrorMessage(null);

    if (isLoggedInUser) {
      await executeOrderSubmission("1234");
    } else {
      setStep("otp");
    }
  };

  const handleOtpVerifyAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isOtpValid = await trigger(["otp"]);
    if (!isOtpValid) return;

    if (otpPurpose === "login") {
      setIsSubmitting(true);
      setErrorMessage(null);
      const values = getValues();
      const cleanPhone = toEnglishDigits(values.phone.trim());
      try {
        const loginRes = await loginUserWithOtpAction({
          phone: cleanPhone,
          otp: values.otp || "",
        });

        if (loginRes.success) {
          setIsLoggedInUser(true);
          setIsLoginMode(false);
          setValue("otp", "");
          setStep("shipping");
        } else {
          throw new Error(loginRes.error);
        }
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : "خطا در احراز هویت.",
        );
      } finally {
        setIsSubmitting(false);
      }
    } else {
      await executeOrderSubmission(getValues("otp") || "");
    }
  };

  return {
    isOpen,
    step,
    setStep,
    isPending,
    isLoginMode,
    setIsLoginMode,
    otpPurpose,
    isLoggedInUser,
    isSubmitting,
    errorMessage,
    setErrorMessage,
    fakeTrackingCode,
    selectedWeight: checkoutData?.selectedWeight ?? 0,
    quantity: checkoutData?.quantity ?? 1,
    methods,
    handleClose,
    handleUserInfoNext,
    handleShippingNext,
    handleOtpVerifyAndSubmit,
    ...couponManager,
    basePrice: checkoutData?.basePrice ?? 0,
  };
}
