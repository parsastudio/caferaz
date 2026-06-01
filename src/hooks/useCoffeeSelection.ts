import { useState } from "react";
import { STATIC_BLENDS, STATIC_GRINDS } from "@/lib/constants";

export function useCoffeeSelection() {
  const [selectedWeight, setSelectedWeight] = useState<number>(250);
  const [isCustomWeight, setIsCustomWeight] = useState<boolean>(false);
  const [customWeightVal, setCustomWeightVal] = useState<number>(300);
  const [selectedBlend, setSelectedBlend] = useState<string>(
    STATIC_BLENDS[0].value,
  );
  const [selectedGrind, setSelectedGrind] = useState<string>(
    STATIC_GRINDS[0].value,
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);

  return {
    selectedWeight,
    setSelectedWeight,
    isCustomWeight,
    setIsCustomWeight,
    customWeightVal,
    setCustomWeightVal,
    selectedBlend,
    setSelectedBlend,
    selectedGrind,
    setSelectedGrind,
    quantity,
    setQuantity,
    isCheckoutOpen,
    setIsCheckoutOpen,
  };
}
