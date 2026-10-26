"use client";

import React, { createContext, useContext, useState } from "react";

export interface CheckoutData {
  productId: string;
  selectedWeight: number;
  selectedBlend: string;
  selectedGrind: string;
  quantity: number;
  finalPrice: number;
  basePrice: number;
  directDiscountAmount: number;
  conditionalDiscountAmount: number;
  tehranDeliveryFee?: number;
  roastInfo?: {
    daysAgo: number;
    formattedDate: string;
    freshnessLabel?: string;
  } | null;
}

interface CheckoutContextType {
  isOpen: boolean;
  checkoutData: CheckoutData | null;
  openCheckout: (data: CheckoutData) => void;
  closeCheckout: () => void;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(
  undefined,
);

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);

  const openCheckout = (data: CheckoutData) => {
    setCheckoutData(data);
    setIsOpen(true);
  };

  const closeCheckout = () => {
    setIsOpen(false);
  };

  return (
    <CheckoutContext.Provider
      value={{ isOpen, checkoutData, openCheckout, closeCheckout }}
    >
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error("useCheckout must be used within a CheckoutProvider");
  }
  return context;
}
