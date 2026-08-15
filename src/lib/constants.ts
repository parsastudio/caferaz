export interface USP {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface BlendProfile {
  robusta: number;
  arabica: number;
  caffeine: number;
  body: number;
  aroma: number;
  label: string;
}

export interface CoffeeBlend {
  value: string;
  desc: string;
  profile: BlendProfile;
}

export interface CoffeeGrind {
  value: string;
  desc: string;
}

export const STATIC_USPS: USP[] = [
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
];

export const STATIC_BLENDS: CoffeeBlend[] = [
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
];

export const STATIC_GRINDS: CoffeeGrind[] = [
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
];
