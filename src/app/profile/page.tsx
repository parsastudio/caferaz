import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ProfileDashboardClient from "@/components/features/profile/ProfileDashboardClient";
import { verifyScopedToken } from "@/lib/session";
import { ContentProvider } from "@/context/ContentContext";
import { ContentService } from "@/services/content.service";
import { AuthService } from "@/services/auth.service";
import { OrderService } from "@/services/order.service";
import { DEFAULT_SITE_CONTENT } from "@/lib/content/default-content";

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const signedCookie = cookieStore.get("user_phone")?.value;

  if (!signedCookie) {
    redirect("/login");
  }

  const phone = verifyScopedToken("user", signedCookie);

  if (!phone) {
    redirect("/login");
  }

  let siteContent = DEFAULT_SITE_CONTENT;
  try {
    siteContent = await ContentService.getSiteContent();
  } catch (err) {
    console.warn("Content service fallback in profile", err);
  }

  const user = await AuthService.getUserByPhone(phone);
  const orders = await OrderService.getUserOrders(phone);

  return (
    <ContentProvider content={siteContent}>
      <main className="min-h-screen bg-stone-950 text-stone-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <ProfileDashboardClient user={user} initialOrders={orders} />
        </div>
      </main>
    </ContentProvider>
  );
}
