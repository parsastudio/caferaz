"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCheckout } from "@/context/CheckoutContext";
import {
  checkoutSchema,
  CheckoutFormValues,
} from "@/components/checkout/schema";
import { submitOrderAction } from "@/app/actions/order";
import {
  getCurrentUserAction,
  checkPhoneRegisteredAction,
  loginUserWithOtpAction,
} from "@/app/actions/auth";

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

  const productId = checkoutData?.productId || "";
  const selectedWeight = checkoutData?.selectedWeight || 0;
  const selectedBlend = checkoutData?.selectedBlend || "";
  const selectedGrind = checkoutData?.selectedGrind || "";
  const quantity = checkoutData?.quantity || 1;
  const finalPrice = checkoutData?.finalPrice || 0;

  const methods = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      shippingAddress: "",
      otp: "",
    },
    mode: "onTouched",
  });

  const { trigger, getValues, reset, setValue } = methods;

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

  const handleReset = () => {
    setStep("user_info");
    setIsLoginMode(false);
    setOtpPurpose("checkout");
    setIsLoggedInUser(false);
    setErrorMessage(null);
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

      const phoneVal = getValues("phone");
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

  const handleShippingNext = async (e: React.FormEvent) => {
    e.preventDefault();
    const isAddressValid = await trigger(["shippingAddress"]);
    if (!isAddressValid) return;

    setErrorMessage(null);

    if (isLoggedInUser) {
      setIsSubmitting(true);
      const values = getValues();
      try {
        const result = await submitOrderAction({
          productId,
          weightGrams: selectedWeight,
          quantity,
          blend: selectedBlend,
          grind: selectedGrind,
          customerName: `${values.firstName} ${values.lastName}`,
          customerPhone: values.phone,
          customerAddress: values.shippingAddress,
          otp: "1234",
        });

        if (!result.success || !result.data) {
          throw new Error(result.error || "خطایی در ثبت سفارش رخ داد.");
        }

        setFakeTrackingCode(result.data.id);
        setStep("success");
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : "خطا در برقراری ارتباط با سرور.",
        );
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setStep("otp");
    }
  };

  const handleOtpVerifyAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isOtpValid = await trigger(["otp"]);
    if (!isOtpValid) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    const values = getValues();

    try {
      if (otpPurpose === "login") {
        const loginRes = await loginUserWithOtpAction({
          phone: values.phone,
          otp: values.otp || "",
        });

        if (loginRes.success) {
          setIsLoggedInUser(true);
          setIsLoginMode(false);
          setValue("otp", "");
          setStep("shipping");
        } else {
          throw new Error(loginRes.error || "کد تایید اشتباه است.");
        }
      } else {
        const result = await submitOrderAction({
          productId,
          weightGrams: selectedWeight,
          quantity,
          blend: selectedBlend,
          grind: selectedGrind,
          customerName: `${values.firstName} ${values.lastName}`,
          customerPhone: values.phone,
          customerAddress: values.shippingAddress,
          otp: values.otp || "",
        });

        if (!result.success || !result.data) {
          throw new Error(result.error || "کد تایید اشتباه است.");
        }

        setFakeTrackingCode(result.data.id);
        setStep("success");
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "خطا در پردازش اطلاعات.",
      );
    } finally {
      setIsSubmitting(false);
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
    selectedWeight,
    quantity,
    finalPrice,
    methods,
    handleClose,
    handleUserInfoNext,
    handleShippingNext,
    handleOtpVerifyAndSubmit,
  };
}
