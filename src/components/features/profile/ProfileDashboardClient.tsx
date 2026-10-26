"use client";

import React, { useState, useTransition } from "react";
import { User, Order } from "@/domain/types";
import { logoutUserAction } from "@/actions/user-auth";
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
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSiteContent } from "@/context/ContentContext";
import { formatPersianNumber, toPersianDigits } from "@/lib/utils";

interface ProfileDashboardClientProps {
  user: User | null;
  initialOrders: Order[];
}

export default function ProfileDashboardClient({
  user,
  initialOrders,
}: ProfileDashboardClientProps) {
  const { profile: pCopy } = useSiteContent();
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
                {pCopy.greetingPrefix} {user?.name || pCopy.defaultUserName}
              </h1>
              <Badge className="bg-gold-500/10 text-gold-400 border-gold-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {pCopy.userPanelBadge}
              </Badge>
            </div>
            <p
              className="text-xs text-stone-400 font-medium font-sans"
              dir="rtl"
            >
              {pCopy.phoneLabel}{" "}
              <span className="font-sans">{toPersianDigits(user?.phone || "")}</span> |{" "}
              {pCopy.joinDateLabel}{" "}
              <span className="font-sans" suppressHydrationWarning>
                {user
                  ? toPersianDigits(new Date(user.createdAt).toLocaleDateString("fa-IR"))
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
          <span>{pCopy.logoutButton}</span>
        </button>
      </div>

      {latestOrder &&
        (latestOrder.status === "pending" ||
          latestOrder.status === "unreviewed") && (
          <Card className="border-gold-500/20 bg-stone-900/20 relative overflow-hidden rounded-3xl">
            <div className="absolute inset-0 bg-gradient-to-r from-gold-500/5 to-transparent pointer-events-none" />

            <CardHeader className="pb-4">
              <CardTitle className="text-base font-black text-stone-100 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-gold-500 animate-pulse" />
                {pCopy.activeOrderTitle}{" "}
                <span className="font-sans text-gold-500">
                  {latestOrder.id}
                </span>
              </CardTitle>
              <CardDescription className="text-xs text-stone-400">
                {pCopy.activeOrderSubtitle}
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
                      {latestOrder.status === "unreviewed"
                        ? pCopy.activeOrderUnreviewed
                        : pCopy.activeOrderPending}
                    </span>
                    <p className="text-[11px] text-stone-300 leading-relaxed max-w-2xl">
                      {pCopy.activeOrderDesc}
                    </p>
                  </div>
                </div>

                <div className="bg-gold-500/10 border border-gold-500/20 px-4 py-2.5 rounded-xl flex items-center gap-2 text-gold-400 text-xs font-black self-end md:self-auto shrink-0">
                  <PhoneCall className="w-4 h-4 animate-pulse" />
                  {pCopy.coordinationCallBadge}
                </div>
              </motion.div>
            </CardContent>
          </Card>
        )}

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-gold-500" />
          <h2 className="text-base font-black text-stone-200">
            {pCopy.invoiceHistoryTitle} ({toPersianDigits(orders.length)})
          </h2>
        </div>

        {orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-stone-900/20 border border-stone-855 p-5 rounded-2xl space-y-4 text-right"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-850 pb-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs font-black text-gold-500 font-sans">
                      {order.id}
                    </span>
                    <span
                      className="text-[10px] text-stone-500 font-sans"
                      suppressHydrationWarning
                    >
                      {new Date(order.createdAt).toLocaleDateString("fa-IR")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {order.status === "completed" && (
                      <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                        {pCopy.statusCompleted}
                      </Badge>
                    )}
                    {order.status === "pending" && (
                      <Badge className="bg-gold-500/10 text-gold-500 border-gold-500/20 text-[10px] font-bold px-2.5 py-0.5 rounded-full animate-pulse">
                        {pCopy.statusPending}
                      </Badge>
                    )}
                    {order.status === "unreviewed" && (
                      <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-[10px] font-bold px-2.5 py-0.5 rounded-full animate-pulse">
                        {pCopy.statusUnreviewed}
                      </Badge>
                    )}
                    {order.status === "cancelled" && (
                      <Badge className="bg-stone-500/10 text-stone-400 border-stone-500/20 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                        {pCopy.statusCancelled}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-bold text-stone-300">
                  <div className="space-y-1">
                    <span className="text-[10px] text-stone-500 block">
                      {pCopy.invoiceBlendSpecs}
                    </span>
                    <p className="text-stone-200">{order.grindType}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-stone-500 block">
                      {pCopy.invoicePackagingSpecs}
                    </span>
                    <p className="text-stone-200 font-sans">
                      {formatPersianNumber(order.weightGrams)} گرم (تعداد: {toPersianDigits(order.quantity)} بسته)
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-stone-500 block">
                      {pCopy.invoiceTotalPrice}
                    </span>
                    <p className="text-gold-500 font-black text-sm font-sans">
                      {formatPersianNumber(order.finalPrice)} تومان
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-1.5 bg-stone-950/40 p-3 rounded-xl border border-stone-900">
                  <MapPin className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
                  <span className="text-[10px] text-stone-400 leading-relaxed font-medium">
                    {pCopy.invoiceDeliveryAddress} {order.customerAddress}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-stone-850 rounded-2xl bg-stone-900/10">
            <p className="text-xs text-stone-500">{pCopy.emptyHistoryText}</p>
          </div>
        )}
      </div>
    </div>
  );
}
