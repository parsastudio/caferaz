"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";
import { FAQItem } from "@/domain/validations/faq.schema";

interface FAQAccordionListProps {
  faqs: FAQItem[];
}

export default function FAQAccordionList({ faqs }: FAQAccordionListProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="space-y-3">
      {faqs.map((faq, index) => {
        const isOpen = activeIndex === index;

        return (
          <div
            key={faq.id}
            className="border border-stone-900/80 bg-stone-900/10 rounded-2xl overflow-hidden transition-colors duration-200"
          >
            <button
              type="button"
              onClick={() => toggleAccordion(index)}
              className="w-full flex items-center justify-between p-4 sm:p-5 text-right font-bold text-xs sm:text-sm text-stone-200 hover:text-gold-400 focus:outline-none cursor-pointer transition-colors gap-2"
              aria-expanded={isOpen}
            >
              <span className="flex items-center gap-2.5 sm:gap-3 text-right">
                <HelpCircle className="w-4 h-4 text-gold-500 shrink-0 mt-0.5 sm:mt-0" />
                <span>{faq.question}</span>
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
                  <div className="px-4 pb-4 pt-1 sm:px-5 sm:pb-5 text-xs sm:text-sm text-stone-400 leading-relaxed border-t border-stone-950/20 pr-7 sm:mr-7">
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
