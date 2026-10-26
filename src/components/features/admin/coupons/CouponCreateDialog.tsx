"use client";

import React from "react";
import { useForm, Resolver, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  createCouponSchema,
  type CreateCouponInput,
} from "@/domain/validations/coupon.schema";
import CouponFormFields from "@/components/features/admin/coupons/CouponFormFields";

interface CouponCreateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateCouponInput) => void;
  isPending: boolean;
  products?: { id: string; name: string }[];
}

export default function CouponCreateDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  isPending,
  products = [],
}: CouponCreateDialogProps) {
  const defaultProductId = products[0]?.id || "";

  const methods = useForm<CreateCouponInput>({
    resolver: zodResolver(
      createCouponSchema,
    ) as unknown as Resolver<CreateCouponInput>,
    defaultValues: {
      code: "",
      type: "user_code",
      discountType: "percentage",
      discountValue: 10,
      productId: defaultProductId,
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
    formState: { errors },
  } = methods;

  const currentType = useWatch({ control, name: "type" });
  const currentDiscountType = useWatch({ control, name: "discountType" });

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
          <CouponFormFields
            register={register}
            control={control}
            errors={errors}
            currentType={currentType}
            currentDiscountType={currentDiscountType}
            products={products}
          />

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
