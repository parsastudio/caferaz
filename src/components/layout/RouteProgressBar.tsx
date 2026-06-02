"use client";

import React, { useEffect, useState, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function RouteProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fadeOutTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startProgress = () => {
    if (fadeOutTimeoutRef.current) clearTimeout(fadeOutTimeoutRef.current);
    if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
    if (timerRef.current) clearInterval(timerRef.current);

    setVisible(true);
    setProgress(15);

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev < 45) {
          return prev + Math.floor(Math.random() * 8) + 4;
        } else if (prev < 78) {
          return prev + Math.floor(Math.random() * 3) + 1;
        } else if (prev < 96) {
          return prev + 0.5;
        }
        return prev;
      });
    }, 120);
  };

  const completeProgress = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setProgress(100);

    fadeOutTimeoutRef.current = setTimeout(() => {
      setVisible(false);
    }, 220);

    resetTimeoutRef.current = setTimeout(() => {
      setProgress(0);
    }, 450);
  };

  useEffect(() => {
    completeProgress();
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleAnchorClick = (event: MouseEvent) => {
      try {
        const target = event.target as HTMLElement;
        const anchor = target.closest("a");

        if (!anchor) return;

        const href = anchor.getAttribute("href");
        if (!href) return;

        const targetAttr = anchor.getAttribute("target");
        if (targetAttr && targetAttr !== "_self") return;
        if (anchor.hasAttribute("download")) return;

        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
          return;
        if (event.button !== 0) return;

        const isInternal =
          href.startsWith("/") || href.startsWith(window.location.origin);
        if (!isInternal) return;

        const currentUrl = new URL(window.location.href);
        const targetUrl = new URL(href, window.location.href);

        const isSamePage =
          currentUrl.pathname === targetUrl.pathname &&
          currentUrl.search === targetUrl.search;

        if (isSamePage) {
          return;
        }

        if (/^(mailto|tel|sms|javascript):/i.test(href)) return;

        startProgress();
      } catch (err) {
        console.error(err);
      }
    };

    document.addEventListener("click", handleAnchorClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleAnchorClick, {
        capture: true,
      });
      if (timerRef.current) clearInterval(timerRef.current);
      if (fadeOutTimeoutRef.current) clearTimeout(fadeOutTimeoutRef.current);
      if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
    };
  }, []);

  if (!visible && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none transition-opacity duration-200 ease-out"
      dir="ltr"
      style={{
        opacity: visible ? 1 : 0,
      }}
    >
      <div
        className="h-[3px] bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 transition-all duration-150 ease-out shadow-[0_0_8px_rgba(223,154,66,0.5)]"
        style={{
          width: `${progress}%`,
        }}
      />
    </div>
  );
}
