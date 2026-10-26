"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  ChevronRight,
  ChevronLeft,
  LogOut,
  Loader2,
  LayoutDashboard,
  ShoppingBag,
  MessageSquare,
  Tag,
  Ticket,
  HelpCircle,
  FileText,
  KeyRound,
  Coffee,
  Home,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAdminAction } from "@/actions/admin-auth";

interface MenuItem {
  path: string;
  label: string;
  icon: LucideIcon;
}

const menuItems: MenuItem[] = [
  {
    path: "/admin",
    label: "داشبورد",
    icon: LayoutDashboard,
  },
  {
    path: "/admin/orders",
    label: "سفارش‌ها",
    icon: ShoppingBag,
  },
  {
    path: "/admin/comments",
    label: "نظرات",
    icon: MessageSquare,
  },
  {
    path: "/admin/pricing",
    label: "قیمت و موجودی",
    icon: Tag,
  },
  {
    path: "/admin/coupons",
    label: "کوپن‌ها",
    icon: Ticket,
  },
  {
    path: "/admin/faq",
    label: "سوالات متداول",
    icon: HelpCircle,
  },
  {
    path: "/admin/settings",
    label: "متون سایت",
    icon: FileText,
  },
  {
    path: "/admin/change-password",
    label: "تغییر رمز",
    icon: KeyRound,
  },
];

export default function AdminSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAdminAction();
    });
  };

  return (
    <>
      {/* 1. سایدبار نسخه دسکتاپ (دقیقاً دست‌نخورده برای تبلت و کامپیوتر) */}
      <motion.div
        animate={{ width: isCollapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className="hidden md:flex relative h-screen bg-stone-900 border-l border-stone-800 flex-col justify-between py-6 shrink-0 z-40 select-none"
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute top-8 -left-3.5 w-7 h-7 rounded-full bg-gold-500 hover:bg-gold-600 text-stone-950 items-center justify-center border border-stone-900 shadow-md cursor-pointer transition-colors z-50 flex"
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
            <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/20 text-gold-500 flex items-center justify-center shrink-0">
              <Coffee className="w-5 h-5" strokeWidth={1.75} />
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
              const IconComponent = item.icon;
              return (
                <Link key={item.path} href={item.path}>
                  <div
                    className={cn(
                      "flex items-center rounded-xl p-3 cursor-pointer transition-all duration-150 relative",
                      isActive
                        ? "text-gold-400 bg-gold-500/10 border-r-2 border-gold-500"
                        : "text-stone-400 hover:text-stone-200 hover:bg-stone-850",
                      isCollapsed ? "justify-center" : "justify-start gap-3.5",
                    )}
                  >
                    <IconComponent
                      className="w-4 h-4 shrink-0"
                      strokeWidth={isActive ? 2 : 1.5}
                    />
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
                "flex items-center rounded-xl p-3 text-stone-400 hover:bg-stone-850 hover:text-stone-200 transition-colors cursor-pointer",
                isCollapsed ? "justify-center" : "justify-start gap-3.5",
              )}
            >
              <Home className="w-4 h-4 shrink-0" strokeWidth={1.5} />
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
              "w-full flex items-center rounded-xl p-3 text-red-400 hover:bg-red-500/5 hover:text-red-300 transition-colors cursor-pointer text-right border-none bg-transparent outline-none",
              isCollapsed ? "justify-center" : "justify-start gap-3.5",
            )}
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
            ) : (
              <LogOut className="w-4 h-4 shrink-0" />
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

      {/* 2. نوار افقی اسکرول‌پذیر تب‌های مدیریت در موبایل (دسترسی مستقیم، آنی و بدون گیر کردن) */}
      <div className="md:hidden sticky top-0 z-40 w-full bg-stone-900/95 border-b border-stone-800 backdrop-blur-md px-3 py-2.5 overflow-x-auto scrollbar-none flex items-center gap-2 shrink-0 select-none">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          const IconComponent = item.icon;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 shrink-0 transition-all cursor-pointer",
                isActive
                  ? "bg-gold-500 text-stone-950 font-black shadow-sm"
                  : "bg-stone-950/70 text-stone-300 hover:text-stone-100 border border-stone-800",
              )}
            >
              <IconComponent className="w-3.5 h-3.5 shrink-0" strokeWidth={isActive ? 2.2 : 1.5} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
