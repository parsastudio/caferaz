"use server";

import { ActionResponse } from "@/types/actions";
import { toEnglishDigits } from "@/lib/utils";
import { getCurrentUserAction } from "@/actions/user-auth";
import {
  validateCouponInputSchema,
  type ValidateCouponInput,
} from "@/domain/validations/coupon.schema";
import {
  CouponService,
  type ValidatedCouponResult,
} from "@/services/coupon.service";

export type { ValidatedCouponResult };

export async function validateCouponAction(
  payload: ValidateCouponInput,
): Promise<ActionResponse<ValidatedCouponResult>> {
  try {
    const validated = validateCouponInputSchema.safeParse(payload);
    if (!validated.success) {
      return {
        success: false,
        error:
          validated.error.issues[0]?.message || "اطلاعات کد تخفیف ناقص است.",
      };
    }

    const cleanPhone = validated.data.phone
      ? toEnglishDigits(validated.data.phone.trim())
      : null;

    const currentUserRes = await getCurrentUserAction();
    const securePhone =
      currentUserRes.success && currentUserRes.user
        ? currentUserRes.user.phone
        : cleanPhone;

    const result = await CouponService.validateUserCoupon(
      validated.data,
      securePhone,
    );

    return {
      success: true,
      message: "کد تخفیف با موفقیت اعمال گردید.",
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "خطا در پردازش و اعتبارسنجی کد تخفیف.",
    };
  }
}
