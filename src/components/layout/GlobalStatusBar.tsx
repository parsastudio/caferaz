import React from "react";
import { checkAdminAuth } from "@/actions/admin-auth";
import { getCurrentUserAction } from "@/actions/user-auth";
import { OrderService } from "@/services/order.service";
import { CommentService } from "@/services/comment.service";
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
    const pendingCommentsCount = await CommentService.getPendingCommentsCount();
    const { monthSales, pendingOrdersCount } =
      await OrderService.getAdminStatusBarMetrics();

    return (
      <AdminStatusBar
        monthSales={monthSales}
        pendingOrdersCount={pendingOrdersCount}
        pendingCommentsCount={pendingCommentsCount}
      />
    );
  }

  if (user) {
    const pendingUserOrdersCount = await OrderService.getPendingUserOrdersCount(
      user.phone,
    );

    return (
      <UserStatusBar
        user={user}
        pendingUserOrdersCount={pendingUserOrdersCount}
      />
    );
  }

  return null;
}
