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
  status?: "pending" | "approved" | "rejected";
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

class dbTransactionMutex {
  private activePromises: Promise<any> = Promise.resolve();

  async runExclusive<T>(callback: () => Promise<T> | T): Promise<T> {
    const nextPromise = this.activePromises.then(() => callback());
    this.activePromises = nextPromise.catch(() => {});
    return nextPromise;
  }
}

export const dbTransaction = new dbTransactionMutex();

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
    status: "approved",
    replies: [
      {
        id: "comm_1_reply",
        first_name: "پشتیبان کافه راز",
        last_name: "",
        rating: null,
        comment_text:
          "سلام جناب کریمی عزیز، خوشحالیم که کیفیت رست قهوه رضایت مشتریان ارزشمند شما را به همراه داشته است.",
        created_at: "2026-05-21T09:15:00.000Z",
        status: "approved",
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
    status: "approved",
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
    customerAddress: "شیراز، بلوار ارم، کوچه بنفشه، ساختمان طلوع, طبقه همکف",
    createdAt: "2026-05-29T18:40:00.000Z",
    status: "pending",
  },
];

export const MOCK_USERS: User[] = [
  {
    id: "usr_default_1",
    name: "علیرضا شفیعی",
    phone: "09121112233",
    createdAt: "2026-05-30T10:15:00.000Z",
    address: "تهران، میدان ونک، خیابان گاندی، کوچه چهارم، پلاک ۱۲، واحد ۳",
  },
  {
    id: "usr_default_2",
    name: "سارا فلاحی",
    phone: "09354445566",
    createdAt: "2026-05-29T18:40:00.000Z",
    address: "شیراز، بلوار ارم، کوچه بنفشه، ساختمان طلوع، طبقه همکف",
  },
];

export const MOCK_COUPONS: Coupon[] = [
  {
    id: "cp_direct_spring",
    code: "SPRING10",
    type: "product_direct",
    discountType: "percentage",
    discountValue: 10,
    productId: "prod_coffee_bulk_01",
    isActive: true,
  },
  {
    id: "cp_cond_bulk",
    code: "BULK5KG",
    type: "conditional",
    discountType: "percentage",
    discountValue: 15,
    minWeightGrams: 5000,
    productId: "prod_coffee_bulk_01",
    isActive: true,
  },
  {
    id: "cp_user_code_raz",
    code: "RAZ2026",
    type: "user_code",
    discountType: "fixed",
    discountValue: 50000,
    isActive: true,
    allowStacking: false,
  },
];

export const MOCK_COUPON_USAGES: CouponUsage[] = [];

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

export function getCommentsByProductId(
  productId: string,
  includeUnapproved = false,
): Comment[] {
  const list = MOCK_COMMENTS.filter((c) => c.productId === productId);

  const filterApproved = (commentsList: Comment[]): Comment[] => {
    return commentsList
      .filter((c) => includeUnapproved || c.status === "approved" || !c.status)
      .map((c) => ({
        ...c,
        replies: c.replies ? filterApproved(c.replies) : [],
      }));
  };

  return filterApproved(list);
}

export function addComment(
  productId: string,
  data: {
    first_name: string;
    last_name: string;
    rating: number | null;
    comment_text: string;
    parentId: string | null;
    status?: "pending" | "approved" | "rejected";
  },
): Comment {
  const newId = `comm_${Date.now()}`;
  const createdAt = new Date().toISOString();
  const defaultStatus = data.status || "pending";

  if (data.parentId) {
    const reply: Comment = {
      id: newId,
      first_name: data.first_name,
      last_name: data.last_name,
      rating: null,
      comment_text: data.comment_text,
      created_at: createdAt,
      replies: [],
      status: defaultStatus,
    };

    const findAndPush = (list: Comment[]): boolean => {
      for (const c of list) {
        if (c.id === data.parentId) {
          if (!c.replies) c.replies = [];
          c.replies.push(reply);
          return true;
        }
        if (c.replies && findAndPush(c.replies)) {
          return true;
        }
      }
      return false;
    };

    findAndPush(MOCK_COMMENTS);
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
      status: defaultStatus,
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
  const findAndRemove = (list: Comment[]): boolean => {
    for (let i = 0; i < list.length; i++) {
      if (list[i].id === commentId) {
        list.splice(i, 1);
        return true;
      }
      if (list[i].replies && findAndRemove(list[i].replies)) {
        return true;
      }
    }
    return false;
  };
  return findAndRemove(MOCK_COMMENTS);
}

export function updateCommentStatus(
  commentId: string,
  status: "pending" | "approved" | "rejected",
): boolean {
  const findAndModify = (list: Comment[]): boolean => {
    for (const c of list) {
      if (c.id === commentId) {
        c.status = status;
        return true;
      }
      if (c.replies && findAndModify(c.replies)) {
        return true;
      }
    }
    return false;
  };
  return findAndModify(MOCK_COMMENTS);
}

export function updateCommentText(commentId: string, text: string): boolean {
  const findAndModify = (list: Comment[]): boolean => {
    for (const c of list) {
      if (c.id === commentId) {
        c.comment_text = text;
        return true;
      }
      if (c.replies && findAndModify(c.replies)) {
        return true;
      }
    }
    return false;
  };
  return findAndModify(MOCK_COMMENTS);
}

export function updateProductDetails(
  productId: string,
  name: string,
  description: string,
  pricePerKgArabica: number,
  pricePerKgRobusta: number,
  stockGrams: number,
): boolean {
  const product = MOCK_PRODUCTS.find((p) => p.id === productId);
  if (product) {
    product.name = name;
    product.description = description;
    product.stock_grams = stockGrams;
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

export function updateOrderStatus(
  orderId: string,
  status: "pending" | "completed",
): boolean {
  const order = MOCK_ORDERS.find((o) => o.id === orderId);
  if (order) {
    order.status = status;
    return true;
  }
  return false;
}

export function getOrCreateUser(
  phone: string,
  name: string,
  address?: string,
): User {
  let user = MOCK_USERS.find((u) => u.phone === phone);
  if (!user) {
    user = {
      id: `usr_${Date.now()}`,
      name,
      phone,
      createdAt: new Date().toISOString(),
      address,
    };
    MOCK_USERS.push(user);
  } else {
    user.name = name;
    if (address) {
      user.address = address;
    }
  }
  return user;
}

export function getOrdersByPhone(phone: string): Order[] {
  return MOCK_ORDERS.filter((o) => o.customerPhone === phone);
}

export function getUserByPhone(phone: string): User | null {
  return MOCK_USERS.find((u) => u.phone === phone) || null;
}

export function getCoupons(): Coupon[] {
  return MOCK_COUPONS.filter((c) => !c.deletedAt);
}

export function getCouponByCode(code: string): Coupon | null {
  return (
    MOCK_COUPONS.find(
      (c) => !c.deletedAt && c.code.toUpperCase() === code.toUpperCase(),
    ) || null
  );
}

export function getCouponUsages(): CouponUsage[] {
  return MOCK_COUPON_USAGES;
}

export function createCoupon(data: Omit<Coupon, "id">): Coupon {
  const newCoupon: Coupon = {
    id: `cp_${Date.now()}`,
    ...data,
  };
  MOCK_COUPONS.push(newCoupon);
  return newCoupon;
}

export function deleteCoupon(id: string): boolean {
  const coupon = MOCK_COUPONS.find((c) => c.id === id);
  if (coupon) {
    coupon.deletedAt = new Date().toISOString();
    coupon.isActive = false;
    return true;
  }
  return false;
}

export function toggleCouponStatus(id: string): boolean {
  const coupon = MOCK_COUPONS.find((c) => c.id === id && !c.deletedAt);
  if (coupon) {
    coupon.isActive = !coupon.isActive;
    return true;
  }
  return false;
}

export function recordCouponUsage(
  couponId: string,
  phone: string,
): CouponUsage {
  const normalizedPhone = phone.trim();

  const alreadyUsed = MOCK_COUPON_USAGES.some(
    (u) => u.couponId === couponId && u.phone === normalizedPhone,
  );

  if (alreadyUsed) {
    const error = new Error(
      "PrismaUniqueConstraintViolation: Unique constraint failed on the fields: (`couponId`, `phone`)",
    );
    (error as any).code = "P2002";
    throw error;
  }

  const usage: CouponUsage = {
    id: `usage_${Date.now()}`,
    couponId,
    phone: normalizedPhone,
    usedAt: new Date().toISOString(),
  };

  MOCK_COUPON_USAGES.push(usage);
  return usage;
}

export function hasUserUsedCoupon(couponId: string, phone: string): boolean {
  return MOCK_COUPON_USAGES.some(
    (u) => u.couponId === couponId && u.phone === phone,
  );
}
