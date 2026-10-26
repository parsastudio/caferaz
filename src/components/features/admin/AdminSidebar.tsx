"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
  Menu,
  X,
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
    label: "داشبورد اصلی",
    icon: LayoutDashboard,
  },
  {
    path: "/admin/orders",
    label: "مدیریت سفارش‌ها",
    icon: ShoppingBag,
  },
  {
    path: "/admin/comments",
    label: "مدیریت نظرات",
    icon: MessageSquare,
  },
  {
    path: "/admin/pricing",
    label: "تغییر قیمت و موجودی",
    icon: Tag,
  },
  {
    path: "/admin/coupons",
    label: "مدیریت کوپن‌ها",
    icon: Ticket,
  },
  {
    path: "/admin/faq",
    label: "مدیریت سوالات متداول",
    icon: HelpCircle,
  },
  {
    path: "/admin/settings",
    label: "ویرایش متون سایت",
    icon: FileText,
  },
  {
    path: "/admin/change-password",
    label: "تغییر رمز عبور",
    icon: KeyRound,
  },
];

const mobilePrimaryPaths = [
  "/admin",
  "/admin/orders",
  "/admin/comments",
  "/admin/pricing",
];

export default function AdminSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAdminAction();
    });
  };

  return (
    <>
      {/* 1. سایدبار نسخه دسکتاپ (فقط در صفحات متوسط و بزرگ نمایش داده می‌شود) */}
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

      {/* 2. نوار ابزار پایین گوشی (Mobile Bottom Dock - کاملاً واکنش‌گرا و سبک) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-stone-900/95 border-t border-stone-800 backdrop-blur-xl px-2 py-1.5 flex items-center justify-around shadow-2xl">
        {menuItems
          .filter((item) => mobilePrimaryPaths.includes(item.path))
          .map((item) => {
            const isActive = pathname === item.path;
            const IconComponent = item.icon;
            return (
              <Link key={item.path} href={item.path} className="flex-1">
                <div
                  className={cn(
                    "flex flex-col items-center justify-center py-1 rounded-xl transition-all select-none",
                    isActive
                      ? "text-gold-400 font-black"
                      : "text-stone-400 hover:text-stone-200",
                  )}
                >
                  <IconComponent className="w-5 h-5 mb-0.5" strokeWidth={isActive ? 2.2 : 1.5} />
                  <span className="text-[10px] truncate">{item.label.split(" ")[1] || item.label}</span>
                </div>
              </Link>
            );
          })}

        {/* دکمه منوی سایر بخش‌ها */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          className={cn(
            "flex-1 flex flex-col items-center justify-center py-1 rounded-xl transition-all select-none cursor-pointer",
            !mobilePrimaryPaths.includes(pathname)
              ? "text-gold-400 font-black"
              : "text-stone-400 hover:text-stone-200",
          )}
        >
          <Menu className="w-5 h-5 mb-0.5" strokeWidth={1.5} />
          <span className="text-[10px]">سایر منوها</span>
        </button>
      </div>

      {/* 3. پنجره کشویی تمام گزینه‌ها در موبایل (Bottom Sheet) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-50"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="md:hidden fixed bottom-0 left-0 right-0 max-h-[85vh] bg-stone-900 border-t border-stone-800 rounded-t-3xl z-50 overflow-y-auto p-5 space-y-4"
              dir="rtl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                <div className="flex items-center gap-2">
                  <Coffee className="w-5 h-5 text-gold-500" strokeWidth={1.75} />
                  <span className="text-sm font-black text-stone-100">بخش‌های پنل مدیریت</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-stone-400 hover:text-stone-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {menuItems.map((item) => {
                  const isActive = pathname === item.path;
                  const IconComponent = item.icon;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div
                        className={cn(
                          "flex items-center gap-2.5 p-3 rounded-xl border text-right transition-colors",
                          isActive
                            ? "bg-gold-500/10 border-gold-500/40 text-gold-400 font-bold"
                            : "bg-stone-950/60 border-stone-800 text-stone-300 hover:border-stone-700",
                        )}
                      >
                        <IconComponent className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                        <span className="text-xs truncate">{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-stone-800 flex items-center justify-between gap-2">
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-stone-950 border border-stone-800 text-stone-300 text-xs font-bold"
                >
                  <Home className="w-4 h-4 text-stone-400" />
                  <span>مشاهده وب‌سایت</span>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isPending}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold cursor-pointer"
                >
                  {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <LogOut className="w-4 h-4" />
                  )}
                  <span>خروج</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
