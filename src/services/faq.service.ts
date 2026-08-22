import "server-only";
import { prisma } from "@/lib/prisma";
import {
  FAQItem,
  CreateFaqInput,
  UpdateFaqInput,
  faqEntitySchema,
} from "@/domain/validations/faq.schema";
import { DEFAULT_FAQS } from "@/lib/constants";
import { z } from "zod";
import crypto from "crypto";

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
