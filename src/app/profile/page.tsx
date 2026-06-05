import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProfileDashboardClient from "@/components/features/profile/ProfileDashboardClient";
import { verifySignedToken } from "@/lib/session";

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const signedCookie = cookieStore.get("user_phone")?.value;

  if (!signedCookie) {
    redirect("/login");
  }

  const phone = verifySignedToken(signedCookie);

  if (!phone) {
    redirect("/login");
  }

  const userDb = await prisma.user.findUnique({
    where: { phone: phone.trim() },
  });

  const user = userDb
    ? {
        id: userDb.id,
        name: userDb.name,
        phone: userDb.phone,
        createdAt: userDb.createdAt.toISOString(),
        address: userDb.address ?? undefined,
      }
    : null;

  const ordersDb = await prisma.order.findMany({
    where: { customerPhone: phone.trim() },
    include: { orderItems: true },
    orderBy: { createdAt: "desc" },
  });

  const orders = ordersDb.map((o) => {
    const firstItem = o.orderItems?.[0] || {
      productId: "prod_coffee_bulk_01",
      weightGrams: 250,
      quantity: 1,
      grindType:
        "ترکیب: ۵۰٪ روبوستا / ۵۰٪ عربیکا | آسیاب: دانه کامل (آسیاب نشده)",
    };

    return {
      id: o.id,
      productId: firstItem.productId,
      weightGrams: firstItem.weightGrams,
      quantity: firstItem.quantity,
      grindType: firstItem.grindType,
      finalPrice: o.finalPrice,
      customerName: o.customerName,
      customerPhone: o.customerPhone,
      customerAddress: o.customerAddress,
      createdAt: o.createdAt.toISOString(),
      status: o.status as "unreviewed" | "pending" | "completed" | "cancelled",
    };
  });

  return (
    <main className="min-h-screen bg-stone-950 text-stone-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <ProfileDashboardClient user={user} initialOrders={orders} />
      </div>
    </main>
  );
}
