import { useState } from "react";

export function useCoffeeSelection() {
  const [selectedWeight, setSelectedWeight] = useState<number>(250);
  const [isCustomWeight, setIsCustomWeight] = useState<boolean>(false);
  const [customWeightVal, setCustomWeightVal] = useState<number>(300);
  const [selectedBlend, setSelectedBlend] = useState<string>(
    "۵۰٪ روبوستا / ۵۰٪ عربیکا",
  );
  const [selectedGrind, setSelectedGrind] = useState<string>(
    "دانه کامل (آسیاب نشده)",
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
