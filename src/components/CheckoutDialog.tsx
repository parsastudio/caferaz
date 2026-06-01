"use client";

import React, { useState, useEffect, useTransition } from "react";
import { ShoppingBag, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCheckout } from "@/context/CheckoutContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

import UserInfoStep from "./checkout/UserInfoStep";
import ShippingStep from "./checkout/ShippingStep";
import OtpStep from "./checkout/OtpStep";
import SuccessStep from "./checkout/SuccessStep";
import { checkoutSchema, CheckoutFormValues } from "./checkout/schema";
import { submitOrderAction } from "@/app/actions/order";
import {
  getCurrentUserAction,
  checkPhoneRegisteredAction,
  loginUserWithOtpAction,
} from "@/app/actions/auth";

type Step = "user_info" | "shipping" | "otp" | "success";

export default function CheckoutDialog() {
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

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          closeCheckout();
          setTimeout(handleReset, 300);
        }
      }}
    >
      <DialogContent
        dir="rtl"
        className="max-w-md bg-stone-900 border border-stone-800 text-stone-100 p-0 overflow-hidden rounded-2xl text-right"
        showCloseButton={false}
      >
        <div className="p-6 pb-4 border-b border-stone-800/80 bg-stone-950/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/20 text-gold-500 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-black text-stone-100">
                {step === "success"
                  ? "ثبت موفقیت‌آمیز سفارش"
                  : "ثبت نهایی سفارش خرید قهوه"}
              </DialogTitle>
              <DialogDescription className="text-[11px] text-stone-400 mt-0.5">
                {step === "user_info" && "اطلاعات خریدار"}
                {step === "shipping" && "اطلاعات ارسال و پرداخت"}
                {step === "otp" && "تایید شماره تماس"}
                {step === "success" && "سفارش شما با موفقیت ثبت شد"}
              </DialogDescription>
            </div>
          </div>

          {step !== "user_info" && step !== "success" && (
            <button
              onClick={() => {
                setErrorMessage(null);
                if (step === "shipping") setStep("user_info");
                if (step === "otp") {
                  if (otpPurpose === "login") {
                    setStep("user_info");
                  } else {
                    setStep("shipping");
                  }
                }
              }}
              className="text-stone-400 hover:text-stone-200 p-1.5 rounded-lg hover:bg-stone-800/40 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="p-6">
          <FormProvider {...methods}>
            <AnimatePresence mode="wait">
              {step === "user_info" && (
                <motion.div
                  key="user_info"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <UserInfoStep
                    onSubmit={handleUserInfoNext}
                    finalPrice={finalPrice}
                    onClose={closeCheckout}
                    isLoginMode={isLoginMode}
                    onToggleLoginMode={() => {
                      setErrorMessage(null);
                      setIsLoginMode(!isLoginMode);
                    }}
                    isCheckingPhone={isPending}
                  />
                </motion.div>
              )}

              {step === "shipping" && (
                <motion.div
                  key="shipping"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <ShippingStep
                    onSubmit={handleShippingNext}
                    onBack={() => setStep("user_info")}
                    finalPrice={finalPrice}
                    isLoggedIn={isLoggedInUser}
                    isSubmitting={isSubmitting}
                  />
                </motion.div>
              )}

              {step === "otp" && (
                <motion.div
                  key="otp"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <OtpStep
                    phone={getValues("phone")}
                    onBack={() => {
                      if (otpPurpose === "login") {
                        setStep("user_info");
                      } else {
                        setStep("shipping");
                      }
                    }}
                    onSubmit={handleOtpVerifyAndSubmit}
                    isSubmitting={isSubmitting}
                    finalPrice={finalPrice}
                  />
                </motion.div>
              )}

              {step === "success" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <SuccessStep
                    firstName={getValues("firstName")}
                    lastName={getValues("lastName")}
                    phone={getValues("phone")}
                    selectedWeight={selectedWeight}
                    quantity={quantity}
                    finalPrice={finalPrice}
                    trackingCode={fakeTrackingCode}
                    onClose={() => {
                      closeCheckout();
                      setTimeout(handleReset, 300);
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </FormProvider>

          {errorMessage && (
            <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl mt-4">
              {errorMessage}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
