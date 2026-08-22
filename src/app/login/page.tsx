import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";
import UserLoginForm from "@/components/features/auth/UserLoginForm";
import { DEFAULT_SITE_CONTENT } from "@/lib/content/default-content";

export default function UserLoginPage() {
  const { auth } = DEFAULT_SITE_CONTENT;

  return (
    <div
      className="min-h-screen bg-stone-950 flex flex-col justify-center items-center p-4 relative overflow-hidden"
      dir="rtl"
    >
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl" />

      <div className="w-full max-w-md md:max-w-lg bg-stone-900/40 border border-stone-800/80 rounded-3xl p-8 backdrop-blur-md relative z-10 space-y-6">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-gold-500/10 border border-gold-500/20 text-gold-500 flex items-center justify-center text-3xl mx-auto">
            ☕
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-black text-stone-100">
              {auth.loginTitle}
            </h1>
            <p className="text-[11px] text-stone-400">{auth.loginSubtitle}</p>
          </div>
        </div>

        <Suspense
          fallback={
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-gold-500" />
            </div>
          }
        >
          <UserLoginForm />
        </Suspense>
      </div>
    </div>
  );
}
