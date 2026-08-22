"use client";

import React from "react";
import { User, Phone, KeyRound } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { CheckoutFormValues } from "@/domain/validations/order.schema";
import { toEnglishDigits } from "@/lib/utils";
import OrderSummaryCard from "@/components/features/checkout/components/OrderSummaryCard";
import { useSiteContent } from "@/context/ContentContext";

interface UserInfoStepProps {
  onSubmit: (e: React.FormEvent) => void;
  finalPrice: number;
  onClose: () => void;
  isLoginMode: boolean;
  onToggleLoginMode: () => void;
  isCheckingPhone?: boolean;
  summaryData?: {
    blend: string;
    grind: string;
    weightGrams: number;
    quantity: number;
  } | null;
}

export default function UserInfoStep({
  onSubmit,
  finalPrice,
  onClose,
  isLoginMode,
  onToggleLoginMode,
  isCheckingPhone,
  summaryData,
}: UserInfoStepProps) {
  const { checkout } = useSiteContent();
  const {
    register,
    formState: { errors },
  } = useFormContext<CheckoutFormValues>();

  const phoneRegister = register("phone");

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {summaryData && (
        <OrderSummaryCard
          blend={summaryData.blend}
          grind={summaryData.grind}
          weightGrams={summaryData.weightGrams}
          quantity={summaryData.quantity}
        />
      )}

      {isLoginMode ? (
        <div className="space-y-4">
          <div className="text-center p-3 bg-stone-950/40 border border-stone-850 rounded-xl space-y-1">
            <p className="text-xs text-stone-300 font-bold">
              {checkout.quickLoginBoxTitle}
            </p>
            <p className="text-[10px] text-stone-400">
              {checkout.quickLoginBoxDesc}
            </p>
          </div>
          <div className="space-y-1.5 text-right">
            <label className="text-xs font-bold text-stone-300 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-stone-500" />
              {checkout.phoneLabel} <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              {...phoneRegister}
              onChange={(e) => {
                e.target.value = toEnglishDigits(e.target.value);
                phoneRegister.onChange(e);
              }}
              className={`w-full bg-stone-950 border focus:ring-1 rounded-xl px-3 py-2.5 text-sm text-stone-100 outline-none transition-all text-left tracking-wider ${
                errors.phone
                  ? "border-destructive/60 focus:border-destructive focus:ring-destructive/30"
                  : "border-stone-800/80 focus:border-gold-500 focus:ring-gold-500"
              }`}
              dir="ltr"
              placeholder={checkout.phonePlaceholder}
            />
            {errors.phone && (
              <p className="text-[10px] text-destructive font-bold mt-1">
                {errors.phone.message}
              </p>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3.5">
            <div className="space-y-1.5 text-right">
              <label className="text-xs font-bold text-stone-300 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-stone-500" />
                {checkout.firstNameLabel}{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("firstName")}
                className={`w-full bg-stone-950 border focus:ring-1 rounded-xl px-3 py-2.5 text-sm text-stone-100 outline-none transition-all ${
                  errors.firstName
                    ? "border-destructive/60 focus:border-destructive focus:ring-destructive/30"
                    : "border-stone-800/80 focus:border-gold-500 focus:ring-gold-500"
                }`}
                placeholder={checkout.firstNamePlaceholder}
              />
              {errors.firstName && (
                <p className="text-[10px] text-destructive font-bold mt-1">
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5 text-right">
              <label className="text-xs font-bold text-stone-300 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-stone-500" />
                {checkout.lastNameLabel} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("lastName")}
                className={`w-full bg-stone-950 border focus:ring-1 rounded-xl px-3 py-2.5 text-sm text-stone-100 outline-none transition-all ${
                  errors.lastName
                    ? "border-destructive/60 focus:border-destructive focus:ring-destructive/30"
                    : "border-stone-800/80 focus:border-gold-500 focus:ring-gold-500"
                }`}
                placeholder={checkout.lastNamePlaceholder}
              />
              {errors.lastName && (
                <p className="text-[10px] text-destructive font-bold mt-1">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5 text-right">
            <label className="text-xs font-bold text-stone-300 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-stone-500" />
              {checkout.phoneLabel} <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              {...phoneRegister}
              onChange={(e) => {
                e.target.value = toEnglishDigits(e.target.value);
                phoneRegister.onChange(e);
              }}
              className={`w-full bg-stone-950 border focus:ring-1 rounded-xl px-3 py-2.5 text-sm text-stone-100 outline-none transition-all text-left tracking-wider ${
                errors.phone
                  ? "border-destructive/60 focus:border-destructive focus:ring-destructive/30"
                  : "border-stone-800/80 focus:border-gold-500 focus:ring-gold-500"
              }`}
              dir="ltr"
              placeholder={checkout.phonePlaceholder}
            />
            {errors.phone && (
              <p className="text-[10px] text-destructive font-bold mt-1">
                {errors.phone.message}
              </p>
            )}
          </div>
        </>
      )}

      <div className="text-center pt-1">
        <button
          type="button"
          onClick={onToggleLoginMode}
          className="text-xs text-gold-500 hover:text-gold-400 font-bold transition-all focus:outline-none cursor-pointer flex items-center justify-center gap-1 mx-auto"
        >
          <KeyRound className="w-3.5 h-3.5" />
          {isLoginMode
            ? checkout.switchToRegisterText
            : checkout.switchToLoginText}
        </button>
      </div>

      <div className="border-t border-stone-850 pt-4 mt-4 flex justify-between items-center">
        <div className="text-right">
          <span className="text-[10px] text-stone-500 block font-bold">
            {checkout.totalInvoiceAmountLabel}
          </span>
          <span className="text-sm font-black text-gold-500 font-sans">
            {finalPrice.toLocaleString()} تومان
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-200 cursor-pointer text-xs"
          >
            {checkout.cancelButton}
          </Button>
          <Button
            type="submit"
            disabled={isCheckingPhone}
            className="bg-gold-500 hover:bg-gold-600 text-stone-950 font-bold px-5 py-2.5 rounded-xl cursor-pointer text-xs"
          >
            {isCheckingPhone
              ? checkout.checkingButton
              : checkout.nextStepButton}
          </Button>
        </div>
      </div>
    </form>
  );
}
