import React from "react";
import { FAQItem } from "@/domain/validations/faq.schema";
import { SiteFaqHeader } from "@/domain/types";
import { DEFAULT_SITE_CONTENT } from "@/lib/content/default-content";
import FAQAccordionList from "@/components/features/landing/FAQAccordionList";

interface FAQSectionProps {
  header?: SiteFaqHeader;
  faqs?: FAQItem[];
}

export default function FAQSection({
  header = DEFAULT_SITE_CONTENT.faqHeader,
  faqs = [],
}: FAQSectionProps) {
  if (!faqs || faqs.length === 0) return null;

  return (
    <section
      id="faq"
      className="w-full max-w-4xl mx-auto px-4 py-10 sm:py-16 text-right"
      dir="rtl"
    >
      <div className="text-center mb-8 sm:mb-12">
        <span className="text-[10px] bg-gold-500/10 border border-gold-500/20 text-gold-400 px-3 py-1 rounded-full font-black tracking-widest uppercase">
          {header.badge}
        </span>
        <h2 className="text-xl md:text-3xl font-black text-stone-100 mt-3">
          {header.title}
        </h2>
        <p className="text-xs md:text-sm text-stone-400 leading-relaxed mt-2">
          {header.description}
        </p>
      </div>

      <FAQAccordionList faqs={faqs} />
    </section>
  );
}
