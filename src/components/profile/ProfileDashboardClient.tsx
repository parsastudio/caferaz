"use client";

import React, { useState, useTransition } from "react";
import { User, Order } from "@/lib/mock-db";
import { logoutUserAction } from "@/actions/auth";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  Coffee,
  MapPin,
  PhoneCall,
  LogOut,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "../ui/card";
import { Badge } from "../ui/badge";

interface ProfileDashboardClientProps {
  user: User | null;
  initialOrders: Order[];
}

export default function ProfileDashboardClient({
  user,
  initialOrders,
}: ProfileDashboardClientProps) {
  const [orders] = useState<Order[]>(initialOrders);
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutUserAction();
    });
  };

  const latestOrder = orders[0];

  return (
    <div className="space-y-8" dir="rtl">
      <div className="bg-stone-900/30 border border-stone-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gold-500/10 border border-gold-500/20 text-gold-500 flex items-center justify-center text-2xl font-black">
            ☕
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black text-stone-100">
                سلام {user?.name || "کاربر گرامی"}، خوش آمدید
              </h1>
              <Badge className="bg-gold-500/10 text-gold-400 border-gold-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full">
                پنل کاربری راز
              </Badge>
            </div>
            <p
              className="text-xs text-stone-400 font-medium font-sans"
              dir="rtl"
            >
              شماره همراه: <span className="font-sans">{user?.phone}</span> |
              تاریخ پیوستن:{" "}
              <span className="font-sans">
                {user
                  ? new Date(user.createdAt).toLocaleDateString("fa-IR")
                  : "-"}
              </span>
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          disabled={isPending}
          className="text-xs text-red-400 hover:bg-red-500/5 hover:text-red-300 border border-stone-800 hover:border-red-500/20 px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <LogOut className="w-4 h-4" />
          )}
          <span>خروج از حساب</span>
        </button>
      </div>

      {latestOrder && latestOrder.status === "pending" && (
        <Card className="border-gold-500/20 bg-stone-900/20 relative overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-r from-gold-500/5 to-transparent pointer-events-none" />

          <CardHeader className="pb-4">
            <CardTitle className="text-base font-black text-stone-100 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-gold-500 animate-pulse" />
              وضعیت سفارش جاری:{" "}
              <span className="font-sans text-gold-500">{latestOrder.id}</span>
            </CardTitle>
            <CardDescription className="text-xs text-stone-400">
              فرآیند آماده‌سازی بر اساس ترکیب دانه‌ قهوه انتخابی شما
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-stone-950/60 border border-stone-850 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5 text-right"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gold-500/10 text-gold-400 flex items-center justify-center shrink-0">
                  <Coffee className="w-5 h-5 animate-bounce" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-black text-gold-400 block">
                    سفارش شما در حال آماده‌سازی است
                  </span>
                  <p className="text-[11px] text-stone-300 leading-relaxed max-w-2xl">
                    سفارش شما در صف آماده‌سازی کارگاه کافه راز قرار دارد و به
                    زودی جهت هماهنگی ارسال با شما تماس خواهیم گرفت. از شکیبایی
                    شما سپاسگزاریم.
                  </p>
                </div>
              </div>

              <div className="bg-gold-500/10 border border-gold-500/20 px-4 py-2.5 rounded-xl flex items-center gap-2 text-gold-400 text-xs font-black self-end md:self-auto shrink-0">
                <PhoneCall className="w-4 h-4 animate-pulse" />
                تماس هماهنگی به زودی
              </div>
            </motion.div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-gold-500" />
          <h2 className="text-base font-black text-stone-200">
            تاریخچه فاکتورها ({orders.length})
          </h2>
        </div>

        {orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-stone-900/20 border border-stone-850 p-5 rounded-2xl space-y-4 text-right"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-850 pb-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs font-black text-gold-500 font-sans">
                      {order.id}
                    </span>
                    <span className="text-[10px] text-stone-500 font-sans">
                      {new Date(order.createdAt).toLocaleDateString("fa-IR")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {order.status === "completed" ? (
                      <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                        تکمیل و تسویه شده
                      </Badge>
                    ) : (
                      <Badge className="bg-gold-500/10 text-gold-500 border-gold-500/20 text-[10px] font-bold px-2.5 py-0.5 rounded-full animate-pulse">
                        در حال آماده‌سازی
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-bold text-stone-300">
                  <div className="space-y-1">
                    <span className="text-[10px] text-stone-500 block">
                      مشخصات فنی و ترکیب:
                    </span>
                    <p className="text-stone-200">{order.grindType}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-stone-500 block">
                      بسته‌بندی و تعداد:
                    </span>
                    <p className="text-stone-200 font-sans">
                      {order.weightGrams} گرم (تعداد: {order.quantity} بسته)
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-stone-500 block">
                      کل مبلغ فاکتور:
                    </span>
                    <p className="text-gold-500 font-black text-sm font-sans">
                      {order.finalPrice.toLocaleString()} تومان
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-1.5 bg-stone-950/40 p-3 rounded-xl border border-stone-900">
                  <MapPin className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
                  <span className="text-[10px] text-stone-400 leading-relaxed font-medium">
                    آدرس ارسال: {order.customerAddress}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-stone-850 rounded-2xl bg-stone-900/10">
            <p className="text-xs text-stone-500">
              تاکنون فاکتوری برای این حساب کاربری ثبت نشده است.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
