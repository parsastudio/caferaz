"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";
import { FAQItem } from "@/domain/validations/faq.schema";
import { useSiteContent } from "@/context/ContentContext";

interface FAQSectionProps {
  faqs?: FAQItem[];
}

export default function FAQSection({ faqs = [] }: FAQSectionProps) {
  const { faqHeader } = useSiteContent();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (!faqs || faqs.length === 0) return null;

  const toggleAccordion = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section
      id="faq"
      className="w-full max-w-4xl mx-auto px-4 py-16 text-right"
      dir="rtl"
    >
      <div className="text-center mb-12">
        <span className="text-[10px] bg-gold-500/10 border border-gold-500/20 text-gold-400 px-3 py-1 rounded-full font-black tracking-widest uppercase">
          {faqHeader.badge}
        </span>
        <h2 className="text-xl md:text-3xl font-black text-stone-100 mt-3">
          {faqHeader.title}
        </h2>
        <p className="text-xs md:text-sm text-stone-400 leading-relaxed mt-2">
          {faqHeader.description}
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, index) => {
          const isOpen = activeIndex === index;

          return (
            <div
              key={faq.id}
              className="border border-stone-900/80 bg-stone-900/10 rounded-2xl overflow-hidden transition-colors duration-200"
            >
              <button
                onClick={() => toggleAccordion(index)}
                className="w-full flex items-center justify-between p-5 text-right font-bold text-xs md:text-sm text-stone-200 hover:text-gold-400 focus:outline-none cursor-pointer transition-colors"
              >
                <span className="flex items-center gap-3">
                  <HelpCircle className="w-4 h-4 text-gold-500 shrink-0" />
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-stone-500 transition-transform duration-300 shrink-0 ${
                    isOpen ? "transform rotate-180 text-gold-500" : ""
                  }`}
                />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                  >
                    <div className="px-5 pb-5 pt-1 text-xs md:text-sm text-stone-400 leading-relaxed border-t border-stone-950/20 mr-7">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
