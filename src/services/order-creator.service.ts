import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { Order } from "@/domain/types";
import { ServerOrderPayload } from "@/domain/validations/order.schema";
import { getBlendProfile } from "@/lib/pricing/blend";
import { calculateAdvancedPriceMetrics } from "@/lib/pricing/discount-engine";
import { mapPrismaCoupon } from "@/lib/coupon-mappers";
import { ContentService } from "@/services/content.service";
import { normalizePhone } from "@/lib/phone";
import crypto from "crypto";

export class OrderCreatorService {
  static async createOrderTransaction(
    payload: ServerOrderPayload,
    securePhone: string,
    mapOrderFn: (order: any) => Order,
  ): Promise<Order> {
    const {
      productId,
      weightGrams,
      quantity,
      blend,
      grind,
      customerName,
      customerAddress,
      appliedCouponCode,
    } = payload;

    const totalWeightNeeded = weightGrams * quantity;
    const cleanPhone = normalizePhone(securePhone);

    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const product = await tx.product.findUnique({
        where: { id: productId, deletedAt: null, isActive: true },
        include: { pricing: true },
      });

      if (!product) {
        throw new Error("محصول مورد نظر یافت نشد یا غیرفعال است.");
      }

      if (product.stockGrams < totalWeightNeeded) {
        throw new Error(
          "موجودى فیزیکی انبار برای ثبت این مقدار سفارش کافی نیست.",
        );
      }

      const updateResult = await tx.product.updateMany({
        where: {
          id: productId,
          stockGrams: { gte: totalWeightNeeded },
        },
        data: {
          stockGrams: { decrement: totalWeightNeeded },
        },
      });

      if (updateResult.count === 0) {
        throw new Error(
          "موجودى فیزیکی انبار برای ثبت این مقدار سفارش کافی نیست.",
        );
      }

      let coupon = null;
      if (appliedCouponCode) {
        const cleanCode = appliedCouponCode.trim().toUpperCase();
        coupon = await tx.coupon.findUnique({
          where: { code: cleanCode },
        });

        if (!coupon || !coupon.isActive || coupon.deletedAt) {
          throw new Error("کد تخفیف وارد شده معتبر نیست یا منقضی شده است.");
        }

        if (coupon.productId && coupon.productId !== productId) {
          throw new Error("این کد تخفیف برای محصول انتخابی شما معتبر نیست.");
        }

        const usage = await tx.couponUsage.findUnique({
          where: {
            couponId_phone: {
              couponId: coupon.id,
              phone: cleanPhone,
            },
          },
        });

        if (usage) {
          throw new Error(
            "تراکنش مسدود شد: این کد تخفیف قبلاً توسط شما استفاده شده است.",
          );
        }
      }

      const siteContent = await ContentService.getSiteContent();
      const blendProfile = getBlendProfile(blend, siteContent.product.blends);
      const activeCoupons = await tx.coupon.findMany({
        where: { deletedAt: null, isActive: true },
      });

      const pricingBreakdown = calculateAdvancedPriceMetrics({
        productId,
        pricing: product.pricing,
        blendProfile,
        weightGrams,
        quantity,
        activeCoupons: activeCoupons.map(mapPrismaCoupon),
        appliedUserCouponCode: appliedCouponCode,
        userPhone: cleanPhone,
        couponUsages: [],
      });

      const rawCleanAddress = customerAddress.trim();

      const user = await tx.user.upsert({
        where: { phone: cleanPhone },
        update: { name: customerName, address: rawCleanAddress },
        create: {
          phone: cleanPhone,
          name: customerName,
          address: rawCleanAddress,
        },
      });

      if (coupon && pricingBreakdown.userCouponDiscountAmount > 0) {
        try {
          await tx.couponUsage.create({
            data: {
              couponId: coupon.id,
              phone: cleanPhone,
            },
          });
        } catch (err) {
          if (
            err instanceof Prisma.PrismaClientKnownRequestError &&
            err.code === "P2002"
          ) {
            throw new Error(
              "تراکنش مسدود شد: این کد تخفیف قبلاً توسط شما استفاده شده است.",
            );
          }
          throw err;
        }
      }

      const secureRandomId = crypto.randomInt(100000000000, 1000000000000);
      const generatedId = `ORD-${secureRandomId}`;
      let shippingFee = 0;
      if (
        payload.destination === "tehran" &&
        payload.tehranZone === "other_tehran"
      ) {
        const opt = await tx.option.findUnique({
          where: { key: "tehran_delivery_fee" },
        });
        shippingFee =
          opt && typeof opt.value === "number" ? opt.value : 70000;
      }

      const totalOrderFinalPrice =
        pricingBreakdown.finalPrice + shippingFee;

      const unitPrice = Math.round(
        pricingBreakdown.finalPrice / Math.max(1, quantity),
      );

      let orderFormattedAddress = rawCleanAddress;
      if (payload.destination === "other") {
        const postalText = payload.postalCode?.trim()
          ? ` | کد پستی: ${payload.postalCode.trim()}`
          : "";
        orderFormattedAddress = `[سایر شهرها - پست پیشتاز | آنلاین] ${rawCleanAddress}${postalText}`;
      } else {
        const zoneText =
          payload.tehranZone === "piroozi"
            ? "پیروزی (ارسال رایگان)"
            : payload.tehranZone === "hakimieh"
              ? "حکیمیه (ارسال رایگان)"
              : `سایر مناطق تهران (کرایه پیک: ${shippingFee.toLocaleString()} ت)`;
        const payText =
          payload.paymentMethod === "online" ? "پرداخت آنلاین" : "پرداخت در محل";
        orderFormattedAddress = `[تحویل پیک تهران - ${zoneText} | ${payText}] ${rawCleanAddress}`;
      }

      const finalOrder = await tx.order.create({
        data: {
          id: generatedId,
          userId: user.id,
          couponId: coupon?.id ?? null,
          finalPrice: totalOrderFinalPrice,
          customerName,
          customerPhone: cleanPhone,
          customerAddress: orderFormattedAddress,
          status: "unreviewed",
          orderItems: {
            create: {
              productId,
              weightGrams,
              quantity,
              blend,
              grind,
              grindType: `ترکیب: ${blend} | آسیاب: ${grind}`,
              price: unitPrice,
            },
          },
        },
        include: {
          orderItems: true,
        },
      });

      return mapOrderFn(finalOrder);
    });
  }
}
