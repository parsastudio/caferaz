"use client";

import React, { useRef } from "react";
import { toEnglishDigits } from "@/lib/utils";

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  hasError?: boolean;
}

export default function OtpInput({
  length = 4,
  value,
  onChange,
  disabled = false,
  hasError = false,
}: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length }, (_, i) => value[i] || "");

  const handleDigitChange = (val: string, index: number) => {
    const clean = toEnglishDigits(val).replace(/[^0-9]/g, "");
    const newDigits = [...digits];
    newDigits[index] = clean ? clean.substring(clean.length - 1) : "";

    const fullValue = newDigits.join("");
    onChange(fullValue);

    if (clean && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Backspace") {
      const newDigits = [...digits];
      if (digits[index] === "") {
        if (index > 0) {
          newDigits[index - 1] = "";
          onChange(newDigits.join(""));
          inputRefs.current[index - 1]?.focus();
        }
      } else {
        newDigits[index] = "";
        onChange(newDigits.join(""));
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = toEnglishDigits(e.clipboardData.getData("text"))
      .replace(/[^0-9]/g, "")
      .substring(0, length);

    if (pasted.length === length) {
      onChange(pasted);
      inputRefs.current[length - 1]?.focus();
    }
  };

  return (
    <div
      className="flex justify-center gap-3 py-2 animate-in fade-in duration-200 font-sans"
      dir="ltr"
    >
      {digits.map((digit, index) => (
        <input
          key={index}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          onChange={(e) => handleDigitChange(e.target.value, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          disabled={disabled}
          className={`w-12 h-14 text-center text-xl font-black bg-stone-950 border-2 rounded-xl outline-none text-gold-400 transition-all shadow-inner ${
            hasError
              ? "border-destructive/60 focus:border-destructive focus:ring-destructive/30"
              : "border-stone-800/80 focus:border-gold-500 focus:ring-gold-500"
          }`}
        />
      ))}
    </div>
  );
}
