"use client";

import React, { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronRight, ChevronLeft, LogOut, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAdminAction } from "@/actions/admin-auth";

const menuItems = [
  {
    path: "/admin",
    label: "داشبورد اصلی",
    emoji: "📊",
  },
  {
    path: "/admin/orders",
    label: "مدیریت سفارش‌ها",
    emoji: "🛍️",
  },
  {
    path: "/admin/comments",
    label: "مدیریت نظرات",
    emoji: "💬",
  },
  {
    path: "/admin/pricing",
    label: "تغییر قیمت و موجودی",
    emoji: "🏷️",
  },
  {
    path: "/admin/coupons",
    label: "مدیریت کوپن‌ها",
    emoji: "🎫",
  },
  {
    path: "/admin/faq",
    label: "مدیریت سوالات متداول",
    emoji: "❓",
  },
  {
    path: "/admin/settings",
    label: "ویرایش متون سایت",
    emoji: "🔍",
  },
  {
    path: "/admin/change-password",
    label: "تغییر رمز عبور",
    emoji: "🔑",
  },
];

export default function AdminSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAdminAction();
    });
  };

  return (
    <motion.div
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="relative h-screen bg-stone-900 border-l border-stone-800 flex flex-col justify-between py-6 shrink-0 z-40 select-none"
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="hidden md:flex absolute top-8 -left-3.5 w-7 h-7 rounded-full bg-gold-500 hover:bg-gold-600 text-stone-950 items-center justify-center border border-stone-900 shadow-md cursor-pointer transition-colors z-50"
      >
        {isCollapsed ? (
          <ChevronLeft className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </button>

      <div className="space-y-8 px-4">
        <div
          className={cn(
            "flex items-center gap-3",
            isCollapsed ? "justify-center" : "pr-2",
          )}
        >
          <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/20 text-gold-500 flex items-center justify-center text-xl font-black">
            ☕
          </div>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col"
            >
              <span className="text-sm font-black text-stone-100 tracking-tight leading-none">
                کافه راز
              </span>
              <span className="text-[10px] text-gold-500 font-bold mt-1">
                پنل مدیریت پیشرفته
              </span>
            </motion.div>
          )}
        </div>

        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <div
                  className={cn(
                    "flex items-center rounded-xl p-3.5 cursor-pointer transition-all duration-150 relative",
                    isActive
                      ? "text-gold-400 bg-gold-500/5 border-r-2 border-gold-500"
                      : "text-stone-400 hover:text-stone-200 hover:bg-stone-850",
                    isCollapsed ? "justify-center" : "justify-start gap-4",
                  )}
                >
                  <span className="text-xl shrink-0 filter drop-shadow-sm">
                    {item.emoji}
                  </span>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs font-bold truncate"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="px-4 space-y-1">
        <Link href="/">
          <div
            className={cn(
              "flex items-center rounded-xl p-3.5 text-gold-400 hover:bg-gold-500/5 hover:text-gold-300 transition-colors cursor-pointer",
              isCollapsed ? "justify-center" : "justify-start gap-4",
            )}
          >
            <span className="text-xl shrink-0 filter drop-shadow-sm">🏠</span>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs font-bold"
              >
                مشاهده وب‌سایت
              </motion.span>
            )}
          </div>
        </Link>

        <button
          onClick={handleLogout}
          disabled={isPending}
          className={cn(
            "w-full flex items-center rounded-xl p-3.5 text-red-400 hover:bg-red-500/5 hover:text-red-300 transition-colors cursor-pointer text-right border-none bg-transparent outline-none",
            isCollapsed ? "justify-center" : "justify-start gap-4",
          )}
        >
          {isPending ? (
            <Loader2 className="w-5 h-5 shrink-0 animate-spin" />
          ) : (
            <LogOut className="w-5 h-5 shrink-0" />
          )}
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs font-bold"
            >
              خروج از پنل
            </motion.span>
          )}
        </button>
      </div>
    </motion.div>
  );
}
