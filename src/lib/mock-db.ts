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
  status: "pending" | "completed";
}

export interface ProductWithPricing extends Product {
  pricing: {
    pricePerKgArabica: number;
    pricePerKgRobusta: number;
  } | null;
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

export const MOCK_COMMENTS: Comment[] = [
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
        first_name: "پشتیبان کافه راز",
        last_name: "",
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

export const MOCK_ORDERS: Order[] = [
  {
    id: "ORD-9824",
    productId: "prod_coffee_bulk_01",
    weightGrams: 1000,
    quantity: 2,
    grindType:
      "ترکیب: ۷۰٪ روبوستا / ۳۰٪ عربیکا | آسیاب: آسیاب اسپرسو (دستگاه برقی)",
    finalPrice: 3880000,
    customerName: "علیرضا شفیعی",
    customerPhone: "09121112233",
    customerAddress:
      "تهران، میدان ونک، خیابان گاندی، کوچه چهارم، پلاک ۱۲، واحد ۳",
    createdAt: "2026-05-30T10:15:00.000Z",
    status: "completed",
  },
  {
    id: "ORD-7612",
    productId: "prod_coffee_bulk_01",
    weightGrams: 250,
    quantity: 4,
    grindType: "ترکیب: ۱۰۰٪ عربیکا | آسیاب: دانه کامل (آسیاب نشده)",
    finalPrice: 2200000,
    customerName: "سارا فلاحی",
    customerPhone: "09354445566",
    customerAddress: "شیراز، بلوار ارم، کوچه بنفشه، ساختمان طلوع، طبقه همکف",
    createdAt: "2026-05-29T18:40:00.000Z",
    status: "pending",
  },
];

export function getProductWithPricing(id: string): ProductWithPricing | null {
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

export function addComment(
  productId: string,
  data: {
    first_name: string;
    last_name: string;
    rating: number | null;
    comment_text: string;
    parentId: string | null;
  },
): Comment {
  const newId = `comm_${Date.now()}`;
  const createdAt = new Date().toISOString();

  if (data.parentId) {
    const reply: Comment = {
      id: newId,
      first_name: data.first_name,
      last_name: data.last_name,
      rating: null,
      comment_text: data.comment_text,
      created_at: createdAt,
      replies: [],
    };
    const parentComment = MOCK_COMMENTS.find((c) => c.id === data.parentId);
    if (parentComment) {
      if (!parentComment.replies) {
        parentComment.replies = [];
      }
      parentComment.replies.push(reply);
    }
    return reply;
  } else {
    const comment: Comment = {
      id: newId,
      productId,
      first_name: data.first_name,
      last_name: data.last_name,
      rating: data.rating,
      comment_text: data.comment_text,
      created_at: createdAt,
      replies: [],
    };
    MOCK_COMMENTS.unshift(comment);
    return comment;
  }
}

export function deleteComment(commentId: string): boolean {
  const index = MOCK_COMMENTS.findIndex((c) => c.id === commentId);
  if (index !== -1) {
    MOCK_COMMENTS.splice(index, 1);
    return true;
  }
  for (const parent of MOCK_COMMENTS) {
    if (parent.replies) {
      const replyIndex = parent.replies.findIndex((r) => r.id === commentId);
      if (replyIndex !== -1) {
        parent.replies.splice(replyIndex, 1);
        return true;
      }
    }
  }
  return false;
}

export function updateProductDetails(
  productId: string,
  name: string,
  description: string,
  pricePerKgArabica: number,
  pricePerKgRobusta: number,
): boolean {
  const product = MOCK_PRODUCTS.find((p) => p.id === productId);
  if (product) {
    product.name = name;
    product.description = description;
  }

  const pricing = MOCK_PRICING_RULES.find((pr) => pr.productId === productId);
  if (pricing) {
    pricing.pricePerKgArabica = pricePerKgArabica;
    pricing.pricePerKgRobusta = pricePerKgRobusta;
  }

  return !!product && !!pricing;
}

export function createOrder(
  data: Omit<Order, "id" | "createdAt" | "status">,
): Order {
  const newOrder: Order = {
    id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
    ...data,
    createdAt: new Date().toISOString(),
    status: "pending",
  };
  MOCK_ORDERS.unshift(newOrder);
  return newOrder;
}

export function getOrders(): Order[] {
  return MOCK_ORDERS;
}
