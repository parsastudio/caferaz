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
    checkoutData,
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
    payableFinalPrice,
    tehranDeliveryFee,
    currentShippingFee,
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
    roastInfo: checkoutData?.roastInfo ?? null,
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
        className="sm:max-w-lg md:max-w-xl max-h-[92dvh] sm:max-h-[88dvh] bg-stone-900 border border-stone-800/90 text-stone-100 p-0 rounded-2xl text-right flex flex-col overflow-hidden shadow-2xl shadow-black/90 ring-1 ring-white/5 transition-all duration-200"
        showCloseButton={false}
      >
        <CheckoutDialogHeader step={step} onBack={handleHeaderBack} />

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 overflow-x-hidden scrollbar-thin scrollbar-thumb-stone-800 scrollbar-track-transparent">
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
                    payableFinalPrice={payableFinalPrice}
                    tehranDeliveryFee={tehranDeliveryFee}
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
                    finalPrice={payableFinalPrice}
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
                    finalPrice={payableFinalPrice}
                    trackingCode={fakeTrackingCode}
                    paymentMethod={methods.getValues("paymentMethod")}
                    destination={methods.getValues("destination")}
                    tehranZone={methods.getValues("tehranZone")}
                    onClose={handleClose}
                    roastInfo={checkoutData?.roastInfo ?? null}
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
