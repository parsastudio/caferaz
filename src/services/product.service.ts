import { prisma } from "@/lib/prisma";
import { ProductWithPricing } from "@/domain/types";
import {
  UpdateProductDetailsInput,
  UpdateProductBasicInfoInput,
} from "@/domain/validations/product.schema";

export class ProductService {
  static async getProductById(
    productId: string,
  ): Promise<ProductWithPricing | null> {
    const product = await prisma.product.findUnique({
      where: { id: productId, deletedAt: null },
      include: { pricing: true },
    });

    if (!product) return null;

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      stockGrams: product.stockGrams,
      pricing: product.pricing
        ? {
            pricePerKgArabica: product.pricing.pricePerKgArabica,
            pricePerKgRobusta: product.pricing.pricePerKgRobusta,
          }
        : null,
    };
  }

  static async updateProductDetails(
    input: UpdateProductDetailsInput,
  ): Promise<boolean> {
    await prisma.$transaction([
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
    ]);

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
