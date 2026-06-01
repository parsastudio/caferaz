"use client";

import React from "react";
import { User, Phone, KeyRound } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { Button } from "../ui/button";
import { CheckoutFormValues } from "./schema";

interface UserInfoStepProps {
  onSubmit: (e: React.FormEvent) => void;
  finalPrice: number;
  onClose: () => void;
  isLoginMode: boolean;
  onToggleLoginMode: () => void;
  isCheckingPhone?: boolean;
}

export default function UserInfoStep({
  onSubmit,
  finalPrice,
  onClose,
  isLoginMode,
  onToggleLoginMode,
  isCheckingPhone,
}: UserInfoStepProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext<CheckoutFormValues>();

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {isLoginMode ? (
        <div className="space-y-4">
          <div className="text-center p-3 bg-stone-950/40 border border-stone-850 rounded-xl space-y-1">
            <p className="text-xs text-stone-300 font-bold">
              ورود سریع به حساب کاربری
            </p>
            <p className="text-[10px] text-stone-400">
              کافیست شماره همراه خود را برای ورود سریع وارد کنید.
            </p>
          </div>
          <div className="space-y-1.5 text-right">
            <label className="text-xs font-bold text-stone-300 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-stone-500" />
              شماره موبایل <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              {...register("phone")}
              className={`w-full bg-stone-950 border focus:ring-1 rounded-xl px-3 py-2.5 text-sm text-stone-100 outline-none transition-all text-left tracking-wider ${
                errors.phone
                  ? "border-destructive/60 focus:border-destructive focus:ring-destructive/30"
                  : "border-stone-800/80 focus:border-gold-500 focus:ring-gold-500"
              }`}
              dir="ltr"
              placeholder="09123456789"
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
                نام <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("firstName")}
                className={`w-full bg-stone-950 border focus:ring-1 rounded-xl px-3 py-2.5 text-sm text-stone-100 outline-none transition-all ${
                  errors.firstName
                    ? "border-destructive/60 focus:border-destructive focus:ring-destructive/30"
                    : "border-stone-800/80 focus:border-gold-500 focus:ring-gold-500"
                }`}
                placeholder="مثال: رضا"
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
                نام خانوادگی <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("lastName")}
                className={`w-full bg-stone-950 border focus:ring-1 rounded-xl px-3 py-2.5 text-sm text-stone-100 outline-none transition-all ${
                  errors.lastName
                    ? "border-destructive/60 focus:border-destructive focus:ring-destructive/30"
                    : "border-stone-800/80 focus:border-gold-500 focus:ring-gold-500"
                }`}
                placeholder="مثال: کریمی"
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
              شماره موبایل <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              {...register("phone")}
              className={`w-full bg-stone-950 border focus:ring-1 rounded-xl px-3 py-2.5 text-sm text-stone-100 outline-none transition-all text-left tracking-wider ${
                errors.phone
                  ? "border-destructive/60 focus:border-destructive focus:ring-destructive/30"
                  : "border-stone-800/80 focus:border-gold-500 focus:ring-gold-500"
              }`}
              dir="ltr"
              placeholder="09123456789"
            />
            {errors.phone && (
              <p className="text-[10px] text-destructive font-bold mt-1">
                {errors.phone.message}
              </p>
            )}
          </div>
        </>
      )}

      <div className="text-center pt-2">
        <button
          type="button"
          onClick={onToggleLoginMode}
          className="text-xs text-gold-500 hover:text-gold-400 font-bold transition-all focus:outline-none cursor-pointer flex items-center justify-center gap-1 mx-auto"
        >
          <KeyRound className="w-3.5 h-3.5" />
          {isLoginMode
            ? "ایجاد حساب کاربری جدید (ثبت‌نام)"
            : "از قبل اکانت دارید؟ برای ورود سریع کلیک کنید"}
        </button>
      </div>

      <div className="border-t border-stone-850 pt-4 mt-4 flex justify-between items-center">
        <div className="text-right">
          <span className="text-[10px] text-stone-500 block font-bold">
            مبلغ کل فاکتور:
          </span>
          <span className="text-sm font-black text-gold-500">
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
            انصراف
          </Button>
          <Button
            type="submit"
            disabled={isCheckingPhone}
            className="bg-gold-500 hover:bg-gold-600 text-stone-950 font-bold px-5 py-2.5 rounded-xl cursor-pointer"
          >
            {isCheckingPhone ? "بررسی..." : "مرحله بعد"}
          </Button>
        </div>
      </div>
    </form>
  );
}
