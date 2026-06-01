import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUserByPhone, getOrdersByPhone } from "@/lib/mock-db";
import ProfileDashboardClient from "@/components/features/profile/ProfileDashboardClient";

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const phone = cookieStore.get("user_phone")?.value;

  if (!phone) {
    redirect("/login");
  }

  const user = getUserByPhone(phone);
  const orders = getOrdersByPhone(phone);

  return (
    <main className="min-h-screen bg-stone-950 text-stone-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <ProfileDashboardClient user={user} initialOrders={orders} />
      </div>
    </main>
  );
}
