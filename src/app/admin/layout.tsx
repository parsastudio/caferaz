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
      className="min-h-screen bg-stone-950 text-stone-100 flex flex-col md:flex-row overflow-x-hidden"
      dir="rtl"
    >
      <AdminSidebar />
      <main className="flex-1 min-w-0 min-h-screen overflow-y-auto bg-stone-950/40 p-3.5 sm:p-6 lg:p-10 pb-12 md:pb-10">
        {children}
      </main>
    </div>
  );
}
