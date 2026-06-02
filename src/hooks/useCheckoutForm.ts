"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useForm, Resolver } from "react-hook-form";
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
import { validateCouponAction } from "@/actions/coupon";
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

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [checkoutFinalPrice, setCheckoutFinalPrice] = useState(0);
  const [directDiscountAmount, setDirectDiscountAmount] = useState(0);
  const [conditionalDiscountAmount, setConditionalDiscountAmount] = useState(0);

  const [lastValidatedPhone, setLastValidatedPhone] = useState("");

  const productId = checkoutData?.productId || "";
  const selectedWeight = checkoutData?.selectedWeight || 0;
  const selectedBlend = checkoutData?.selectedBlend || "";
  const selectedGrind = checkoutData?.selectedGrind || "";
  const quantity = checkoutData?.quantity || 1;
  const finalPrice = checkoutData?.finalPrice || 0;

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

  const { trigger, getValues, reset, setValue, watch } = methods;

  const watchedPhone = watch("phone");

  useEffect(() => {
    if (appliedCoupon) {
      const cleanWatchedPhone = toEnglishDigits(watchedPhone?.trim() || "");
      const isValidPhoneFormat = /^09[0-9]{9}$/.test(cleanWatchedPhone);

      if (isValidPhoneFormat && cleanWatchedPhone !== lastValidatedPhone) {
        handleRemoveCoupon();
      }
    }
  }, [watchedPhone, appliedCoupon, lastValidatedPhone]);

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

  useEffect(() => {
    if (isOpen && checkoutData) {
      setCheckoutFinalPrice(checkoutData.finalPrice);
      setDirectDiscountAmount(checkoutData.directDiscountAmount);
      setConditionalDiscountAmount(checkoutData.conditionalDiscountAmount);
      setAppliedCoupon(null);
      setCouponError(null);
      setCouponCode("");
      setLastValidatedPhone("");
    }
  }, [isOpen, checkoutData]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    setCouponError(null);

    const rawPhone = getValues("phone") || "";
    const cleanPhone = toEnglishDigits(rawPhone.trim());

    const res = await validateCouponAction({
      code: couponCode,
      phone: cleanPhone || null,
      productId,
      weightGrams: selectedWeight,
      quantity,
      blend: selectedBlend,
    });

    if (res.success) {
      setAppliedCoupon({
        code: res.data.code,
        discountAmount: res.data.discountAmount,
      });
      setCheckoutFinalPrice(res.data.finalPrice);
      setDirectDiscountAmount(res.data.directDiscountAmount);
      setConditionalDiscountAmount(res.data.conditionalDiscountAmount);
      setLastValidatedPhone(cleanPhone);
    } else {
      setCouponError(res.error);
    }
    setIsApplyingCoupon(false);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError(null);
    setCheckoutFinalPrice(finalPrice);
    setDirectDiscountAmount(checkoutData?.directDiscountAmount || 0);
    setConditionalDiscountAmount(checkoutData?.conditionalDiscountAmount || 0);
    setLastValidatedPhone("");
  };

  const handleReset = () => {
    setStep("user_info");
    setIsLoginMode(false);
    setOtpPurpose("checkout");
    setIsLoggedInUser(false);
    setErrorMessage(null);
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError(null);
    setCheckoutFinalPrice(0);
    setDirectDiscountAmount(0);
    setConditionalDiscountAmount(0);
    setLastValidatedPhone("");
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

  const handleShippingNext = async (e: React.FormEvent) => {
    e.preventDefault();
    const isAddressValid = await trigger(["shippingAddress"]);
    if (!isAddressValid) return;

    setErrorMessage(null);

    if (isLoggedInUser) {
      setIsSubmitting(true);
      const values = getValues();
      const cleanPhone = toEnglishDigits(values.phone.trim());
      try {
        const result = await submitOrderAction({
          productId,
          weightGrams: selectedWeight,
          quantity,
          blend: selectedBlend,
          grind: selectedGrind,
          customerName: `${values.firstName} ${values.lastName}`,
          customerPhone: cleanPhone,
          customerAddress: values.shippingAddress,
          otp: "1234",
          appliedCouponCode: appliedCoupon?.code || null,
        });

        if (!result.success) {
          throw new Error(result.error);
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
    const cleanPhone = toEnglishDigits(values.phone.trim());

    try {
      if (otpPurpose === "login") {
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
      } else {
        const result = await submitOrderAction({
          productId,
          weightGrams: selectedWeight,
          quantity,
          blend: selectedBlend,
          grind: selectedGrind,
          customerName: `${values.firstName} ${values.lastName}`,
          customerPhone: cleanPhone,
          customerAddress: values.shippingAddress,
          otp: values.otp || "",
          appliedCouponCode: appliedCoupon?.code || null,
        });

        if (!result.success) {
          throw new Error(result.error);
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
    couponCode,
    setCouponCode,
    appliedCoupon,
    couponError,
    isApplyingCoupon,
    checkoutFinalPrice,
    basePrice: checkoutData?.basePrice || 0,
    directDiscountAmount,
    conditionalDiscountAmount,
    handleApplyCoupon,
    handleRemoveCoupon,
  };
}
