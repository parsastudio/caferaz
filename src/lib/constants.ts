import { DEFAULT_SITE_CONTENT } from "@/lib/content/default-content";
import {
  SiteBlendItem,
  SiteGrindItem,
} from "@/domain/validations/content.schema";
import { FAQItem } from "@/domain/validations/faq.schema";

export type CoffeeBlend = SiteBlendItem;
export type CoffeeGrind = SiteGrindItem;
export type BlendProfile = SiteBlendItem["profile"];

export const DEFAULT_PRODUCT_PRICING = {
  pricePerKgArabica: 2200000,
  pricePerKgRobusta: 1800000,
} as const;

export const DEFAULT_STOCK_GRAMS = 150000;

export const DEFAULT_FAQS: FAQItem[] = [
  {
    id: "faq_1",
    question: "مدت زمان ارسال سفارش‌ها چقدر است؟",
    answer:
      "سفارشات ثبت‌شده بلافاصله وارد فرآیند آماده‌سازی و بسته‌بندی شده و ظرف مدت ۲۴ الی ۷۲ ساعت کاری از طریق پیک یا پست پیشتاز تحویل می‌گردند.",
  },
  {
    id: "faq_2",
    question: "چگونه می‌توانم ترکیب قهوه اختصاصی خودم را سفارش دهم؟",
    answer:
      "در بخش خرید بالای همین صفحه می‌توانید نسبت‌های متفاوتی از دانه عربیکا و روبوستا را بر اساس ذائقه خود انتخاب کنید و ویژگی‌های ترکیب را فوراً بسنجید.",
  },
  {
    id: "faq_3",
    question: "آیا پرداخت در محل فعال است؟",
    answer:
      "بله، به منظور افزایش امنیت و جلب اطمینان کامل شما، امکان پرداخت فاکتور پس از دریافت کالا درب منزل یا محل کار در سراسر کشور فراهم شده است.",
  },
  {
    id: "faq_4",
    question: "تفاوت میان درجات مختلف آسیاب چیست؟",
    answer:
      "هر روش دم‌آوری نیازمند میزان درشتی یا نرمی مشخصی از پودر قهوه است. ما بر اساس انتخاب دستگاه شما (اسپرسوساز، موکاپات، فرانسه یا قهوه ترک) دانه‌ها را آسیاب می‌کنیم.",
  },
];

export const STATIC_BLENDS: CoffeeBlend[] = DEFAULT_SITE_CONTENT.product.blends;
export const STATIC_GRINDS: CoffeeGrind[] = DEFAULT_SITE_CONTENT.product.grinds;
