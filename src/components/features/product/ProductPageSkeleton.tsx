import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductPageSkeleton() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12" dir="rtl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-5 space-y-6">
          <Skeleton className="aspect-square w-full rounded-3xl bg-stone-900/80" />
          <div className="grid grid-cols-3 gap-2">
            <Skeleton className="h-16 rounded-2xl bg-stone-900/50" />
            <Skeleton className="h-16 rounded-2xl bg-stone-900/50" />
            <Skeleton className="h-16 rounded-2xl bg-stone-900/50" />
          </div>
        </div>

        <div className="lg:col-span-7 space-y-8 lg:pl-2">
          <div className="space-y-3">
            <Skeleton className="h-9 w-3/4 rounded-xl bg-stone-900/80" />
            <Skeleton className="h-4 w-full rounded-lg bg-stone-900/50" />
            <Skeleton className="h-4 w-5/6 rounded-lg bg-stone-900/50" />
          </div>

          <div className="space-y-3.5">
            <Skeleton className="h-5 w-40 rounded-lg bg-stone-900/70" />
            <div className="flex flex-wrap gap-2.5">
              <Skeleton className="h-12 w-24 rounded-xl bg-stone-900/60" />
              <Skeleton className="h-12 w-24 rounded-xl bg-stone-900/60" />
              <Skeleton className="h-12 w-24 rounded-xl bg-stone-900/60" />
              <Skeleton className="h-12 w-24 rounded-xl bg-stone-900/60" />
            </div>
          </div>

          <div className="space-y-3.5">
            <Skeleton className="h-5 w-48 rounded-lg bg-stone-900/70" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Skeleton className="h-20 rounded-2xl bg-stone-900/60" />
              <Skeleton className="h-20 rounded-2xl bg-stone-900/60" />
            </div>
          </div>

          <div className="space-y-3.5">
            <Skeleton className="h-5 w-36 rounded-lg bg-stone-900/70" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Skeleton className="h-16 rounded-xl bg-stone-900/60" />
              <Skeleton className="h-16 rounded-xl bg-stone-900/60" />
              <Skeleton className="h-16 rounded-xl bg-stone-900/60" />
            </div>
          </div>

          <Skeleton className="h-16 w-full rounded-2xl bg-stone-900/60" />
          <Skeleton className="h-32 w-full rounded-3xl bg-stone-900/70" />
        </div>
      </div>
    </div>
  );
}
