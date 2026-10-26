"use client";

import React, { useEffect, useState } from "react";
import {
  getGlobalStatusBarDataAction,
  GlobalStatusBarData,
} from "@/actions/user-auth";
import AdminStatusBar from "@/components/layout/AdminStatusBar";
import UserStatusBar from "@/components/layout/UserStatusBar";

export default function GlobalStatusBar() {
  const [status, setStatus] = useState<GlobalStatusBarData | null>(null);

  useEffect(() => {
    getGlobalStatusBarDataAction().then((res) => {
      if (res.success && res.data) {
        setStatus(res.data);
      }
    });
  }, []);

  if (!status || status.type === "none") {
    return null;
  }

  if (status.type === "admin") {
    return (
      <AdminStatusBar
        monthSales={status.data.monthSales}
        pendingOrdersCount={status.data.pendingOrdersCount}
        pendingCommentsCount={status.data.pendingCommentsCount}
      />
    );
  }

  if (status.type === "user") {
    return (
      <UserStatusBar
        user={status.data.user}
        pendingUserOrdersCount={status.data.pendingUserOrdersCount}
      />
    );
  }

  return null;
}
