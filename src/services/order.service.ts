import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { Order } from "@/domain/types";
import {
  OrderStatus,
  ServerOrderPayload,
} from "@/domain/validations/order.schema";
import { normalizePhone } from "@/lib/phone";
import { OrderCreatorService } from "@/services/order-creator.service";

export type PrismaOrderWithItems = Prisma.OrderGetPayload<{
  include: { orderItems: true };
}>;

export class OrderService {
  static mapOrderWithItems(o: PrismaOrderWithItems): Order {
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
  }

  static async getAllOrders(): Promise<Order[]> {
    const orders = await prisma.order.findMany({
      include: { orderItems: true },
      orderBy: { createdAt: "desc" },
    });

    return orders.map(this.mapOrderWithItems);
  }

  static async getUserOrders(phone: string): Promise<Order[]> {
    const cleanPhone = normalizePhone(phone);
    const orders = await prisma.order.findMany({
      where: { customerPhone: cleanPhone },
      include: { orderItems: true },
      orderBy: { createdAt: "desc" },
    });

    return orders.map(this.mapOrderWithItems);
  }

  static async getPendingUserOrdersCount(phone: string): Promise<number> {
    const cleanPhone = normalizePhone(phone);
    return await prisma.order.count({
      where: {
        customerPhone: cleanPhone,
        status: { in: ["unreviewed", "pending"] },
      },
    });
  }

  static async getAdminStatusBarMetrics(): Promise<{
    monthSales: number;
    pendingOrdersCount: number;
  }> {
    const pendingOrdersCount = await prisma.order.count({
      where: { status: "unreviewed" },
    });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
    );

    const monthSalesAggregate = await prisma.order.aggregate({
      _sum: { finalPrice: true },
      where: {
        status: { not: "cancelled" },
        createdAt: { gte: startOfMonth, lte: endOfMonth },
      },
    });

    return {
      monthSales: monthSalesAggregate._sum.finalPrice ?? 0,
      pendingOrdersCount,
    };
  }

  static async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
  ): Promise<boolean> {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const existingOrder = await tx.order.findUnique({
        where: { id: orderId },
        include: { orderItems: true },
      });

      if (!existingOrder) {
        throw new Error("سفارش مورد نظر یافت نشد.");
      }

      if (existingOrder.status !== status) {
        if (existingOrder.status !== "cancelled" && status === "cancelled") {
          for (const item of existingOrder.orderItems) {
            const returnGrams = item.weightGrams * item.quantity;
            await tx.product.update({
              where: { id: item.productId },
              data: { stockGrams: { increment: returnGrams } },
            });
          }
        } else if (
          existingOrder.status === "cancelled" &&
          status !== "cancelled"
        ) {
          for (const item of existingOrder.orderItems) {
            const requiredGrams = item.weightGrams * item.quantity;
            const updated = await tx.product.updateMany({
              where: {
                id: item.productId,
                stockGrams: { gte: requiredGrams },
              },
              data: {
                stockGrams: { decrement: requiredGrams },
              },
            });

            if (updated.count === 0) {
              throw new Error(
                "موجودی انبار برای فعال‌سازی مجدد این سفارش کافی نیست.",
              );
            }
          }
        }

        await tx.order.update({
          where: { id: orderId },
          data: { status },
        });
      }

      return true;
    });
  }

  static async deleteOrder(orderId: string): Promise<boolean> {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const existingOrder = await tx.order.findUnique({
        where: { id: orderId },
        include: { orderItems: true },
      });

      if (!existingOrder) {
        throw new Error("سفارش مورد نظر یافت نشد.");
      }

      if (
        existingOrder.status === "unreviewed" ||
        existingOrder.status === "pending"
      ) {
        for (const item of existingOrder.orderItems) {
          const returnGrams = item.weightGrams * item.quantity;
          await tx.product.update({
            where: { id: item.productId },
            data: { stockGrams: { increment: returnGrams } },
          });
        }
      }

      await tx.order.delete({
        where: { id: orderId },
      });

      return true;
    });
  }

  static async createOrderTransaction(
    payload: ServerOrderPayload,
    securePhone: string,
  ): Promise<Order> {
    return await OrderCreatorService.createOrderTransaction(
      payload,
      securePhone,
      this.mapOrderWithItems,
    );
  }
}
