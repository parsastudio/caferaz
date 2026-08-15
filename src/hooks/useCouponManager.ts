"use client";

import { useState, useEffect, useCallback } from "react";
import { validateCouponAction } from "@/actions/validate-coupon";
import { toEnglishDigits } from "@/lib/utils";

interface UseCouponManagerProps {
  productId: string;
  selectedWeight: number;
  quantity: number;
  selectedBlend: string;
  baseFinalPrice: number;
  baseDirectDiscount: number;
  baseConditionalDiscount: number;
  phone: string;
}

export function useCouponManager({
  productId,
  selectedWeight,
  quantity,
  selectedBlend,
  baseFinalPrice,
  baseDirectDiscount,
  baseConditionalDiscount,
  phone,
}: UseCouponManagerProps) {
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [lastValidatedPhone, setLastValidatedPhone] = useState("");

  const [checkoutFinalPrice, setCheckoutFinalPrice] = useState(baseFinalPrice);
  const [directDiscountAmount, setDirectDiscountAmount] =
    useState(baseDirectDiscount);
  const [conditionalDiscountAmount, setConditionalDiscountAmount] = useState(
    baseConditionalDiscount,
  );

  const handleRemoveCoupon = useCallback(() => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError(null);
    setCheckoutFinalPrice(baseFinalPrice);
    setDirectDiscountAmount(baseDirectDiscount);
    setConditionalDiscountAmount(baseConditionalDiscount);
    setLastValidatedPhone("");
  }, [baseFinalPrice, baseDirectDiscount, baseConditionalDiscount]);

  useEffect(() => {
    if (appliedCoupon) {
      const cleanPhone = toEnglishDigits(phone.trim());
      const isValid = /^09[0-9]{9}$/.test(cleanPhone);
      if (isValid && cleanPhone !== lastValidatedPhone) {
        const timer = setTimeout(() => {
          handleRemoveCoupon();
        }, 0);
        return () => clearTimeout(timer);
      }
    }
  }, [phone, appliedCoupon, lastValidatedPhone, handleRemoveCoupon]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    setCouponError(null);

    const cleanPhone = toEnglishDigits(phone.trim());

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

  const resetCouponState = useCallback(
    (nextFinalPrice: number, nextDirect: number, nextConditional: number) => {
      setAppliedCoupon(null);
      setCouponCode("");
      setCouponError(null);
      setCheckoutFinalPrice(nextFinalPrice);
      setDirectDiscountAmount(nextDirect);
      setConditionalDiscountAmount(nextConditional);
      setLastValidatedPhone("");
    },
    [],
  );

  return {
    couponCode,
    setCouponCode,
    appliedCoupon,
    couponError,
    isApplyingCoupon,
    checkoutFinalPrice,
    directDiscountAmount,
    conditionalDiscountAmount,
    handleApplyCoupon,
    handleRemoveCoupon,
    resetCouponState,
  };
}
