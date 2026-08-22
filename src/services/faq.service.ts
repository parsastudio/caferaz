import "server-only";
import { prisma } from "@/lib/prisma";
import {
  FAQItem,
  CreateFaqInput,
  UpdateFaqInput,
  faqEntitySchema,
} from "@/domain/validations/faq.schema";
import { z } from "zod";
import crypto from "crypto";

const DEFAULT_FAQS: FAQItem[] = [
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

export class FaqService {
  static async getAllFaqs(): Promise<FAQItem[]> {
    try {
      const opt = await prisma.option.findUnique({
        where: { key: "site_faq" },
      });

      if (!opt || !opt.value) {
        return DEFAULT_FAQS;
      }

      const parsed = z.array(faqEntitySchema).safeParse(opt.value);
      return parsed.success ? parsed.data : DEFAULT_FAQS;
    } catch {
      return DEFAULT_FAQS;
    }
  }

  static async createFaq(input: CreateFaqInput): Promise<FAQItem> {
    const current = await this.getAllFaqs();
    const newFaq: FAQItem = {
      id: `faq_${crypto.randomBytes(4).toString("hex")}`,
      question: input.question.trim(),
      answer: input.answer.trim(),
    };

    const updated = [...current, newFaq];

    await prisma.option.upsert({
      where: { key: "site_faq" },
      update: { value: updated },
      create: { key: "site_faq", value: updated },
    });

    return newFaq;
  }

  static async updateFaq(input: UpdateFaqInput): Promise<FAQItem> {
    const current = await this.getAllFaqs();
    const exists = current.some((f) => f.id === input.id);

    if (!exists) {
      throw new Error("سوال مورد نظر برای ویرایش یافت نشد.");
    }

    const updated = current.map((f) =>
      f.id === input.id
        ? {
            ...f,
            question: input.question.trim(),
            answer: input.answer.trim(),
          }
        : f,
    );

    await prisma.option.upsert({
      where: { key: "site_faq" },
      update: { value: updated },
      create: { key: "site_faq", value: updated },
    });

    return {
      id: input.id,
      question: input.question.trim(),
      answer: input.answer.trim(),
    };
  }

  static async deleteFaq(id: string): Promise<boolean> {
    const current = await this.getAllFaqs();
    const filtered = current.filter((f) => f.id !== id);

    await prisma.option.upsert({
      where: { key: "site_faq" },
      update: { value: filtered },
      create: { key: "site_faq", value: filtered },
    });

    return true;
  }
}
