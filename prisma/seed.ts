import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing from .env file!");
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 شروع فرآیند Seeding ساختار بهینه کافه راز...");

  // ۱. پاکسازی داده‌های قدیمی جهت بازسازی کامل ساختار
  await prisma.otpRecord.deleteMany();
  await prisma.option.deleteMany();
  await prisma.couponUsage.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.order.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.pricing.deleteMany();
  await prisma.user.deleteMany();
  await prisma.product.deleteMany();

  console.log("🗑️ تمام رکوردهای قبلی با موفقیت حذف شدند.");

  // ۲. ثبت محصول اصلی
  const mainProduct = await prisma.product.create({
    data: {
      id: "prod_coffee_bulk_01",
      name: "قهوه فله میکس ویژه اسپرسو",
      description:
        "ترکیبی اقتصادی و باکیفیت از دانه‌های مرغوب عربیکا و روبوستا با طعم یاد متعادل و قیمتی فراتر از انتظار. ایده‌آل برای مصارف روزانه خانگی، کافه‌ها و ادارات.",
      stockGrams: 150000,
    },
  });
  console.log("📦 محصول اصلی در دیتابیس ثبت شد.");

  // ۳. ثبت قیمت‌های مرجع عربیکا و روبوستا
  await prisma.pricing.create({
    data: {
      productId: mainProduct.id,
      pricePerKgArabica: 2200000,
      pricePerKgRobusta: 1800000,
    },
  });
  console.log("🏷️ نرخ‌های مرجع عربیکا و روبوستا در دیتابیس ذخیره شدند.");

  // ۴. ثبت کاربران فرضی اولیه
  await prisma.user.createMany({
    data: [
      {
        id: "usr_default_1",
        name: "علیرضا شفیعی",
        phone: "09121112233",
        createdAt: new Date("2026-05-30T10:15:00.000Z"),
        address: "تهران، میدان ونک، خیابان گاندی، کوچه چهارم، پلاک ۱۲، واحد ۳",
      },
      {
        id: "usr_default_2",
        name: "سارا فلاحی",
        phone: "09354445566",
        createdAt: new Date("2026-05-29T18:40:00.000Z"),
        address: "شیراز، بلوار ارم، کوچه بنفشه، ساختمان طلوع، طبقه همکف",
      },
    ],
  });
  console.log("👥 کاربران پیش‌فرض ثبت شدند.");

  // ۵. ثبت فاکتورهای اولیه (متصل به مدل اِنام‌های جدید)
  await prisma.order.createMany({
    data: [
      {
        id: "ORD-9824",
        productId: mainProduct.id,
        weightGrams: 1000,
        quantity: 2,
        grindType:
          "ترکیب: ۷۰٪ روبوستا / ۳۰٪ عربیکا | آسیاب: آسیاب اسپرسو (دستگاه برقی)",
        finalPrice: 3880000,
        customerName: "علیرضا شفیعی",
        customerPhone: "09121112233",
        customerAddress:
          "تهران، میدان ونک، خیابان گاندی، کوچه چهارم، پلاک ۱۲، واحد ۳",
        createdAt: new Date("2026-05-30T10:15:00.000Z"),
        status: "completed", // مقداردهی ایمن اِنام
      },
      {
        id: "ORD-7612",
        productId: mainProduct.id,
        weightGrams: 250,
        quantity: 4,
        grindType: "ترکیب: ۱۰۰٪ عربیکا | آسیاب: دانه کامل (آسیاب نشده)",
        finalPrice: 2200000,
        customerName: "سارا فلاحی",
        customerPhone: "09354445566",
        customerAddress:
          "شیراز، بلوار ارم، کوچه بنفشه، ساختمان طلوع، طبقه همکف",
        createdAt: new Date("2026-05-29T18:40:00.000Z"),
        status: "unreviewed", // مقداردهی ایمن اِنام
      },
    ],
  });
  console.log("🛍️ فاکتورهای سفارش پیش‌فرض ثبت شدند.");

  // ۶. ثبت کوپن‌های تخفیف (متصل به مدل اِنام‌های جدید)
  await prisma.coupon.createMany({
    data: [
      {
        id: "cp_direct_spring",
        code: "SPRING10",
        type: "product_direct",
        discountType: "percentage",
        discountValue: 10,
        productId: mainProduct.id,
        isActive: true,
      },
      {
        id: "cp_cond_bulk",
        code: "BULK5KG",
        type: "conditional",
        discountType: "percentage",
        discountValue: 15,
        minWeightGrams: 5000,
        productId: mainProduct.id,
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
    ],
  });
  console.log("🎫 تخفیف‌ها و کوپن‌های جدید ثبت شدند.");

  // ۷. ثبت نظرات تایید شده
  const comment1 = await prisma.comment.create({
    data: {
      id: "comm_1",
      productId: mainProduct.id,
      firstName: "سهراب",
      lastName: "کریمی",
      rating: 5,
      commentText:
        "کیفیت طعم و یکدستی دانه‌ها عالی بود. برای کافه سفارش دادم و مشتری‌ها واقعاً از غلظت قهوه و طعم یاد شکلاتی راضی هستند.",
      createdAt: new Date("2026-05-20T14:30:00.000Z"),
      status: "approved",
    },
  });

  await prisma.comment.create({
    data: {
      id: "comm_1_reply",
      productId: mainProduct.id,
      firstName: "پشتیبان کافه راز",
      lastName: "",
      rating: null,
      commentText:
        "سلام جناب کریمی عزیز، خوشحالیم که پکیج قهوه کافه راز رضایت مشتریان ارزشمند شما را به همراه داشته است.",
      createdAt: new Date("2026-05-21T09:15:00.000Z"),
      status: "approved",
      parentCommentId: comment1.id,
    },
  });

  await prisma.comment.create({
    data: {
      id: "comm_2",
      productId: mainProduct.id,
      firstName: "مریم",
      lastName: "احمدی",
      rating: 4,
      commentText:
        "عطر قهوه فوق‌العاده است. برای موکاپات روگازی آسیاب گرفتم و واقعاً طعم غلیظ و مناسبی داره. بسته‌بندی هم کاملاً پلمپ و مرتب بود.",
      createdAt: new Date("2026-05-18T11:20:00.000Z"),
      status: "approved",
    },
  });
  console.log("💬 بازخوردهای بهینه مشتریان ذخیره شدند.");

  // ۸. ثبت تنظیمات پویای سایت مستقیماً با فرمت باینری jsonb (بدون JSON.stringify)
  await prisma.option.createMany({
    data: [
      {
        key: "site_footer",
        value: {
          phones: ["09002570060", "09002570040", "021-77311806"],
          address: "تهران، کافه راز",
          eitaa: "https://eitaa.com/razcoffee",
          website: "https://caferaz.ir",
        },
      },
      {
        key: "site_usps",
        value: [
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
        ],
      },
      {
        key: "site_faq",
        value: [
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
        ],
      },
      {
        key: "site_subtitle",
        value:
          "عرضه مستقیم انواع میکس‌های قهوه فله با عطر مطلوب، قیمت بسیار اقتصادی و ارسال سریع به سراسر کشور.",
      },
    ],
  });
  console.log("⚙️ تنظیمات و داده‌های پویا با فرمت باینری jsonb ذخیره شدند.");

  console.log("🎉 مرحله دوم به بهینه‌ترین شکل ممکن کامل گردید.");
}

main()
  .catch((e) => {
    console.error("❌ خطا در اجرای اسکریپت Seed:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    pool.end();
  });
