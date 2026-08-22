"use client";

import React from "react";
import { MapPin, Check, Truck, Loader2, Ticket } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { CheckoutFormValues } from "@/domain/validations/order.schema";
import { useSiteContent } from "@/context/ContentContext";

interface ShippingStepProps {
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
  basePrice: number;
  directDiscountAmount: number;
  conditionalDiscountAmount: number;
  finalPrice: number;
  isLoggedIn?: boolean;
  isSubmitting?: boolean;
  couponCode: string;
  setCouponCode: (code: string) => void;
  appliedCoupon: { code: string; discountAmount: number } | null;
  couponError: string | null;
  isApplyingCoupon: boolean;
  handleApplyCoupon: () => void;
  handleRemoveCoupon: () => void;
}

export default function ShippingStep({
  onSubmit,
  onBack,
  basePrice,
  directDiscountAmount,
  conditionalDiscountAmount,
  finalPrice,
  isLoggedIn,
  isSubmitting,
  couponCode,
  setCouponCode,
  appliedCoupon,
  couponError,
  isApplyingCoupon,
  handleApplyCoupon,
  handleRemoveCoupon,
}: ShippingStepProps) {
  const { checkout } = useSiteContent();
  const {
    register,
    formState: { errors },
  } = useFormContext<CheckoutFormValues>();

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5 text-right">
        <label className="text-xs font-bold text-stone-300 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-stone-500" />
          {checkout.shippingAddressLabel}{" "}
          <span className="text-red-500">*</span>
        </label>
        <textarea
          {...register("shippingAddress")}
          rows={3}
          className={`w-full bg-stone-950 border focus:ring-1 rounded-xl px-3 py-2.5 text-sm text-stone-100 outline-none transition-all resize-none leading-relaxed text-right ${
            errors.shippingAddress
              ? "border-destructive/60 focus:border-destructive focus:ring-destructive/30"
              : "border-stone-800/80 focus:border-gold-500 focus:ring-gold-500"
          }`}
          placeholder={checkout.shippingAddressPlaceholder}
        />
        {errors.shippingAddress && (
          <p className="text-[10px] text-destructive font-bold mt-1">
            {errors.shippingAddress.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5 text-right">
        <label className="text-xs font-bold text-stone-300">
          {checkout.paymentMethodLabel}
        </label>
        <div className="w-full bg-stone-950 border border-gold-500/50 bg-gold-500/5 rounded-xl px-3 py-2.5 flex items-center justify-between">
          <span className="text-xs font-bold text-gold-400">
            {checkout.codPaymentTitle}
          </span>
          <div className="w-4 h-4 rounded-full bg-gold-500 flex items-center justify-center">
            <Check className="w-2.5 h-2.5 text-stone-950 stroke-[3]" />
          </div>
        </div>
      </div>

      <div className="space-y-2 text-right border-t border-stone-800/60 pt-4">
        <label className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
          <Ticket className="w-3.5 h-3.5 text-gold-500" />
          {checkout.couponPromptLabel}
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            placeholder={checkout.couponPlaceholder}
            disabled={!!appliedCoupon || isApplyingCoupon}
            className="flex-1 bg-stone-950 border border-stone-800 focus:border-gold-500 focus:ring-1 rounded-xl px-3.5 py-2.5 text-sm text-stone-100 outline-none text-left font-sans font-bold tracking-wider"
            dir="ltr"
          />
          {appliedCoupon ? (
            <Button
              type="button"
              variant="destructive"
              onClick={handleRemoveCoupon}
              className="rounded-xl px-4 text-xs font-bold shrink-0 cursor-pointer"
            >
              {checkout.removeCouponButton}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleApplyCoupon}
              disabled={isApplyingCoupon || !couponCode.trim()}
              className="bg-gold-500 hover:bg-gold-600 text-stone-950 font-bold rounded-xl px-5 text-xs shrink-0 cursor-pointer"
            >
              {isApplyingCoupon
                ? checkout.applyingCouponButton
                : checkout.applyCouponButton}
            </Button>
          )}
        </div>
        {couponError && (
          <p className="text-[10px] text-destructive font-bold mt-1">
            {couponError}
          </p>
        )}
        {appliedCoupon && (
          <p className="text-[10px] text-emerald-400 font-bold mt-1 flex items-center gap-1 animate-in fade-in duration-200">
            ✓ {checkout.couponSuccessPrefix}{" "}
            {appliedCoupon.discountAmount.toLocaleString()} تومان.
          </p>
        )}
      </div>

      <div className="bg-stone-950/40 border border-stone-850 p-4 rounded-xl space-y-2.5 text-right">
        <span className="text-[10px] text-stone-500 font-bold block">
          {checkout.breakdownTitle}
        </span>
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between items-center text-stone-400">
            <span>{checkout.basePriceLabel}</span>
            <span className="font-sans font-bold">
              {basePrice.toLocaleString()} تومان
            </span>
          </div>
          {directDiscountAmount > 0 && (
            <div className="flex justify-between items-center text-red-400">
              <span>{checkout.directDiscountLabel}</span>
              <span className="font-sans font-bold">
                -{directDiscountAmount.toLocaleString()} تومان
              </span>
            </div>
          )}
          {conditionalDiscountAmount > 0 && (
            <div className="flex justify-between items-center text-red-400">
              <span>{checkout.conditionalDiscountLabel}</span>
              <span className="font-sans font-bold">
                -{conditionalDiscountAmount.toLocaleString()} تومان
              </span>
            </div>
          )}
          {appliedCoupon && (
            <div className="flex justify-between items-center text-red-400">
              <span>
                {checkout.userCouponDiscountPrefix} ({appliedCoupon.code}):
              </span>
              <span className="font-sans font-bold">
                -{appliedCoupon.discountAmount.toLocaleString()} تومان
              </span>
            </div>
          )}
          <div className="flex justify-between items-center text-emerald-400">
            <span>{checkout.shippingCostLabel}</span>
            <span className="font-bold">{checkout.freeShippingValue}</span>
          </div>
          <div className="border-t border-stone-800/80 pt-2 flex justify-between items-center text-gold-500 font-black text-sm">
            <span>{checkout.finalPayableLabel}</span>
            <span className="font-sans">
              {finalPrice.toLocaleString()} تومان
            </span>
          </div>
        </div>
      </div>

      <div className="bg-stone-950/40 border border-stone-850 p-3 rounded-xl flex items-start gap-2.5 text-right">
        <Truck className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
        <p className="text-[11px] text-stone-400 leading-relaxed">
          {checkout.codTrustNotice}
        </p>
      </div>

      <div className="border-t border-stone-850 pt-4 mt-6 flex justify-between items-center">
        <div className="text-right">
          <span className="text-[10px] text-stone-500 block font-bold">
            {checkout.payableAmountPrefix}
          </span>
          <span className="text-sm font-black text-gold-500 font-sans">
            {finalPrice.toLocaleString()} تومان
          </span>
        </div>
        <div className="flex gap-2">
          {!isLoggedIn && (
            <Button
              type="button"
              variant="ghost"
              onClick={onBack}
              className="text-stone-400 hover:text-stone-200 cursor-pointer text-xs"
            >
              {checkout.backButton}
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-gold-500 hover:bg-gold-600 text-stone-950 font-bold px-5 py-2.5 rounded-xl cursor-pointer text-xs"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-4 h-4 animate-spin" />
                {checkout.submittingButton}
              </span>
            ) : isLoggedIn ? (
              checkout.completeOrderButton
            ) : (
              checkout.getOtpCodeButton
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
