import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";

// جلوگیری از ساخت مجدد کلاینت در محیط توسعه (Dev Mode)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("متغیر محیطی DATABASE_URL در فایل .env تعریف نشده است!");
}

// ایجاد اتصال از طریق کلاینت نیتیو pg برای پریزما ۷
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
