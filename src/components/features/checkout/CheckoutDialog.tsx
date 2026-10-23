"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FormProvider } from "react-hook-form";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import UserInfoStep from "./UserInfoStep";
import ShippingStep from "./ShippingStep";
import OtpStep from "./OtpStep";
import SuccessStep from "./SuccessStep";
import CheckoutDialogHeader from "./components/CheckoutDialogHeader";
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
    selectedBlend,
    selectedGrind,
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
    basePrice,
    directDiscountAmount,
    conditionalDiscountAmount,
    handleApplyCoupon,
    handleRemoveCoupon,
    formToken,
    honeypot,
  } = useCheckoutForm();

  const handleHeaderBack = () => {
    setErrorMessage(null);
    if (step === "shipping") setStep("user_info");
    if (step === "otp") {
      if (otpPurpose === "login") {
        setStep("user_info");
      } else {
        setStep("shipping");
      }
    }
  };

  const summaryData = {
    blend: selectedBlend,
    grind: selectedGrind,
    weightGrams: selectedWeight,
    quantity,
  };

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
        <CheckoutDialogHeader step={step} onBack={handleHeaderBack} />

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
                    finalPrice={checkoutFinalPrice}
                    onClose={handleClose}
                    isLoginMode={isLoginMode}
                    onToggleLoginMode={() => {
                      setErrorMessage(null);
                      setIsLoginMode(!isLoginMode);
                    }}
                    isCheckingPhone={isPending}
                    summaryData={summaryData}
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
                    basePrice={basePrice}
                    directDiscountAmount={directDiscountAmount}
                    conditionalDiscountAmount={conditionalDiscountAmount}
                    finalPrice={checkoutFinalPrice}
                    isLoggedIn={isLoggedInUser}
                    isSubmitting={isSubmitting}
                    couponCode={couponCode}
                    setCouponCode={setCouponCode}
                    appliedCoupon={appliedCoupon}
                    couponError={couponError}
                    isApplyingCoupon={isApplyingCoupon}
                    handleApplyCoupon={handleApplyCoupon}
                    handleRemoveCoupon={handleRemoveCoupon}
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
                    finalPrice={checkoutFinalPrice}
                    summaryData={summaryData}
                    formToken={formToken}
                    honeypot={honeypot}
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
                    finalPrice={checkoutFinalPrice}
                    trackingCode={fakeTrackingCode}
                    paymentMethod={methods.getValues("paymentMethod")}
                    destination={methods.getValues("destination")}
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
