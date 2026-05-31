"use client";

import React, { useState } from "react";
import { ShoppingBag, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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

interface CheckoutDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  activeVariant: any;
  selectedWeight: number;
  quantity: number;
  finalPrice: number;
}

type Step = "user_info" | "shipping" | "otp" | "success";

export default function CheckoutDialog({
  isOpen,
  onOpenChange,
  activeVariant,
  selectedWeight,
  quantity,
  finalPrice,
}: CheckoutDialogProps) {
  const [step, setStep] = useState<Step>("user_info");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fakeTrackingCode, setFakeTrackingCode] = useState("");

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

  const { trigger, getValues, reset } = methods;

  const handleReset = () => {
    setStep("user_info");
    setErrorMessage(null);
    reset();
  };

  const handleNextToShipping = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = await trigger(["firstName", "lastName", "phone"]);
    if (isValid) {
      setErrorMessage(null);
      setStep("shipping");
    }
  };

  const handleNextToOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = await trigger(["shippingAddress"]);
    if (isValid) {
      setErrorMessage(null);
      setStep("otp");
    }
  };

  const handleVerifyOtpAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = await trigger(["otp"]);
    if (!isValid) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    const values = getValues();

    try {
      const result = await submitOrderAction({
        productId: "prod_coffee_bulk_01",
        weightGrams: selectedWeight,
        quantity: quantity,
        grindType: activeVariant.grind_type,
        finalPrice: finalPrice,
        customerName: `${values.firstName} ${values.lastName}`,
        customerPhone: values.phone,
        customerAddress: values.shippingAddress,
      });

      if (!result.success || !result.data) {
        throw new Error(result.error || "خطایی در ثبت نهایی سفارش رخ داد.");
      }

      setFakeTrackingCode(result.data.id);
      setStep("success");
    } catch (err: any) {
      setErrorMessage(err.message || "خطایی رخ داد. مجدداً تلاش فرمایید.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) {
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
                if (step === "otp") setStep("shipping");
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
                    onSubmit={handleNextToShipping}
                    finalPrice={finalPrice}
                    onClose={() => onOpenChange(false)}
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
                    onSubmit={handleNextToOtp}
                    onBack={() => setStep("user_info")}
                    finalPrice={finalPrice}
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
                    onBack={() => setStep("shipping")}
                    onSubmit={handleVerifyOtpAndSubmit}
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
                      onOpenChange(false);
                      setTimeout(handleReset, 300);
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </FormProvider>

          {errorMessage &&
            step !== "user_info" &&
            step !== "shipping" &&
            step !== "otp" && (
              <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl mt-4">
                {errorMessage}
              </div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
