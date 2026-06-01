"use client";

import React from "react";
import { ShoppingBag, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FormProvider } from "react-hook-form";
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
import { useCheckoutForm } from "@/hooks/useCheckoutForm";

export default function CheckoutDialog() {
  const {
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
  } = useCheckoutForm();

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          handleClose();
        }
      }}
    >
      <DialogContent
        dir="rtl"
        className="sm:max-w-lg md:max-w-xl bg-stone-900 border border-stone-800 text-stone-100 p-0 overflow-hidden rounded-2xl text-right"
        showCloseButton={false}
      >
        <div className="p-6 md:p-8 pb-4 md:pb-5 border-b border-stone-800/80 bg-stone-950/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/20 text-gold-500 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base md:text-lg font-black text-stone-100">
                {step === "success"
                  ? "ثبت موفقیت‌آمیز سفارش"
                  : "ثبت نهایی سفارش خرید قهوه"}
              </DialogTitle>
              <DialogDescription className="text-[11px] md:text-xs text-stone-400 mt-0.5">
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

        <div className="p-6 md:p-8">
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
                    onClose={handleClose}
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
                    phone={methods.getValues("phone")}
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
                    firstName={methods.getValues("firstName")}
                    lastName={methods.getValues("lastName")}
                    phone={methods.getValues("phone")}
                    selectedWeight={selectedWeight}
                    quantity={quantity}
                    finalPrice={finalPrice}
                    trackingCode={fakeTrackingCode}
                    onClose={handleClose}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </FormProvider>

          {errorMessage && (
            <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl mt-4 animate-in fade-in duration-200">
              {errorMessage}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
