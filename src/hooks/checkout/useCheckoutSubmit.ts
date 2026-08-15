"use client";

import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { CheckoutFormValues } from "@/domain/validations/order.schema";
import { submitOrderAction } from "@/actions/order";
import { toEnglishDigits } from "@/lib/utils";
import { CheckoutData } from "@/context/CheckoutContext";

interface UseCheckoutSubmitProps {
  methods: UseFormReturn<CheckoutFormValues>;
  checkoutData: CheckoutData | null;
  appliedCouponCode?: string | null;
  setErrorMessage: (msg: string | null) => void;
  onSuccess: () => void;
}

export function useCheckoutSubmit({
  methods,
  checkoutData,
  appliedCouponCode,
  setErrorMessage,
  onSuccess,
}: UseCheckoutSubmitProps) {
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [fakeTrackingCode, setFakeTrackingCode] = useState("");

  const executeOrderSubmission = async (otpCode: string) => {
    setIsSubmittingOrder(true);
    setErrorMessage(null);
    const values = methods.getValues();
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
        appliedCouponCode: appliedCouponCode ?? null,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      setFakeTrackingCode(result.data.id);
      onSuccess();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "خطا در پردازش اطلاعات.",
      );
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  return {
    isSubmittingOrder,
    fakeTrackingCode,
    setFakeTrackingCode,
    executeOrderSubmission,
  };
}
