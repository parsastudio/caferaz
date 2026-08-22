"use client";

import React, { useState, useTransition, useMemo } from "react";
import { Search, X, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateSingleContentKeyAction } from "@/actions/content";
import { SiteContent } from "@/domain/validations/content.schema";
import { flattenContent } from "@/lib/content/content-flattener";
import { Button } from "@/components/ui/button";

interface SpotlightContentEditorProps {
  initialContent: SiteContent;
  product?: {
    id: string;
    name: string;
    description: string;
  } | null;
}

export default function SpotlightContentEditor({
  initialContent,
  product,
}: SpotlightContentEditorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [values, setValues] = useState<Record<string, string>>(() => {
    const flattened = flattenContent(initialContent);
    const initialMap: Record<string, string> = {};
    flattened.forEach((item) => {
      initialMap[item.path] = item.value;
    });

    if (product) {
      initialMap["product.name"] = product.name;
      initialMap["product.description"] = product.description;
    }

    return initialMap;
  });

  const [savingPath, setSavingPath] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const allItems = useMemo(() => {
    const list = flattenContent(initialContent);

    if (product) {
      list.unshift(
        {
          path: "product.name",
          value: product.name,
          isMultiline: false,
        },
        {
          path: "product.description",
          value: product.description,
          isMultiline: true,
        },
      );
    }

    return list;
  }, [initialContent, product]);

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return allItems;
    }

    return allItems.filter((item) => {
      const currentVal = (values[item.path] ?? item.value).toLowerCase();
      const pathStr = item.path.toLowerCase();
      return currentVal.includes(query) || pathStr.includes(query);
    });
  }, [allItems, searchQuery, values]);

  const handleValueChange = (path: string, newVal: string) => {
    setValues((prev) => ({
      ...prev,
      [path]: newVal,
    }));
  };

  const handleSaveItem = (path: string) => {
    const valToSave = values[path] ?? "";
    setSavingPath(path);

    startTransition(async () => {
      try {
        const res = await updateSingleContentKeyAction(
          path,
          valToSave,
          product?.id,
        );
        if (res.success) {
          toast.success(res.message || "تغییرات با موفقیت ذخیره شد.");
        } else {
          toast.error(res.error || "خطا در ثبت تغییرات.");
        }
      } catch {
        toast.error("خطای غیرمنتظره در ارتباط با سرور.");
      } finally {
        setSavingPath(null);
      }
    });
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="bg-stone-900/40 border border-stone-800 p-4 sm:p-6 rounded-3xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gold-500/10 border border-gold-500/20 text-gold-500 flex items-center justify-center">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-stone-100">
                جستجوی آنی و ویرایش مستقیم متون
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                عبارت یا کلمه‌ای که در سایت می‌بینید را جستجو و درجا تغییر دهید.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs font-bold text-stone-400 bg-stone-950 px-3 py-1.5 rounded-xl border border-stone-850 font-sans">
              {filteredItems.length} مورد یافت شد
            </span>
          </div>
        </div>

        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="کلمه یا متن مورد نظر برای تغییر را بنویسید (مثال: ارسال سریع، پشتیبانی، نام کالا...)"
            className="w-full bg-stone-950 border border-stone-800 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 rounded-2xl pr-11 pl-11 py-3.5 text-xs sm:text-sm text-stone-100 outline-none transition-all font-medium placeholder:text-stone-600"
          />
          <Search className="w-5 h-5 text-stone-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />

          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-stone-500 hover:text-stone-300 hover:bg-stone-850 rounded-lg cursor-pointer transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-stone-850 bg-stone-900/10 rounded-2xl space-y-2">
            <p className="text-xs text-stone-400 font-bold">
              متنی مطابق با عبارت «{searchQuery}» پیدا نشد.
            </p>
            <p className="text-[11px] text-stone-600">
              املای عبارت را بررسی کنید یا کلید دیگری را جستجو نمایید.
            </p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isSaving = savingPath === item.path && isPending;
            const currentVal = values[item.path] ?? item.value;

            return (
              <div
                key={item.path}
                className="bg-stone-900/30 border border-stone-850 hover:border-stone-800 p-4 sm:p-5 rounded-2xl transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-850/80 pb-2.5">
                  <span
                    className="text-[11px] font-bold text-gold-400 font-sans tracking-wide bg-gold-500/10 px-2.5 py-0.5 rounded-lg border border-gold-500/20 w-fit"
                    dir="ltr"
                  >
                    {item.path}
                  </span>

                  <span className="text-[10px] text-stone-500 font-medium">
                    {item.path.startsWith("product.")
                      ? "مشخصات محصول (پایگاه داده)"
                      : "تنظیمات محتوا"}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="flex-1">
                    {item.isMultiline ? (
                      <textarea
                        rows={3}
                        value={currentVal}
                        onChange={(e) =>
                          handleValueChange(item.path, e.target.value)
                        }
                        className="w-full bg-stone-950 border border-stone-800 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 rounded-xl p-3 text-xs sm:text-sm text-stone-100 outline-none resize-none leading-relaxed transition-all font-medium"
                      />
                    ) : (
                      <input
                        type="text"
                        value={currentVal}
                        onChange={(e) =>
                          handleValueChange(item.path, e.target.value)
                        }
                        className="w-full bg-stone-950 border border-stone-800 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-stone-100 outline-none transition-all font-medium"
                      />
                    )}
                  </div>

                  <Button
                    onClick={() => handleSaveItem(item.path)}
                    disabled={isSaving}
                    className="bg-gold-500 hover:bg-gold-600 text-stone-950 font-black px-5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0 self-end sm:self-auto h-10"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        در حال ذخیره...
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        ذخیره تغییر
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
