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

export interface CommentReply {
  id: string;
  first_name: string;
  last_name: string;
  rating: number | null;
  comment_text: string;
  created_at: string;
}

export interface Comment {
  id: string;
  productId: string;
  first_name: string;
  last_name: string;
  rating: number;
  comment_text: string;
  created_at: string;
  replies?: CommentReply[];
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
  status: "pending" | "completed";
}

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "prod_coffee_bulk_01",
    name: "قهوه فله میکس ویژه اسپرسو",
    description:
      "ترکیب دانه‌های مرغوب عربیکا و روبوستا با رست هفتگی، عطر ماندگار و کرمای مخملی غلیظ. ایده‌آل برای مصارف روزانه کافه‌ها، هتل‌ها و مصارف خانگی.",
    stock_grams: 150000,
  },
];

export const MOCK_PRICING_RULES: ProductVariantPricing[] = [
  {
    id: "v_rule_01",
    productId: "prod_coffee_bulk_01",
    pricePerKgArabica: 2200000,
    pricePerKgRobusta: 1800000,
  },
];

export let MOCK_COMMENTS: Comment[] = [
  {
    id: "comm_1",
    productId: "prod_coffee_bulk_01",
    first_name: "سهراب",
    last_name: "کریمی",
    rating: 5,
    comment_text:
      "کیفیت رست و یکدستی دانه‌ها عالی بود. برای کافه سفارش دادم و مشتری‌ها واقعاً از غلظت قهوه و طعم یاد شکلاتی راضی هستند.",
    created_at: "2026-05-20T14:30:00.000Z",
    replies: [
      {
        id: "comm_1_reply",
        first_name: "پشتیبان",
        last_name: "کافه راز",
        rating: null,
        comment_text:
          "سلام جناب کریمی عزیز، خوشحالیم که کیفیت رست قهوه رضایت مشتریان ارزشمند شما را به همراه داشته است.",
        created_at: "2026-05-21T09:15:00.000Z",
      },
    ],
  },
  {
    id: "comm_2",
    productId: "prod_coffee_bulk_01",
    first_name: "مریم",
    last_name: "احمدی",
    rating: 4,
    comment_text:
      "عطر قهوه فوق‌العاده است. برای موکاپات روگازی آسیاب گرفتم و واقعاً طعم غلیظ و مناسبی داره. بسته‌بندی هم کاملاً پلمپ و مرتب بود.",
    created_at: "2026-05-18T11:20:00.000Z",
  },
];

export const MOCK_ORDERS: Order[] = [];

export function getProductWithPricing(id: string) {
  const product = MOCK_PRODUCTS.find((p) => p.id === id);
  if (!product) return null;

  const pricing = MOCK_PRICING_RULES.find((pr) => pr.productId === id);
  return {
    ...product,
    pricing: pricing
      ? {
          pricePerKgArabica: pricing.pricePerKgArabica,
          pricePerKgRobusta: pricing.pricePerKgRobusta,
        }
      : null,
  };
}

export function getCommentsByProductId(productId: string): Comment[] {
  return MOCK_COMMENTS.filter((c) => c.productId === productId);
}

export function createComment(
  productId: string,
  data: {
    first_name: string;
    last_name: string;
    rating: number;
    comment_text: string;
  },
): Comment {
  const newComment: Comment = {
    id: `comm_${Date.now()}`,
    productId,
    first_name: data.first_name,
    last_name: data.last_name,
    rating: data.rating,
    comment_text: data.comment_text,
    created_at: new Date().toISOString(),
    replies: [],
  };
  MOCK_COMMENTS.push(newComment);
  return newComment;
}

export function createOrder(
  data: Omit<Order, "id" | "createdAt" | "status">,
): Order {
  const newOrder: Order = {
    id: `ord_${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
    ...data,
    createdAt: new Date().toISOString(),
    status: "pending",
  };
  MOCK_ORDERS.push(newOrder);
  return newOrder;
}
