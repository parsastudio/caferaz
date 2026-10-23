"use client";

import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { CheckoutFormValues } from "@/domain/validations/order.schema";
import { submitOrderAction } from "@/actions/checkout";
import { normalizePhone } from "@/lib/phone";
import { CheckoutData } from "@/context/CheckoutContext";

interface UseCheckoutSubmitProps {
  methods: UseFormReturn<CheckoutFormValues>;
  checkoutData: CheckoutData | null;
  appliedCouponCode?: string | null;
  tehranDeliveryFee?: number;
  setErrorMessage: (msg: string | null) => void;
  onSuccess: () => void;
}

export function useCheckoutSubmit({
  methods,
  checkoutData,
  appliedCouponCode,
  tehranDeliveryFee = 70000,
  setErrorMessage,
  onSuccess,
}: UseCheckoutSubmitProps) {
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [fakeTrackingCode, setFakeTrackingCode] = useState("");

  const executeOrderSubmission = async (otpCode?: string) => {
    setIsSubmittingOrder(true);
    setErrorMessage(null);
    const values = methods.getValues();
    const cleanPhone = normalizePhone(values.phone);
    const fullName =
      `${values.firstName || ""} ${values.lastName || ""}`.trim() ||
      "کاربر کافه راز";

    let customerAddress = values.shippingAddress.trim();
    if (values.destination === "other") {
      const postalText = values.postalCode?.trim()
        ? ` | کد پستی: ${values.postalCode.trim()}`
        : "";
      customerAddress = `[ارسال با اداره پست (کرایه پس‌پرداخت پست) | پرداخت آنلاین] ${customerAddress}${postalText}`;
    } else {
      const zoneLabel =
        values.tehranZone === "piroozi"
          ? "پیروزی (ارسال رایگان)"
          : values.tehranZone === "hakimieh"
            ? "حکیمیه (ارسال رایگان)"
            : `سایر مناطق (کرایه پیک: ${tehranDeliveryFee.toLocaleString()} ت)`;
      const payLabel =
        values.paymentMethod === "online" ? "پرداخت آنلاین" : "پرداخت در محل";
      customerAddress = `[تحویل پیک تهران - ${zoneLabel} | ${payLabel}] ${customerAddress}`;
    }

    try {
      const result = await submitOrderAction({
        productId: checkoutData?.productId ?? "",
        weightGrams: checkoutData?.selectedWeight ?? 0,
        quantity: checkoutData?.quantity ?? 1,
        blend: checkoutData?.selectedBlend ?? "",
        grind: checkoutData?.selectedGrind ?? "",
        customerName: fullName,
        customerPhone: cleanPhone,
        customerAddress,
        destination: values.destination,
        tehranZone: values.tehranZone,
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
    executeOrderSubmission,
  };
}
