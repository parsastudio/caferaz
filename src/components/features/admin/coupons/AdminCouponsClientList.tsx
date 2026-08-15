"use client";

import React, { useState, useTransition } from "react";
import { toast } from "sonner";
import { Ticket, Plus } from "lucide-react";
import { Coupon } from "@/types";
import {
  createCouponAction,
  deleteCouponAction,
  toggleCouponStatusAction,
} from "@/actions/coupon";
import { CreateCouponInput } from "@/domain/validations/coupon.schema";
import { Button } from "@/components/ui/button";
import { parseJalaliString } from "@/lib/jalali-converter";
import CouponStats from "@/components/features/admin/coupons/CouponStats";
import CouponCard from "@/components/features/admin/coupons/CouponCard";
import CouponCreateDialog from "@/components/features/admin/coupons/CouponCreateDialog";

interface AdminCouponsClientListProps {
  initialCoupons: Coupon[];
  products?: { id: string; name: string }[];
}

export default function AdminCouponsClientList({
  initialCoupons,
  products = [],
}: AdminCouponsClientListProps) {
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleToggleStatus = (id: string) => {
    startTransition(async () => {
      const result = await toggleCouponStatusAction(id);
      if (result.success) {
        setCoupons((prev) =>
          prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c)),
        );
        toast.success(result.message || "وضعیت فعال‌بودن کوپن تغییر یافت.");
      } else {
        toast.error(result.error || "خطا در بروزرسانی وضعیت کوپن.");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("آیا از حذف دائمی این کوپن اطمینان دارید؟")) return;
    startTransition(async () => {
      const result = await deleteCouponAction(id);
      if (result.success) {
        setCoupons((prev) => prev.filter((c) => c.id !== id));
        toast.success(result.message || "کوپن با موفقیت حذف شد.");
      } else {
        toast.error(result.error || "خطا در حذف کوپن.");
      }
    });
  };

  const onSubmit = async (data: CreateCouponInput) => {
    startTransition(async () => {
      let miladiValidFrom: string | undefined = undefined;
      let miladiValidTo: string | undefined = undefined;

      if (data.validFrom && data.validFrom.trim() !== "") {
        const parsed = parseJalaliString(data.validFrom);
        if (parsed) {
          miladiValidFrom = `${parsed.gy}-${String(parsed.gm).padStart(2, "0")}-${String(parsed.gd).padStart(2, "0")}`;
        }
      }

      if (data.validTo && data.validTo.trim() !== "") {
        const parsed = parseJalaliString(data.validTo);
        if (parsed) {
          miladiValidTo = `${parsed.gy}-${String(parsed.gm).padStart(2, "0")}-${String(parsed.gd).padStart(2, "0")}`;
        }
      }

      const payload = {
        ...data,
        productId: data.productId || undefined,
        minWeightGrams: data.minWeightGrams || undefined,
        validFrom: miladiValidFrom,
        validTo: miladiValidTo,
        maxDiscountAmount: data.maxDiscountAmount || undefined,
        isActive: true,
        allowStacking: data.allowStacking ?? false,
      };

      const result = await createCouponAction(payload);
      if (result.success) {
        setCoupons((prev) => [...prev, result.data]);
        toast.success(result.message || "کوپن جدید با موفقیت ثبت شد.");
        setIsOpen(false);
      } else {
        toast.error(result.error || "خطا در ذخیره‌سازی کوپن جدید.");
      }
    });
  };

  return (
    <div className="space-y-8">
      <CouponStats coupons={coupons} />

      <div className="flex justify-between items-center">
        <h2 className="text-md font-black text-stone-200 flex items-center gap-2">
          <Ticket className="w-5 h-5 text-gold-500" />
          کدهای تخفیف جاری در سیستم
        </h2>
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-gold-500 hover:bg-gold-600 text-stone-950 font-black px-4 py-2 text-xs rounded-xl cursor-pointer flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          تعریف کوپن تخفیف جدید
        </Button>
      </div>

      {coupons.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-stone-850 bg-stone-900/10 rounded-2xl">
          <p className="text-xs text-stone-500">تاکنون کوپنی تعریف نشده است.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coupons.map((coupon) => (
            <CouponCard
              key={coupon.id}
              coupon={coupon}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <CouponCreateDialog
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        onSubmit={onSubmit}
        isPending={isPending}
        products={products}
      />
    </div>
  );
}
