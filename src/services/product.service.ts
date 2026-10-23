import "server-only";
import { prisma } from "@/lib/prisma";
import { ProductWithPricing } from "@/domain/types";
import {
  UpdateProductDetailsInput,
  UpdateProductBasicInfoInput,
} from "@/domain/validations/product.schema";

export class ProductService {
  static async getTehranDeliveryFee(): Promise<number> {
    try {
      const opt = await prisma.option.findUnique({
        where: { key: "tehran_delivery_fee" },
      });
      if (!opt || typeof opt.value !== "number") {
        return 70000;
      }
      return opt.value;
    } catch {
      return 70000;
    }
  }

  static async getLastRoastDate(): Promise<string | null> {
    try {
      const opt = await prisma.option.findUnique({
        where: { key: "last_roast_date" },
      });
      if (!opt || typeof opt.value !== "string") {
        return null;
      }
      return opt.value;
    } catch {
      return null;
    }
  }

  static async getMainProduct(): Promise<ProductWithPricing | null> {
    const product = await prisma.product.findFirst({
      where: { deletedAt: null, isActive: true },
      include: { pricing: true },
      orderBy: { createdAt: "asc" },
    });

    if (!product) return null;

    const tehranDeliveryFee = await this.getTehranDeliveryFee();
    const lastRoastDate = await this.getLastRoastDate();

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      stockGrams: product.stockGrams,
      tehranDeliveryFee,
      lastRoastDate,
      pricing: product.pricing
        ? {
            pricePerKgArabica: product.pricing.pricePerKgArabica,
            pricePerKgRobusta: product.pricing.pricePerKgRobusta,
          }
        : null,
    };
  }

  static async getAllActiveProducts(): Promise<{ id: string; name: string }[]> {
    const products = await prisma.product.findMany({
      where: { deletedAt: null, isActive: true },
      select: { id: true, name: true },
      orderBy: { createdAt: "asc" },
    });

    return products;
  }

  static async updateProductDetails(
    input: UpdateProductDetailsInput,
  ): Promise<boolean> {
    const ops: unknown[] = [
      prisma.product.update({
        where: { id: input.productId },
        data: { stockGrams: input.stockGrams },
      }),
      prisma.pricing.upsert({
        where: { productId: input.productId },
        update: {
          pricePerKgArabica: input.pricePerKgArabica,
          pricePerKgRobusta: input.pricePerKgRobusta,
        },
        create: {
          productId: input.productId,
          pricePerKgArabica: input.pricePerKgArabica,
          pricePerKgRobusta: input.pricePerKgRobusta,
        },
      }),
    ];

    if (input.tehranDeliveryFee !== undefined) {
      ops.push(
        prisma.option.upsert({
          where: { key: "tehran_delivery_fee" },
          update: { value: input.tehranDeliveryFee },
          create: {
            key: "tehran_delivery_fee",
            value: input.tehranDeliveryFee,
          },
        }),
      );
    }

    if (input.lastRoastDate !== undefined) {
      const cleanRoastDate = input.lastRoastDate
        ? input.lastRoastDate.trim()
        : null;
      ops.push(
        prisma.option.upsert({
          where: { key: "last_roast_date" },
          update: { value: cleanRoastDate },
          create: {
            key: "last_roast_date",
            value: cleanRoastDate,
          },
        }),
      );
    }

    await prisma.$transaction(ops as never);

    return true;
  }

  static async updateProductBasicInfo(
    input: UpdateProductBasicInfoInput,
  ): Promise<boolean> {
    await prisma.product.update({
      where: { id: input.productId },
      data: { name: input.name, description: input.description },
    });

    return true;
  }
}
