import React from "react";
import { checkAdminAuth } from "@/actions/admin-auth";
import { getCurrentUserAction } from "@/actions/user-auth";
import { prisma } from "@/lib/prisma";
import AdminStatusBar from "@/components/layout/AdminStatusBar";
import UserStatusBar from "@/components/layout/UserStatusBar";

export default async function GlobalStatusBar() {
  const isAdmin = await checkAdminAuth();
  const userRes = await getCurrentUserAction();
  const user = userRes.success ? userRes.user : null;

  if (!isAdmin && !user) {
    return null;
  }

  if (isAdmin) {
    const pendingCommentsCount = await prisma.comment.count({
      where: { status: "pending" },
    });

    const pendingOrdersCount = await prisma.order.count({
      where: { status: "unreviewed" },
    });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
    );

    const monthSalesAggregate = await prisma.order.aggregate({
      _sum: {
        finalPrice: true,
      },
      where: {
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });
    const monthSales = monthSalesAggregate._sum.finalPrice ?? 0;

    return (
      <AdminStatusBar
        monthSales={monthSales}
        pendingOrdersCount={pendingOrdersCount}
        pendingCommentsCount={pendingCommentsCount}
      />
    );
  }

  if (user) {
    const pendingUserOrdersCount = await prisma.order.count({
      where: {
        customerPhone: user.phone,
        status: "pending",
      },
    });

    return (
      <UserStatusBar
        user={user}
        pendingUserOrdersCount={pendingUserOrdersCount}
      />
    );
  }

  return null;
}
