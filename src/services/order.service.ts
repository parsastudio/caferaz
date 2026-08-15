import "server-only";
import { prisma } from "@/lib/prisma";
import { Order } from "@/domain/types";
import {
  OrderStatus,
  ServerOrderPayload,
} from "@/domain/validations/order.schema";
import {
  getBlendProfile,
  calculateAdvancedPriceMetrics,
} from "@/lib/coffee-calculations";
import { mapPrismaCoupon } from "@/lib/coupon-mappers";
import crypto from "crypto";

export class OrderService {
  static async getAllOrders(): Promise<Order[]> {
    const orders = await prisma.order.findMany({
      include: { orderItems: true },
      orderBy: { createdAt: "desc" },
    });

    return orders.map((o) => {
      const item = o.orderItems[0];
      return {
        id: o.id,
        productId: item?.productId ?? "",
        weightGrams: item?.weightGrams ?? 0,
        quantity: item?.quantity ?? 1,
        grindType: item?.grindType ?? "",
        finalPrice: o.finalPrice,
        customerName: o.customerName,
        customerPhone: o.customerPhone,
        customerAddress: o.customerAddress,
        createdAt: o.createdAt.toISOString(),
        status: o.status as OrderStatus,
      };
    });
  }

  static async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
  ): Promise<boolean> {
    await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
    return true;
  }

  static async deleteOrder(orderId: string): Promise<boolean> {
    await prisma.order.delete({
      where: { id: orderId },
    });
    return true;
  }

  static async createOrderTransaction(
    payload: ServerOrderPayload,
    securePhone: string,
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

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { pricing: true },
    });

    if (!product) {
      throw new Error("محصول مورد نظر یافت نشد.");
    }

    const totalWeightNeeded = weightGrams * quantity;
    if (product.stockGrams < totalWeightNeeded) {
      throw new Error(
        "موجودى فیزیکی انبار برای ثبت این مقدار سفارش کافی نیست.",
      );
    }

    let coupon = null;
    if (appliedCouponCode) {
      const cleanCode = appliedCouponCode.trim().toUpperCase();
      coupon = await prisma.coupon.findUnique({
        where: { code: cleanCode },
      });

      if (!coupon || !coupon.isActive || coupon.deletedAt) {
        throw new Error("کد تخفیف وارد شده معتبر نیست یا منقضی شده است.");
      }

      if (coupon.productId && coupon.productId !== productId) {
        throw new Error("این کد تخفیف برای محصول انتخابی شما معتبر نیست.");
      }

      const usage = await prisma.couponUsage.findUnique({
        where: {
          couponId_phone: {
            couponId: coupon.id,
            phone: securePhone,
          },
        },
      });

      if (usage) {
        throw new Error(
          "تراکنش مسدود شد: این کد تخفیف قبلاً توسط شما استفاده شده است.",
        );
      }
    }

    const blendProfile = getBlendProfile(blend);
    const activeCoupons = await prisma.coupon.findMany({
      where: { deletedAt: null },
    });
    const couponUsages = await prisma.couponUsage.findMany();

    const pricingBreakdown = calculateAdvancedPriceMetrics({
      productId,
      pricing: product.pricing,
      blendProfile,
      weightGrams,
      quantity,
      activeCoupons: activeCoupons.map(mapPrismaCoupon),
      appliedUserCouponCode: appliedCouponCode,
      userPhone: securePhone,
      couponUsages: couponUsages.map((u) => ({
        id: u.id,
        couponId: u.couponId,
        phone: u.phone,
        usedAt: u.usedAt.toISOString(),
      })),
    });

    return await prisma.$transaction(async (tx) => {
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

      const user = await tx.user.upsert({
        where: { phone: securePhone },
        update: { name: customerName, address: customerAddress },
        create: {
          phone: securePhone,
          name: customerName,
          address: customerAddress,
        },
      });

      if (coupon && pricingBreakdown.userCouponDiscountAmount > 0) {
        await tx.couponUsage.create({
          data: {
            couponId: coupon.id,
            phone: securePhone,
          },
        });
      }

      const secureRandomId = crypto.randomInt(100000000000, 1000000000000);
      const generatedId = `ORD-${secureRandomId}`;

      const finalOrder = await tx.order.create({
        data: {
          id: generatedId,
          userId: user.id,
          couponId: coupon?.id ?? null,
          finalPrice: pricingBreakdown.finalPrice,
          customerName,
          customerPhone: securePhone,
          customerAddress,
          status: "unreviewed",
          orderItems: {
            create: {
              productId,
              weightGrams,
              quantity,
              blend,
              grind,
              grindType: `ترکیب: ${blend} | آسیاب: ${grind}`,
              price: pricingBreakdown.finalPrice,
            },
          },
        },
        include: {
          orderItems: true,
        },
      });

      const firstItem = finalOrder.orderItems[0];
      return {
        id: finalOrder.id,
        productId: firstItem?.productId ?? productId,
        weightGrams: firstItem?.weightGrams ?? weightGrams,
        quantity: firstItem?.quantity ?? quantity,
        grindType: firstItem?.grindType ?? `ترکیب: ${blend} | آسیاب: ${grind}`,
        finalPrice: finalOrder.finalPrice,
        customerName: finalOrder.customerName,
        customerPhone: finalOrder.customerPhone,
        customerAddress: finalOrder.customerAddress,
        createdAt: finalOrder.createdAt.toISOString(),
        status: finalOrder.status as OrderStatus,
      };
    });
  }
}
