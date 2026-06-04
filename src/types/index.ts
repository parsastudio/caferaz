export interface Product {
  id: string;
  name: string;
  description: string;
  stock_grams: number;
}

export interface ProductVariantPricing {
  id: string;
  productId: string;
  pricePerKgArabica: number;
  pricePerKgRobusta: number;
}

export interface Comment {
  id: string;
  productId?: string;
  first_name: string;
  last_name: string;
  rating: number | null;
  comment_text: string;
  created_at: string;
  status?: "pending" | "approved" | "rejected" | "spam";
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
  status: "unreviewed" | "pending" | "completed" | "cancelled";
}

export interface ProductWithPricing extends Product {
  pricing: {
    pricePerKgArabica: number;
    pricePerKgRobusta: number;
  } | null;
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
  type: "product_direct" | "conditional" | "user_code";
  discountType: "percentage" | "fixed";
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
