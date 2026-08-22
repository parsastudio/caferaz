import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import crypto from "crypto";
import "dotenv/config";
import { DEFAULT_SITE_CONTENT } from "../src/lib/content/default-content";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing from .env file!");
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 600000, 64, "sha512")
    .toString("hex");
  return `${salt}:${hash}`;
}

async function main() {
  await prisma.otpRecord.deleteMany();
  await prisma.option.deleteMany();
  await prisma.couponUsage.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.pricing.deleteMany();
  await prisma.user.deleteMany();
  await prisma.product.deleteMany();

  const mainProduct = await prisma.product.create({
    data: {
      id: "prod_coffee_bulk_01",
      name: "قهوه فله میکس ویژه اسپرسو",
      description:
        "ترکیبی اقتصادی و باکیفیت از دانه‌های مرغوب عربیکا و روبوستا با طعم یاد متعادل و قیمتی فراتر از انتظار. ایده‌آل برای مصارف روزانه خانگی، کافه‌ها و ادارات.",
      stockGrams: 150000,
      isActive: true,
    },
  });

  await prisma.pricing.create({
    data: {
      productId: mainProduct.id,
      pricePerKgArabica: 2200000,
      pricePerKgRobusta: 1800000,
    },
  });

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

  await prisma.order.create({
    data: {
      id: "ORD-9824",
      userId: "usr_default_1",
      customerName: "علیرضا شفیعی",
      customerPhone: "09121112233",
      customerAddress:
        "تهران، میدان ونک، خیابان گاندی، کوچه چهارم، پلاک ۱۲، واحد ۳",
      createdAt: new Date("2026-05-30T10:15:00.000Z"),
      status: "completed",
      finalPrice: 3880000,
      orderItems: {
        create: [
          {
            productId: mainProduct.id,
            weightGrams: 1000,
            quantity: 2,
            blend: "۵۰٪ روبوستا / ۵۰٪ عربیکا",
            grind: "آسیاب اسپرسو (دستگاه برقی)",
            grindType:
              "ترکیب: ۷۰٪ روبوستا / ۳۰٪ عربیکا | آسیاب: آسیاب اسپرسو (دستگاه برقی)",
            price: 1940000,
          },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      id: "ORD-7612",
      userId: "usr_default_2",
      customerName: "سارا فلاحی",
      customerPhone: "09354445566",
      customerAddress: "شیراز، بلوار ارم، کوچه بنفشه، ساختمان طلوع، طبقه همکف",
      createdAt: new Date("2026-05-29T18:40:00.000Z"),
      status: "unreviewed",
      finalPrice: 2200000,
      orderItems: {
        create: [
          {
            productId: mainProduct.id,
            weightGrams: 250,
            quantity: 4,
            blend: "۱۰۰٪ عربیکا",
            grind: "دانه کامل (آسیاب نشده)",
            grindType: "ترکیب: ۱۰۰٪ عربیکا | آسیاب: دانه کامل (آسیاب نشده)",
            price: 550000,
          },
        ],
      },
    },
  });

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

  const comment1 = await prisma.comment.create({
    data: {
      id: "comm_1",
      productId: mainProduct.id,
      userId: "usr_default_1",
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

  await prisma.option.createMany({
    data: [
      {
        key: "admin_credentials",
        value: {
          username: "admin",
          passwordHash: hashPassword("admin123"),
        },
      },
      {
        key: "site_content",
        value: DEFAULT_SITE_CONTENT,
      },
    ],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    pool.end();
  });
