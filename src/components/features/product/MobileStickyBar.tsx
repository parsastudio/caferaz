"use client";

import React, { useEffect, useState } from "react";
import { ShoppingBag, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useSiteContent } from "@/context/ContentContext";

interface MobileStickyBarProps {
  finalPrice: number;
  basePrice: number;
  isOutOfStock: boolean;
  onCheckout: () => void;
}

export default function MobileStickyBar({
  finalPrice,
  basePrice,
  isOutOfStock,
  onCheckout,
}: MobileStickyBarProps) {
  const { product } = useSiteContent();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 450) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const hasDiscount = finalPrice < basePrice;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 25 }}
          className="fixed bottom-0 left-0 right-0 z-40 lg:hidden p-3.5 bg-stone-950/90 backdrop-blur-xl border-t border-gold-500/20 shadow-2xl shadow-black/80"
          dir="rtl"
        >
          <div className="max-w-md mx-auto flex items-center justify-between gap-3">
            <div className="flex flex-col text-right">
              <span className="text-[10px] text-stone-400 font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-gold-500" />
                {product.pricePayableLabel}
              </span>
              <div className="flex items-center gap-1.5">
                {hasDiscount && (
                  <span className="text-[10px] text-stone-500 line-through font-sans">
                    {basePrice.toLocaleString()}
                  </span>
                )}
                <span className="text-base font-black text-gold-400 font-sans">
                  {finalPrice.toLocaleString()}{" "}
                  <span className="text-[10px] font-bold text-stone-300">
                    {product.currency}
                  </span>
                </span>
              </div>
            </div>

            <Button
              onClick={onCheckout}
              disabled={isOutOfStock}
              className="bg-gold-500 hover:bg-gold-600 active:scale-95 text-stone-950 font-black px-5 py-2.5 rounded-xl text-xs cursor-pointer shadow-lg shadow-gold-500/10 flex items-center gap-1.5 shrink-0"
            >
              <ShoppingBag className="w-4 h-4" />
              {isOutOfStock
                ? product.mobileOutOfStockButton
                : product.mobileQuickOrderButton}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
