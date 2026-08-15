import { OrderStatus } from "@/domain/validations/order.schema";
import { CommentStatus } from "@/domain/validations/comment.schema";
import { CouponType, DiscountType } from "@/domain/validations/coupon.schema";
import { FooterConfig, FAQItem } from "@/domain/validations/settings.schema";

export type {
  OrderStatus,
  CommentStatus,
  CouponType,
  DiscountType,
  FooterConfig,
  FAQItem,
};

export interface Product {
  id: string;
  name: string;
  description: string;
  stockGrams: number;
}

export interface ProductWithPricing extends Product {
  pricing: {
    pricePerKgArabica: number;
    pricePerKgRobusta: number;
  } | null;
}

export interface Comment {
  id: string;
  productId?: string;
  firstName: string;
  lastName?: string;
  rating: number | null;
  commentText: string;
  createdAt: string;
  status?: CommentStatus;
  replies?: Comment[];
}

export interface Order {
  id: string;
  productId: string;
  weightGrams: number;
  quantity: number;
  grindType: string;
  finalPrice: number;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  createdAt: string;
  status: OrderStatus;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  createdAt: string;
  address?: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  discountType: DiscountType;
  discountValue: number;
  productId?: string;
  minWeightGrams?: number;
  validFrom?: string;
  validTo?: string;
  maxDiscountAmount?: number;
  isActive: boolean;
  deletedAt?: string | null;
  allowStacking?: boolean;
}

export interface CouponUsage {
  id: string;
  couponId: string;
  phone: string;
  usedAt: string;
}
