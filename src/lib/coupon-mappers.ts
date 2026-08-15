import { Coupon } from "@/types";

interface PrismaCouponDb {
  id: string;
  code: string;
  type: string;
  discountType: string;
  discountValue: number;
  productId: string | null;
  minWeightGrams: number | null;
  validFrom: Date | null;
  validTo: Date | null;
  maxDiscountAmount: number | null;
  isActive: boolean;
  deletedAt: Date | null;
  allowStacking: boolean;
}

export function mapPrismaCoupon(c: PrismaCouponDb): Coupon {
  return {
    id: c.id,
    code: c.code,
    type: c.type as Coupon["type"],
    discountType: c.discountType as Coupon["discountType"],
    discountValue: c.discountValue,
    productId: c.productId ?? undefined,
    minWeightGrams: c.minWeightGrams ?? undefined,
    validFrom: c.validFrom ? c.validFrom.toISOString() : undefined,
    validTo: c.validTo ? c.validTo.toISOString() : undefined,
    maxDiscountAmount: c.maxDiscountAmount ?? undefined,
    isActive: c.isActive,
    deletedAt: c.deletedAt ? c.deletedAt.toISOString() : null,
    allowStacking: c.allowStacking,
  };
}
