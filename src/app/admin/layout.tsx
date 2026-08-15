import React from "react";
import { redirect } from "next/navigation";
import { checkAdminAuth } from "@/actions/admin-auth";
import AdminSidebar from "@/components/features/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = await checkAdminAuth();

  if (!isAuthenticated) {
    redirect("/admin-login");
  }

  return (
    <div
      className="min-h-screen bg-stone-950 text-stone-100 flex flex-row overflow-hidden"
      dir="rtl"
    >
      <AdminSidebar />
      <main className="flex-1 h-screen overflow-y-auto bg-stone-950/40 p-6 lg:p-10">
        {children}
      </main>
    </div>
  );
}
