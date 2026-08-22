"use client";

import React from "react";
import { ShoppingBag, ArrowLeft } from "lucide-react";
import { DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Step } from "@/hooks/useCheckoutForm";
import { useSiteContent } from "@/context/ContentContext";

interface CheckoutDialogHeaderProps {
  step: Step;
  onBack: () => void;
}

export default function CheckoutDialogHeader({
  step,
  onBack,
}: CheckoutDialogHeaderProps) {
  const { checkout } = useSiteContent();

  return (
    <div className="p-6 md:p-8 pb-4 md:pb-5 border-b border-stone-800/80 bg-stone-950/20 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/20 text-gold-500 flex items-center justify-center">
          <ShoppingBag className="w-5 h-5" />
        </div>
        <div>
          <DialogTitle className="text-base md:text-lg font-black text-stone-100">
            {step === "success"
              ? checkout.modalSuccessTitle
              : checkout.modalTitle}
          </DialogTitle>
          <DialogDescription className="text-[11px] md:text-xs text-stone-400 mt-0.5">
            {step === "user_info" && checkout.userInfoStepDesc}
            {step === "shipping" && checkout.shippingStepDesc}
            {step === "otp" && checkout.otpStepDesc}
            {step === "success" && checkout.successStepDesc}
          </DialogDescription>
        </div>
      </div>

      {step !== "user_info" && step !== "success" && (
        <button
          onClick={onBack}
          className="text-stone-400 hover:text-stone-200 p-1.5 rounded-lg hover:bg-stone-800/40 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
