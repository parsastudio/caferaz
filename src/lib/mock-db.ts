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

export interface Option {
  key: string;
  value: string;
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
      "ترکیبی اقتصادی و باکیفیت از دانه‌های مرغوب عربیکا و روبوستا با طعم یاد متعادل و قیمتی فراتر از انتظار. ایده‌آل برای مصارف روزانه خانگی، کافه‌ها و ادارات.",
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
      "کیفیت طعم و یکدستی دانه‌ها عالی بود. برای کافه سفارش دادم و مشتری‌ها واقعاً از غلظت قهوه و طعم یاد شکلاتی راضی هستند.",
    created_at: "2026-05-20T14:30:00.000Z",
    status: "approved",
    replies: [
      {
        id: "comm_1_reply",
        first_name: "پشتیبان کافه راز",
        last_name: "",
        rating: null,
        comment_text:
          "سلام جناب کریمی عزیز، خوشحالیم که پکیج قهوه کافه راز رضایت مشتریان ارزشمند شما را به همراه داشته است.",
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

export const MOCK_OPTIONS: Option[] = [
  {
    key: "site_footer",
    value: JSON.stringify({
      phones: ["09002570060", "09002570040", "021-77311806"],
      address: "تهران، کافه راز",
      eitaa: "https://eitaa.com/razcoffee",
      website: "https://caferaz.ir",
    }),
  },
  {
    key: "site_usps",
    value: JSON.stringify([
      {
        id: "usp_1",
        icon: "Coins",
        title: "قیمت فوق‌العاده اقتصادی",
        description:
          "تأمین مستقیم قهوه با حاشیه سود حداقلی و حذف واسطه‌ها، قیمتی کاملاً رقابتی و اقتصادی‌تر از بازار را تضمین می‌کند.",
      },
      {
        id: "usp_2",
        icon: "MapPin",
        title: "ارسال رایگان در پیروزی و حکیمیه",
        description:
          "تحویل سریع و کاملاً رایگان سفارشات قهوه بدون محدودیت در وزن و تعداد در محدوده محله‌های پیروزی و حکیمیه تهران.",
      },
      {
        id: "usp_3",
        icon: "Sliders",
        title: "شخصی‌سازی بالانس طعمی",
        description:
          "امکان تعیین نسبت دقیق عربیکا و روبوستا برای رسیدن به تلخی، کافئین و بادی دلخواه شما.",
      },
      {
        id: "usp_4",
        icon: "Coffee",
        title: "آسیاب دقیق دانه قهوه",
        description:
          "آسیاب همگن دانه‌ها متناسب با تجهیزات و روش‌های گوناگون دم‌آوری شما اعم از خانگی و صنعتی.",
      },
    ]),
  },
  {
    key: "site_faq",
    value: JSON.stringify([
      {
        question: "مدت زمان ارسال سفارش‌ها چقدر است؟",
        answer:
          "سفارشات ثبت‌شده بلافاصله وارد فرآیند آماده‌سازی و بسته‌بندی شده و ظرف مدت ۲۴ الی ۷۲ ساعت کاری از طریق پیک یا پست پیشتاز تحویل می‌گردند.",
      },
      {
        question: "چگونه می‌توانم ترکیب قهوه اختصاصی خودم را سفارش دهم؟",
        answer:
          "در بخش خرید بالای همین صفحه می‌توانید نسبت‌های متفاوتی از دانه عربیکا و روبوستا را بر اساس ذائقه خود انتخاب کنید و ویژگی‌های ترکیب را فوراً بسنجید.",
      },
      {
        question: "آیا پرداخت در محل فعال است؟",
        answer:
          "بله، به منظور افزایش امنیت و جلب اطمینان کامل شما، امکان پرداخت فاکتور پس از دریافت کالا درب منزل یا محل کار در سراسر کشور فراهم شده است.",
      },
      {
        question: "تفاوت میان درجات مختلف آسیاب چیست؟",
        answer:
          "هر روش دم‌آوری نیازمند میزان درشتی یا نرمی مشخصی از پودر قهوه است. ما بر اساس انتخاب دستگاه شما (اسپرسوساز، موکاپات، فرانسه یا قهوه ترک) دانه‌ها را آسیاب می‌کنیم.",
      },
    ]),
  },
  {
    key: "site_subtitle",
    value:
      "عرضه مستقیم انواع میکس‌های قهوه فله با عطر مطلوب، قیمت بسیار اقتصادی و ارسال سریع به سراسر کشور.",
  },
  {
    key: "site_blends",
    value: JSON.stringify([
      {
        value: "۵۰٪ روبوستا / ۵۰٪ عربیکا",
        desc: "ترکیب متعادل، اسیدیته بسیار ملایم، بادی مناسب و عطر دلپذیر روزانه",
        profile: {
          robusta: 50,
          arabica: 50,
          caffeine: 60,
          body: 60,
          aroma: 65,
          label: "بالانس عالی از عطر عربیکا و گیرایی روبوستا",
        },
      },
      {
        value: "۷۰٪ روبوستا / ۳۰٪ عربیکا",
        desc: "کافئین بالا، تنواری سنگین، کرمای ضخیم و تلخی جذاب",
        profile: {
          robusta: 70,
          arabica: 30,
          caffeine: 80,
          body: 80,
          aroma: 45,
          label: "کافئین بالا، غلظت سنگین و تلخی جذاب",
        },
      },
      {
        value: "۳۰٪ روبوستا / ۷۰٪ عربیکا",
        desc: "اسیدیته ملایم رو به بالا، معطر و طعم یاد مرکباتی و شکلاتی",
        profile: {
          robusta: 30,
          arabica: 70,
          caffeine: 45,
          body: 45,
          aroma: 80,
          label: "بسیار خوش‌عطر، ترشی ملایم و طعم یاد مرکباتی",
        },
      },
      {
        value: "۱۰۰٪ روبوستا",
        desc: "بسیار سنگین، خامه ضخیم، کافئین حداکثری و بدون ترشی",
        profile: {
          robusta: 100,
          arabica: 0,
          caffeine: 95,
          body: 95,
          aroma: 25,
          label: "کافئین فوق‌العاده بالا و خامه (کرما) ضخیم",
        },
      },
      {
        value: "۱۰۰٪ عربیکا",
        desc: "بسیار معطر، ترشی ظریف، طعم یاد گلی و میوه‌ای تخصصی",
        profile: {
          robusta: 0,
          arabica: 100,
          caffeine: 25,
          body: 25,
          aroma: 98,
          label: "رایحه گلی بی‌نظیر، اسیدیته شفاف و طعم تخصصی",
        },
      },
    ]),
  },
  {
    key: "site_grinds",
    value: JSON.stringify([
      {
        value: "دانه کامل (آسیاب نشده)",
        desc: "دانه‌های قهوه سالم، مناسب برای نگهداری طولانی‌مدت",
      },
      {
        value: "آسیاب اسپرسو (دستگاه برقی)",
        desc: "مناسب برای انواع دستگاه‌های اسپرسوساز برقی",
      },
      {
        value: "آسیاب موکاپات (روگازی)",
        desc: "مناسب برای دم‌آوری با قهوه‌سازهای روگازی",
      },
      {
        value: "آسیاب قهوه ترک (جذوه)",
        desc: "آسیاب کاملاً پودری و بسیار نرم مخصوص قهوه ترک",
      },
      {
        value: "آسیاب فرنچ پرس (فرانسه)",
        desc: "آسیاب درشت، مناسب برای قهوه‌ساز فرنچ پرس",
      },
    ]),
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
      const replies = list[i].replies;
      if (replies && findAndRemove(replies)) {
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

export function getOption(key: string): any {
  const opt = MOCK_OPTIONS.find((o) => o.key === key);
  if (!opt) return null;
  try {
    return JSON.parse(opt.value);
  } catch {
    return opt.value;
  }
}

export function updateOption(key: string, value: any): boolean {
  const opt = MOCK_OPTIONS.find((o) => o.key === key);
  const strValue = typeof value === "string" ? value : JSON.stringify(value);
  if (opt) {
    opt.value = strValue;
    return true;
  } else {
    MOCK_OPTIONS.push({ key, value: strValue });
    return true;
  }
}
