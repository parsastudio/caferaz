"use client";

import React from "react";
import { useForm, Controller, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Sparkles, Scale, Calendar, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MOCK_PRODUCTS } from "@/lib/mock-db";
import {
  getTodayJalaliString,
  isValidJalaaliDate,
} from "@/lib/jalali-converter";

const schema = z
  .object({
    code: z.string().optional(),
    type: z.enum(["product_direct", "conditional", "user_code"]),
    discountType: z.enum(["percentage", "fixed"]),
    discountValue: z.number().min(1, "مقدار تخفیف باید بزرگتر از صفر باشد"),
    productId: z.string().optional(),
    minWeightGrams: z.number().optional(),
    validFrom: z
      .string()
      .optional()
      .refine(
        (val) => {
          if (!val || val.trim() === "") return true;
          const match = val.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
          if (!match) return false;
          const y = parseInt(match[1], 10);
          const m = parseInt(match[2], 10);
          const d = parseInt(match[3], 10);
          return isValidJalaaliDate(y, m, d);
        },
        {
          message:
            "مقدار روزهای ماه یا فرمت تاریخ شروع شمسی نامعتبر است (YYYY/MM/DD)",
        },
      ),
    validTo: z
      .string()
      .optional()
      .refine(
        (val) => {
          if (!val || val.trim() === "") return true;
          const match = val.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
          if (!match) return false;
          const y = parseInt(match[1], 10);
          const m = parseInt(match[2], 10);
          const d = parseInt(match[3], 10);
          return isValidJalaaliDate(y, m, d);
        },
        {
          message:
            "مقدار روزهای ماه یا فرمت تاریخ انقضا شمسی نامعتبر است (YYYY/MM/DD)",
        },
      ),
    maxDiscountAmount: z.number().optional(),
    allowStacking: z.boolean().optional().default(false),
  })
  .refine(
    (data) => {
      if (
        data.type === "user_code" &&
        (!data.code || data.code.trim().length < 2)
      ) {
        return false;
      }
      return true;
    },
    {
      message:
        "وارد کردن کد تخفیف برای کوپن‌های دستی کاربر الزامی است (حداقل ۲ کاراکتر)",
      path: ["code"],
    },
  );

export type CouponFormValues = {
  code?: string;
  type: "product_direct" | "conditional" | "user_code";
  discountType: "percentage" | "fixed";
  discountValue: number;
  productId?: string;
  minWeightGrams?: number;
  validFrom?: string;
  validTo?: string;
  maxDiscountAmount?: number;
  allowStacking?: boolean;
};

interface CouponCreateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CouponFormValues) => void;
  isPending: boolean;
}

export default function CouponCreateDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  isPending,
}: CouponCreateDialogProps) {
  const methods = useForm<CouponFormValues>({
    resolver: zodResolver(schema) as unknown as Resolver<CouponFormValues>,
    defaultValues: {
      code: "",
      type: "user_code",
      discountType: "percentage",
      discountValue: 10,
      productId: "prod_coffee_bulk_01",
      minWeightGrams: 0,
      validFrom: "",
      validTo: "",
      maxDiscountAmount: 0,
      allowStacking: false,
    },
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = methods;

  const currentType = watch("type");
  const currentDiscountType = watch("discountType");
  const todayShamsi = getTodayJalaliString();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        dir="rtl"
        className="sm:max-w-lg bg-stone-900 border border-stone-800 text-stone-100 p-6 md:p-8 rounded-2xl text-right animate-in fade-in duration-200"
      >
        <DialogHeader className="space-y-2 text-right">
          <DialogTitle className="text-lg font-bold text-gold-500 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            تعریف کد تخفیف جدید کلاینت یا سیستم
          </DialogTitle>
          <DialogDescription className="text-xs text-stone-400">
            پارامترها و قوانین کوپن را مشخص نمایید. فیلد تاریخ خالی به منزله
            بدون محدودیت تلقی می‌شود.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 mt-3"
          dir="rtl"
        >
          <div className="space-y-1 text-right">
            <label className="text-xs font-bold text-stone-300">
              کد کوپن (حروف انگلیسی و عدد){" "}
              {currentType === "user_code" && (
                <span className="text-red-500">*</span>
              )}
            </label>
            <input
              type="text"
              {...register("code")}
              className={`w-full bg-stone-950 border focus:ring-1 rounded-xl px-4 py-3 text-sm text-stone-100 outline-none transition-all text-left font-sans font-black tracking-widest ${
                errors.code ? "border-destructive/60" : "border-stone-800"
              }`}
              placeholder={
                currentType === "user_code"
                  ? "مثال: WELCOME"
                  : "تولید خودکار در صورت عدم ورود کد"
              }
              dir="ltr"
            />
            {errors.code && (
              <p className="text-[10px] text-destructive font-bold">
                {errors.code.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1 text-right">
              <label className="text-xs font-bold text-stone-300">
                نوع کوپن
              </label>
              <div className="relative">
                <Controller
                  name="type"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <select
                      value={value}
                      onChange={onChange}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 pr-3.5 py-3 text-xs text-stone-300 outline-none appearance-none cursor-pointer focus:border-gold-500 focus:ring-1 focus:ring-gold-500/50 transition-all font-bold"
                    >
                      <option value="user_code">
                        کوپن تخفیف دستی کاربر در تسویه
                      </option>
                      <option value="product_direct">
                        تخفیف خط‌خورده مستقیم محصول
                      </option>
                      <option value="conditional">
                        تخفیف شرطی حجم و زمان سیستمی
                      </option>
                    </select>
                  )}
                />
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-stone-500">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div className="space-y-1 text-right">
              <label className="text-xs font-bold text-stone-300">
                نوع کسر قیمت
              </label>
              <div className="relative">
                <Controller
                  name="discountType"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <select
                      value={value}
                      onChange={onChange}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 pr-3.5 py-3 text-xs text-stone-300 outline-none appearance-none cursor-pointer focus:border-gold-500 focus:ring-1 focus:ring-gold-500/50 transition-all font-bold"
                    >
                      <option value="percentage">درصدی (٪)</option>
                      <option value="fixed">مبلغ ثابت (تومان)</option>
                    </select>
                  )}
                />
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-stone-500">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1 text-right">
              <label className="text-xs font-bold text-stone-300">
                {currentDiscountType === "percentage"
                  ? "درصد تخفیف (٪)"
                  : "مبلغ تخفیف (تومان)"}
                <span className="text-red-500"> *</span>
              </label>
              <input
                type="number"
                {...register("discountValue", { valueAsNumber: true })}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-sm text-stone-100 outline-none text-left font-sans focus:border-gold-500 focus:ring-1 focus:ring-gold-500/50"
                dir="ltr"
              />
              {errors.discountValue && (
                <p className="text-[10px] text-destructive font-bold">
                  {errors.discountValue.message}
                </p>
              )}
            </div>

            <div className="space-y-1 text-right">
              <label className="text-xs font-bold text-stone-300">
                سقف تخفیف (تومان - اختیاری)
              </label>
              <input
                type="number"
                {...register("maxDiscountAmount", { valueAsNumber: true })}
                disabled={currentDiscountType === "fixed"}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-sm text-stone-100 outline-none text-left font-sans disabled:opacity-40 focus:border-gold-500 focus:ring-1 focus:ring-gold-500/50"
                placeholder="مخصوص تخفیف درصدی"
                dir="ltr"
              />
            </div>
          </div>

          {currentType === "conditional" && (
            <div className="space-y-1 text-right p-4 bg-stone-950/40 border border-stone-800 rounded-xl animate-in fade-in duration-200">
              <label className="text-xs font-bold text-stone-300 flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-gold-500" />
                حداقل وزن انتخابی پکیج (گرم)
              </label>
              <input
                type="number"
                {...register("minWeightGrams", { valueAsNumber: true })}
                className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-3 text-xs text-stone-100 outline-none text-left font-sans focus:border-gold-500 focus:ring-1 focus:ring-gold-500/50"
                placeholder="مثال: ۵۰۰۰ برای ۵ کیلوگرم"
                dir="ltr"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1 text-right">
              <label className="text-xs font-bold text-stone-300 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-stone-500" />
                فعال از تاریخ (شمسی)
              </label>
              <input
                type="text"
                {...register("validFrom")}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-sm text-stone-100 outline-none text-center font-sans tracking-wide focus:border-gold-500 focus:ring-1 focus:ring-gold-500/50"
                placeholder="1405/04/11"
                dir="ltr"
              />
              {errors.validFrom && (
                <p className="text-[10px] text-destructive font-bold">
                  {errors.validFrom.message}
                </p>
              )}
            </div>

            <div className="space-y-1 text-right">
              <label className="text-xs font-bold text-stone-300 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-stone-500" />
                منقضی در تاریخ (شمسی)
              </label>
              <input
                type="text"
                {...register("validTo")}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-sm text-stone-100 outline-none text-center font-sans tracking-wide focus:border-gold-500 focus:ring-1 focus:ring-gold-500/50"
                placeholder="1405/04/11"
                dir="ltr"
              />
              {errors.validTo && (
                <p className="text-[10px] text-destructive font-bold">
                  {errors.validTo.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1 text-right">
            <label className="text-xs font-bold text-stone-300">
              کالای هدف
            </label>
            <div className="relative">
              <Controller
                name="productId"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <select
                    value={value}
                    onChange={onChange}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 pr-3.5 py-3 text-xs text-stone-300 outline-none appearance-none cursor-pointer focus:border-gold-500 focus:ring-1 focus:ring-gold-500/50 transition-all font-bold mb-2"
                  >
                    {MOCK_PRODUCTS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                )}
              />
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-stone-500 mb-2">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {currentType === "user_code" && (
            <div className="flex items-center gap-2.5 p-3.5 bg-stone-950/40 border border-stone-800 rounded-xl text-right animate-in fade-in duration-200">
              <Controller
                name="allowStacking"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <input
                    type="checkbox"
                    id="allowStacking"
                    checked={value || false}
                    onChange={(e) => onChange(e.target.checked)}
                    className="w-4 h-4 rounded border-stone-800 text-gold-500 focus:ring-gold-500 accent-gold-500 bg-stone-950 cursor-pointer shrink-0"
                  />
                )}
              />
              <label
                htmlFor="allowStacking"
                className="text-xs font-bold text-stone-300 cursor-pointer select-none"
              >
                امکان همپوشانی (Stacking) با تخفیف‌های مستقیم فروشگاه فعال باشد؟
              </label>
            </div>
          )}

          <div className="border-t border-stone-800 pt-4 mt-6 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-stone-400 hover:text-stone-200 cursor-pointer text-xs"
            >
              انصراف
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-gold-500 hover:bg-gold-600 text-stone-950 font-black px-5 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer text-xs"
            >
              {isPending ? "در حال ثبت..." : "تعریف نهایی کوپن تخفیف"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
