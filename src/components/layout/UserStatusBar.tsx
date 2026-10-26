import React from "react";
import Link from "next/link";
import { logoutUserAction } from "@/actions/user-auth";
import { User, Award, Clock, Home, LogOut } from "lucide-react";
import { User as UserType } from "@/domain/types";
import { DEFAULT_SITE_CONTENT } from "@/lib/content/default-content";

interface UserStatusBarProps {
  user: UserType;
  pendingUserOrdersCount: number;
}

export default function UserStatusBar({
  user,
  pendingUserOrdersCount,
}: UserStatusBarProps) {
  const { layout } = DEFAULT_SITE_CONTENT;

  return (
    <div
      className="w-full bg-stone-900/85 border-b border-stone-800 text-stone-200 py-3 px-4 sticky top-0 z-50 backdrop-blur-md transition-all duration-300 shadow-md"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 font-sans text-xs">
        <div className="flex flex-col md:hidden w-full gap-3">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1.5 text-stone-300 font-bold">
              <User className="w-3.5 h-3.5 text-gold-500" />
              <span>{layout.welcomeText}</span>
              <span className="text-stone-100 font-black">{user.name}</span>
            </div>

            {pendingUserOrdersCount > 0 ? (
              <div className="flex items-center gap-1 bg-gold-500/10 text-gold-400 px-2 py-0.5 rounded-full border border-gold-500/20 text-[10px] font-bold animate-pulse">
                <Clock className="w-3 h-3" />
                <span>{layout.currentOrderText}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-stone-400 text-[10px] font-bold">
                <Award className="w-3.5 h-3.5 text-emerald-500" />
                <span>{layout.loyalCustomerText}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2.5 border-t border-stone-800/60 w-full">
            <Link
              href="/"
              className="bg-stone-850 hover:bg-stone-800 text-stone-300 border border-stone-800 hover:border-stone-700 font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 text-[11px]"
            >
              <Home className="w-3.5 h-3.5 text-stone-400" />
              <span>{layout.homeButton}</span>
            </Link>

            <Link
              href="/profile"
              className="bg-stone-850 hover:bg-stone-800 text-stone-100 border border-stone-800 hover:border-stone-700 font-bold px-4 py-1.5 rounded-lg transition-colors duration-150 flex items-center gap-1 text-[11px]"
            >
              <span>{layout.profileButton}</span>
            </Link>

            <form action={logoutUserAction} className="inline-block">
              <button
                type="submit"
                className="p-1.5 text-stone-400 hover:text-red-400 hover:bg-red-500/5 rounded-lg border border-stone-855 transition-all cursor-pointer flex items-center justify-center"
                title={layout.logoutTitle}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        <div className="hidden md:flex md:flex-row md:items-center md:justify-between w-full">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5 text-stone-300 font-bold">
              <User className="w-3.5 h-3.5 text-gold-500" />
              <span>{layout.welcomeText}</span>
              <span className="text-stone-100 font-black">{user.name}</span>
            </div>

            {pendingUserOrdersCount > 0 ? (
              <div className="flex items-center gap-1.5 bg-gold-500/10 text-gold-400 px-3 py-1 rounded-full border border-gold-500/20 font-bold animate-pulse">
                <Clock className="w-3.5 h-3.5" />
                <span>{layout.currentOrderAlertText}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-stone-400">
                <Award className="w-3.5 h-3.5 text-emerald-500" />
                <span>{layout.loyalCustomerText}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="bg-stone-800 hover:bg-stone-750 text-stone-300 border border-stone-800 hover:border-stone-700 font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5 text-stone-400" />
              <span>{layout.homeButton}</span>
            </Link>

            <Link
              href="/profile"
              className="bg-stone-850 hover:bg-stone-800 text-stone-100 border border-stone-800 hover:border-stone-700 font-bold px-4 py-1.5 rounded-lg transition-colors duration-150 flex items-center gap-1"
            >
              <span>{layout.profileButton}</span>
            </Link>

            <form action={logoutUserAction} className="inline-block">
              <button
                type="submit"
                className="p-1.5 text-stone-400 hover:text-red-400 hover:bg-red-500/5 rounded-lg border border-stone-855 transition-all cursor-pointer flex items-center justify-center"
                title={layout.logoutTitle}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
