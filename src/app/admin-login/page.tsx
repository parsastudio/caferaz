"use client";

import React, { useState, useTransition, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginAdminAction } from "@/actions/auth";
import { Lock, User, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") || "/admin";

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        const result = await loginAdminAction(formData);
        if (result.success) {
          router.push(callbackUrl);
          router.refresh();
        } else {
          setError(result.error || "خطایی رخ داد.");
        }
      } catch (err) {
        setError("خطای غیرمنتظره در ارتباط با سرور رخ داد.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5 text-right">
        <label className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-stone-500" />
          نام کاربری
        </label>
        <input
          type="text"
          name="username"
          required
          placeholder="admin"
          className="w-full bg-stone-950 border border-stone-800 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 rounded-xl px-4 py-3 text-sm text-stone-100 outline-none transition-all text-right"
        />
      </div>

      <div className="space-y-1.5 text-right">
        <label className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-stone-500" />
          رمز عبور
        </label>
        <input
          type="password"
          name="password"
          required
          placeholder="••••••••"
          className="w-full bg-stone-950 border border-stone-800 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 rounded-xl px-4 py-3 text-sm text-stone-100 outline-none transition-all text-left"
          dir="ltr"
        />
      </div>

      {error && (
        <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-3.5 rounded-xl flex items-center gap-2 text-right">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="pt-2">
        <Button
          type="submit"
          disabled={isPending}
          className="w-full py-6 text-sm font-black rounded-xl bg-gold-500 hover:bg-gold-600 text-stone-950 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              درحال ورود به سیستم...
            </>
          ) : (
            "ورود به مدیریت"
          )}
        </Button>
      </div>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div
      className="min-h-screen bg-stone-950 flex flex-col justify-center items-center p-4 relative overflow-hidden"
      dir="rtl"
    >
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl" />

      <div className="w-full max-w-md bg-stone-900/40 border border-stone-800/80 rounded-3xl p-8 backdrop-blur-md relative z-10 space-y-6">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-gold-500/10 border border-gold-500/20 text-gold-500 flex items-center justify-center text-3xl mx-auto">
            ☕
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-black text-stone-100">
              ورود به پنل مدیریت
            </h1>
            <p className="text-[11px] text-stone-400">
              لطفاً نام کاربری و رمز عبور خود را وارد کنید
            </p>
          </div>
        </div>

        <Suspense
          fallback={
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-gold-500" />
            </div>
          }
        >
          <AdminLoginForm />
        </Suspense>
      </div>
    </div>
  );
}
