import React from "react";
import Link from "next/link";
import {
  checkAdminAuth,
  getCurrentUserAction,
  logoutAdminAction,
  logoutUserAction,
} from "@/actions/auth";
import {
  getOrders,
  getCommentsByProductId,
  getOrdersByPhone,
  Comment,
} from "@/lib/mock-db";
import {
  ShieldCheck,
  MessageSquare,
  ShoppingCart,
  DollarSign,
  LogOut,
  User,
  Award,
  Clock,
  Home, // ایمپورت آیکون خانه
} from "lucide-react";

function countPendingComments(commentsList: Comment[]): number {
  let count = 0;
  for (const c of commentsList) {
    if (c.status === "pending" || !c.status) {
      count++;
    }
    if (c.replies && c.replies.length > 0) {
      count += countPendingComments(c.replies);
    }
  }
  return count;
}

export default async function GlobalStatusBar() {
  const isAdmin = await checkAdminAuth();
  const userRes = await getCurrentUserAction();
  const user = userRes.success ? userRes.user : null;

  if (!isAdmin && !user) {
    return null;
  }

  if (isAdmin) {
    const rawComments = getCommentsByProductId("prod_coffee_bulk_01", true);
    const pendingCommentsCount = countPendingComments(rawComments);

    const allOrders = getOrders();
    const pendingOrdersCount = allOrders.filter(
      (o) => o.status === "unreviewed",
    ).length;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const monthSales = allOrders
      .filter((o) => {
        const d = new Date(o.createdAt);
        return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
      })
      .reduce((sum, o) => sum + o.finalPrice, 0);

    return (
      <div
        className="w-full bg-stone-900/95 border-b border-gold-500/25 text-stone-200 py-2.5 px-4 sticky top-0 z-50 backdrop-blur-md transition-all duration-300 shadow-lg shadow-black/20"
        dir="rtl"
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 font-sans text-xs">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-1.5 bg-gold-500/10 text-gold-400 px-2.5 py-1 rounded-full border border-gold-500/20 font-black">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>پنل مدیریت کافه راز</span>
            </div>

            <div className="flex items-center gap-4 text-stone-300">
              <div className="flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-gold-500" />
                <span>فروش این ماه:</span>
                <span className="font-sans font-bold text-gold-400">
                  {monthSales.toLocaleString()} تومان
                </span>
              </div>

              <div className="flex items-center gap-1">
                <ShoppingCart className="w-3.5 h-3.5 text-stone-500" />
                <span>سفارش جدید:</span>
                <span
                  className={`font-sans font-bold ${pendingOrdersCount > 0 ? "text-red-400 animate-pulse" : "text-stone-400"}`}
                >
                  {pendingOrdersCount} مورد
                </span>
              </div>

              <div className="flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-stone-500" />
                <span>نظرات در انتظار:</span>
                <span
                  className={`font-sans font-bold ${pendingCommentsCount > 0 ? "text-red-400 animate-pulse" : "text-stone-400"}`}
                >
                  {pendingCommentsCount} مورد
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* دکمه بازگشت به صفحه اصلی در پنل مدیریت */}
            <Link
              href="/"
              className="bg-stone-800 hover:bg-stone-750 text-stone-300 border border-stone-800 hover:border-stone-700 font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5 text-stone-400" />
              <span>صفحه اصلی</span>
            </Link>

            <Link
              href="/admin"
              className="bg-gold-500 hover:bg-gold-600 text-stone-950 font-black px-4 py-1.5 rounded-lg transition-colors duration-150 shadow shadow-gold-500/10 flex items-center gap-1"
            >
              <span>ورود به پنل ادمین</span>
            </Link>

            <form action={logoutAdminAction} className="inline-block">
              <button
                type="submit"
                className="p-1.5 text-stone-400 hover:text-red-400 hover:bg-red-500/5 rounded-lg border border-stone-800 transition-all cursor-pointer flex items-center justify-center"
                title="خروج از مدیریت"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (user) {
    const userOrders = getOrdersByPhone(user.phone);
    const pendingUserOrdersCount = userOrders.filter(
      (o) => o.status === "pending",
    ).length;

    return (
      <div
        className="w-full bg-stone-900/85 border-b border-stone-800 text-stone-200 py-2.5 px-4 sticky top-0 z-50 backdrop-blur-md transition-all duration-300 shadow-md"
        dir="rtl"
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 font-sans text-xs">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-1.5 text-stone-300 font-bold">
              <User className="w-3.5 h-3.5 text-gold-500" />
              <span>خوش آمدید،</span>
              <span className="text-stone-100 font-black">{user.name}</span>
            </div>

            {pendingUserOrdersCount > 0 ? (
              <div className="flex items-center gap-1.5 bg-gold-500/10 text-gold-400 px-3 py-1 rounded-full border border-gold-500/20 font-bold animate-pulse">
                <Clock className="w-3.5 h-3.5" />
                <span>سفارش جاری شما در حال آماده‌سازی است</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-stone-400">
                <Award className="w-3.5 h-3.5 text-emerald-500" />
                <span>همراه وفادار کافه راز</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* دکمه بازگشت به صفحه اصلی در پنل کاربری کلاینت */}
            <Link
              href="/"
              className="bg-stone-800 hover:bg-stone-750 text-stone-300 border border-stone-800 hover:border-stone-700 font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5 text-stone-400" />
              <span>صفحه اصلی</span>
            </Link>

            <Link
              href="/profile"
              className="bg-stone-850 hover:bg-stone-800 text-stone-100 border border-stone-800 hover:border-stone-700 font-bold px-4 py-1.5 rounded-lg transition-colors duration-150 flex items-center gap-1"
            >
              <span>مشاهده پیشخوان کاربری</span>
            </Link>

            <form action={logoutUserAction} className="inline-block">
              <button
                type="submit"
                className="p-1.5 text-stone-400 hover:text-red-400 hover:bg-red-500/5 rounded-lg border border-stone-850 transition-all cursor-pointer flex items-center justify-center"
                title="خروج از حساب"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
