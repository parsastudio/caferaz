"use server";

export {
  getCouponsAction,
  createCouponAction,
  deleteCouponAction,
  toggleCouponStatusAction,
  createCouponSchema,
  type CreateCouponInput,
} from "@/actions/admin-coupon";

export {
  validateCouponAction,
  type ValidatedCouponResult,
} from "@/actions/validate-coupon";
