"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Check,
  Truck,
  Loader2,
  Ticket,
  Bike,
  Mail,
  CreditCard,
  Banknote,
  Building2,
} from "lucide-react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { CheckoutFormValues } from "@/domain/validations/order.schema";
import { toEnglishDigits } from "@/lib/utils";
import { useSiteContent } from "@/context/ContentContext";

interface ShippingStepProps {
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
  basePrice: number;
  directDiscountAmount: number;
  conditionalDiscountAmount: number;
  finalPrice: number;
  payableFinalPrice: number;
  tehranDeliveryFee: number;
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
  payableFinalPrice,
  tehranDeliveryFee,
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
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<CheckoutFormValues>();

  const destination = watch("destination") || "tehran";
  const tehranZone = watch("tehranZone") || "piroozi";
  const paymentMethod = watch("paymentMethod") || "cod";

  const handleDestinationChange = (dest: "tehran" | "other") => {
    setValue("destination", dest, { shouldValidate: true });
    if (dest === "other") {
      setValue("paymentMethod", "online", { shouldValidate: true });
    } else {
      setValue("paymentMethod", "cod", { shouldValidate: true });
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3.5 text-right">
      {/* مرحله ۱: انتخاب موقعیت تحویل */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 text-gold-500" />
          محدوده تحویل سفارش: <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleDestinationChange("tehran")}
            className={`p-2.5 sm:p-3 rounded-2xl border text-right transition-all cursor-pointer flex items-center justify-between gap-1.5 select-none ${
              destination === "tehran"
                ? "border-gold-500 bg-gold-500/10 text-gold-400 shadow-md ring-1 ring-gold-500/30"
                : "border-stone-800 bg-stone-950/60 hover:border-stone-700 text-stone-400 hover:text-stone-200"
            }`}
          >
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  destination === "tehran"
                    ? "bg-gold-500 text-stone-950"
                    : "bg-stone-900 text-stone-400"
                }`}
              >
                <Bike className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-black text-stone-100 block">
                  داخل تهران
                </span>
                <span className="text-[10px] text-stone-400 block mt-0.5">
                  تحویل سریع پیک
                </span>
              </div>
            </div>
            <div
              className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                destination === "tehran"
                  ? "border-gold-500 bg-gold-500"
                  : "border-stone-700"
              }`}
            >
              {destination === "tehran" && (
                <div className="w-1.5 h-1.5 rounded-full bg-stone-950" />
              )}
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleDestinationChange("other")}
            className={`p-2.5 sm:p-3 rounded-2xl border text-right transition-all cursor-pointer flex items-center justify-between gap-1.5 select-none ${
              destination === "other"
                ? "border-gold-500 bg-gold-500/10 text-gold-400 shadow-md ring-1 ring-gold-500/30"
                : "border-stone-800 bg-stone-950/60 hover:border-stone-700 text-stone-400 hover:text-stone-200"
            }`}
          >
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  destination === "other"
                    ? "bg-gold-500 text-stone-950"
                    : "bg-stone-900 text-stone-400"
                }`}
              >
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-black text-stone-100 block">
                  سایر شهرها
                </span>
                <span className="text-[10px] text-stone-400 block mt-0.5">
                  ارسال اداره پست
                </span>
              </div>
            </div>
            <div
              className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                destination === "other"
                  ? "border-gold-500 bg-gold-500"
                  : "border-stone-700"
              }`}
            >
              {destination === "other" && (
                <div className="w-1.5 h-1.5 rounded-full bg-stone-950" />
              )}
            </div>
          </button>
        </div>
      </div>

      {/* انتخاب منطقه در تهران (پیروزی و حکیمیه رایگان / سایر مناطق با نرخ پیک) */}
      {destination === "tehran" && (
        <div className="space-y-1.5 animate-in fade-in duration-200">
          <label className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-gold-500" />
            منطقه تحویل در تهران: <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() =>
                setValue("tehranZone", "piroozi", { shouldValidate: true })
              }
              className={`p-2 sm:p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 select-none ${
                tehranZone === "piroozi"
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-md ring-1 ring-emerald-500/30"
                  : "border-stone-800 bg-stone-950/60 hover:border-stone-700 text-stone-400 hover:text-stone-200"
              }`}
            >
              <span className="text-xs font-black text-stone-100 block">
                پیروزی
              </span>
              <span className="text-[10px] text-emerald-400 font-bold block">
                ارسال رایگان 🎉
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                setValue("tehranZone", "hakimieh", { shouldValidate: true })
              }
              className={`p-2 sm:p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 select-none ${
                tehranZone === "hakimieh"
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-md ring-1 ring-emerald-500/30"
                  : "border-stone-800 bg-stone-950/60 hover:border-stone-700 text-stone-400 hover:text-stone-200"
              }`}
            >
              <span className="text-xs font-black text-stone-100 block">
                حکیمیه
              </span>
              <span className="text-[10px] text-emerald-400 font-bold block">
                ارسال رایگان 🎉
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                setValue("tehranZone", "other_tehran", {
                  shouldValidate: true,
                })
              }
              className={`p-2 sm:p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 select-none ${
                tehranZone === "other_tehran"
                  ? "border-gold-500 bg-gold-500/10 text-gold-400 shadow-md ring-1 ring-gold-500/30"
                  : "border-stone-800 bg-stone-950/60 hover:border-stone-700 text-stone-400 hover:text-stone-200"
              }`}
            >
              <span className="text-xs font-black text-stone-100 block">
                سایر مناطق
              </span>
              <span className="text-[10px] text-stone-300 font-sans block font-bold">
                {tehranDeliveryFee.toLocaleString()} ت
              </span>
            </button>
          </div>
        </div>
      )}

      {/* آدرس محل تحویل */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-stone-300 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-stone-500" />
          {checkout.shippingAddressLabel}{" "}
          <span className="text-red-500">*</span>
        </label>
        <textarea
          {...register("shippingAddress")}
          rows={2}
          className={`w-full bg-stone-950 border focus:ring-1 rounded-xl px-3 py-2 text-xs sm:text-sm text-stone-100 outline-none transition-all resize-none leading-relaxed text-right ${
            errors.shippingAddress
              ? "border-destructive/60 focus:border-destructive focus:ring-destructive/30"
              : "border-stone-800/80 focus:border-gold-500 focus:ring-gold-500"
          }`}
          placeholder={
            destination === "tehran"
              ? "تهران، منطقه/محله، خیابان، کوچه، پلاک، واحد..."
              : "استان، شهر، خیابان، کوچه، پلاک، واحد..."
          }
        />
        {errors.shippingAddress && (
          <p className="text-[10px] text-destructive font-bold">
            {errors.shippingAddress.message}
          </p>
        )}
      </div>

      {/* کد پستی اختصاصی برای ارسال اداره پست با انیمیشن ورود/خروج نرم جهت جلوگیری از پرش ارتفاع */}
      <AnimatePresence initial={false}>
        {destination === "other" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden space-y-1"
          >
            <label className="text-xs font-bold text-stone-300 flex items-center gap-1 pt-0.5">
              <Mail className="w-3.5 h-3.5 text-gold-500" />
              کد پستی ۱۰ رقمی:
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={10}
              {...register("postalCode")}
              onChange={(e) => {
                e.target.value = toEnglishDigits(e.target.value).replace(
                  /[^0-9]/g,
                  "",
                );
                register("postalCode").onChange(e);
              }}
              placeholder="مثال: ۱۲۳۴۵۶۷۸۹۰"
              className="w-full bg-stone-950 border border-stone-800 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 rounded-xl px-3.5 py-2 text-xs text-stone-100 outline-none text-left font-sans tracking-widest"
              dir="ltr"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* انتخاب شیوه پرداخت */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-stone-300 block">
          {checkout.paymentMethodLabel}:
        </label>

        {destination === "other" ? (
          /* برای سایر شهرها فقط پرداخت آنلاین نمایش داده می‌شود با ارتفاع یکسان */
          <div className="w-full bg-stone-950 border border-gold-500/30 bg-gold-500/5 rounded-2xl p-2.5 sm:p-3 flex items-center justify-between min-h-[50px] transition-all">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gold-500/10 text-gold-500 flex items-center justify-center shrink-0">
                <CreditCard className="w-4 h-4" />
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-gold-400 block">
                  پرداخت آنلاین اینترنتی
                </span>
                <span className="text-[10px] text-stone-400 block mt-0.5">
                  ارسال با پست پیشتاز اداره پست با تسویه فوری شتاب
                </span>
              </div>
            </div>
            <div className="w-4 h-4 rounded-full bg-gold-500 flex items-center justify-center shrink-0">
              <Check className="w-2.5 h-2.5 text-stone-950 stroke-[3]" />
            </div>
          </div>
        ) : (
          /* برای داخل تهران هر دو حالت پرداخت در محل و پرداخت آنلاین فعال است */
          <div className="grid grid-cols-2 gap-2 min-h-[50px]">
            <button
              type="button"
              onClick={() =>
                setValue("paymentMethod", "cod", { shouldValidate: true })
              }
              className={`p-2.5 rounded-2xl border text-right transition-all cursor-pointer flex items-center justify-between select-none ${
                paymentMethod === "cod"
                  ? "border-gold-500 bg-gold-500/10 text-gold-400 shadow-md ring-1 ring-gold-500/30"
                  : "border-stone-800 bg-stone-950/60 hover:border-stone-700 text-stone-400 hover:text-stone-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <Banknote className="w-4 h-4 text-gold-500 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-stone-200 block truncate">
                    {checkout.codPaymentTitle}
                  </span>
                  <span className="text-[10px] text-stone-400 block mt-0.5 truncate">
                    هنگام تحویل پیک
                  </span>
                </div>
              </div>
              <div
                className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                  paymentMethod === "cod"
                    ? "border-gold-500 bg-gold-500"
                    : "border-stone-700"
                }`}
              >
                {paymentMethod === "cod" && (
                  <div className="w-1.5 h-1.5 rounded-full bg-stone-950" />
                )}
              </div>
            </button>

            <button
              type="button"
              onClick={() =>
                setValue("paymentMethod", "online", { shouldValidate: true })
              }
              className={`p-2.5 rounded-2xl border text-right transition-all cursor-pointer flex items-center justify-between select-none ${
                paymentMethod === "online"
                  ? "border-gold-500 bg-gold-500/10 text-gold-400 shadow-md ring-1 ring-gold-500/30"
                  : "border-stone-800 bg-stone-950/60 hover:border-stone-700 text-stone-400 hover:text-stone-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-gold-500 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-stone-200 block truncate">
                    پرداخت آنلاین
                  </span>
                  <span className="text-[10px] text-stone-400 block mt-0.5 truncate">
                    کارت‌های شتاب
                  </span>
                </div>
              </div>
              <div
                className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                  paymentMethod === "online"
                    ? "border-gold-500 bg-gold-500"
                    : "border-stone-700"
                }`}
              >
                {paymentMethod === "online" && (
                  <div className="w-1.5 h-1.5 rounded-full bg-stone-950" />
                )}
              </div>
            </button>
          </div>
        )}
      </div>

      {/* بخش کوپن تخفیف به صورت کامپکت */}
      <div className="space-y-1.5 border-t border-stone-800/60 pt-3">
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
            className="flex-1 bg-stone-950 border border-stone-800 focus:border-gold-500 focus:ring-1 rounded-xl px-3 py-2 text-xs sm:text-sm text-stone-100 outline-none text-left font-sans font-bold tracking-wider"
            dir="ltr"
          />
          {appliedCoupon ? (
            <Button
              type="button"
              variant="destructive"
              onClick={handleRemoveCoupon}
              className="rounded-xl px-3.5 text-xs font-bold shrink-0 cursor-pointer h-9"
            >
              {checkout.removeCouponButton}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleApplyCoupon}
              disabled={isApplyingCoupon || !couponCode.trim()}
              className="bg-gold-500 hover:bg-gold-600 text-stone-950 font-bold rounded-xl px-4 text-xs shrink-0 cursor-pointer h-9"
            >
              {isApplyingCoupon
                ? checkout.applyingCouponButton
                : checkout.applyCouponButton}
            </Button>
          )}
        </div>
        {couponError && (
          <p className="text-[10px] text-destructive font-bold">
            {couponError}
          </p>
        )}
        {appliedCoupon && (
          <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
            ✓ {checkout.couponSuccessPrefix}{" "}
            {appliedCoupon.discountAmount.toLocaleString()} تومان.
          </p>
        )}
      </div>

      {/* خلاصه فاکتور سفارش کامپکت */}
      <div className="bg-stone-950/40 border border-stone-850 p-3 sm:p-3.5 rounded-2xl space-y-2 text-right">
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
          <div className="flex justify-between items-center text-xs">
            <span className="text-stone-400">{checkout.shippingCostLabel}</span>
            {destination === "other" ? (
              <span className="text-amber-400 font-bold text-[10px] sm:text-[11px] bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                پس‌پرداخت (بر اساس نرخ شرکت پست)
              </span>
            ) : tehranZone === "other_tehran" ? (
              <span className="font-sans font-bold text-stone-200">
                {tehranDeliveryFee.toLocaleString()} تومان
              </span>
            ) : (
              <span className="font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                رایگان
              </span>
            )}
          </div>
          <div className="border-t border-stone-800/80 pt-2 flex justify-between items-center text-gold-500 font-black text-sm">
            <span>{checkout.finalPayableLabel}</span>
            <span className="font-sans">
              {payableFinalPrice.toLocaleString()} تومان
            </span>
          </div>
        </div>
      </div>

      {/* نوار دکمه‌های اقدام نهایی همیشه در دسترس */}
      <div className="border-t border-stone-800/80 pt-3 mt-4 flex justify-between items-center">
        <div className="text-right">
          <span className="text-[10px] text-stone-500 block font-bold">
            {checkout.payableAmountPrefix}
          </span>
          <span className="text-sm font-black text-gold-500 font-sans">
            {payableFinalPrice.toLocaleString()} تومان
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
