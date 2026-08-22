"use client";

import React, { useState, useTransition, useMemo } from "react";
import { Search, X, Check, Loader2, Tag, Layers } from "lucide-react";
import { toast } from "sonner";
import { updateSingleContentKeyAction } from "@/actions/content";
import { SiteContent } from "@/domain/validations/content.schema";
import { flattenContent } from "@/lib/content/content-flattener";
import { Button } from "@/components/ui/button";
import { toEnglishDigits } from "@/lib/utils";

interface SpotlightContentEditorProps {
  initialContent: SiteContent;
  product?: {
    id: string;
    name: string;
    description: string;
  } | null;
}

interface ContentCategoryTag {
  id: string;
  label: string;
  emoji: string;
}

const CATEGORY_TAGS: ContentCategoryTag[] = [
  { id: "product_basic", label: "مشخصات کالا", emoji: "☕" },
  { id: "layout", label: "عمومی و فوتر", emoji: "⚙️" },
  { id: "hero", label: "بخش هیرو", emoji: "✨" },
  { id: "config", label: "شخصی‌سازی قهوه", emoji: "🎛️" },
  { id: "whyUs", label: "مزایای کافه راز", emoji: "💎" },
  { id: "checkout", label: "تسویه و سبد خرید", emoji: "🛍️" },
  { id: "auth", label: "ورود و ثبت‌نام", emoji: "🔑" },
  { id: "profile", label: "پیشخوان کاربری", emoji: "👤" },
  { id: "error", label: "پیام‌های خطا و سیستم", emoji: "⚠️" },
];

function isItemMatchingCategory(path: string, categoryId: string): boolean {
  switch (categoryId) {
    case "product_basic":
      return path === "product.name" || path === "product.description";
    case "layout":
      return path.startsWith("layout.");
    case "hero":
      return path.startsWith("hero.") || path.startsWith("faqHeader.");
    case "config":
      return (
        path.startsWith("product.") &&
        path !== "product.name" &&
        path !== "product.description"
      );
    case "whyUs":
      return path.startsWith("whyUs.");
    case "checkout":
      return path.startsWith("checkout.");
    case "auth":
      return path.startsWith("auth.");
    case "profile":
      return path.startsWith("profile.");
    case "error":
      return path.startsWith("error.");
    default:
      return true;
  }
}

export default function SpotlightContentEditor({
  initialContent,
  product,
}: SpotlightContentEditorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const [savedValues, setSavedValues] = useState<Record<string, string>>(() => {
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

  const [values, setValues] = useState<Record<string, string>>(savedValues);
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

  const cleanQuery = searchQuery.trim();
  const isSearchActive = cleanQuery.length >= 3;
  const isFilterActive = isSearchActive || selectedTag !== null;

  const filteredItems = useMemo(() => {
    if (!isFilterActive) {
      return [];
    }

    const rawQuery = cleanQuery.toLowerCase();
    const normalizedQuery = toEnglishDigits(rawQuery);

    return allItems.filter((item) => {
      const isDirty =
        (values[item.path] ?? item.value) !==
        (savedValues[item.path] ?? item.value);

      if (isDirty) {
        return true;
      }

      if (selectedTag && !isItemMatchingCategory(item.path, selectedTag)) {
        return false;
      }

      if (!isSearchActive) {
        return true;
      }

      const baseVal = (savedValues[item.path] ?? item.value).toLowerCase();
      const normalizedBaseVal = toEnglishDigits(baseVal);
      const pathStr = item.path.toLowerCase();

      return (
        baseVal.includes(rawQuery) ||
        normalizedBaseVal.includes(normalizedQuery) ||
        pathStr.includes(rawQuery) ||
        pathStr.includes(normalizedQuery)
      );
    });
  }, [
    allItems,
    cleanQuery,
    isSearchActive,
    isFilterActive,
    selectedTag,
    savedValues,
    values,
  ]);

  const handleToggleTag = (tagId: string) => {
    setSelectedTag((prev) => (prev === tagId ? null : tagId));
  };

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
          setSavedValues((prev) => ({
            ...prev,
            [path]: valToSave,
          }));
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
      <div className="bg-stone-900/40 border border-stone-800 p-4 sm:p-6 rounded-3xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gold-500/10 border border-gold-500/20 text-gold-500 flex items-center justify-center">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-stone-100">
                جستجوی آنی و فیلتر برچسبی متون
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                عبارت را جستجو کنید یا یکی از برچسب‌های زیر را برای نمایش سریع
                انتخاب فرمایید.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {isFilterActive && (
              <span className="text-xs font-bold text-stone-400 bg-stone-950 px-3 py-1.5 rounded-xl border border-stone-850 font-sans animate-in fade-in duration-150">
                {filteredItems.length} مورد یافت شد
              </span>
            )}
          </div>
        </div>

        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجوی متن یا کلید (مثال: ۰۹۰۰، ارسال سریع، ایتا، قهوه...)"
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

        <div className="pt-1 border-t border-stone-800/60 space-y-2.5">
          <span className="text-[11px] font-bold text-stone-400 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-gold-500" />
            فیلتر سریع بر اساس برچسب بخش‌های سایت:
          </span>

          <div className="flex flex-wrap items-center gap-2">
            {CATEGORY_TAGS.map((tag) => {
              const isSelected = selectedTag === tag.id;

              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleToggleTag(tag.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 select-none border ${
                    isSelected
                      ? "bg-gold-500 text-stone-950 border-gold-500 font-black shadow-md shadow-gold-500/15 scale-105"
                      : "bg-stone-950/80 hover:bg-stone-900 border-stone-800 text-stone-300 hover:text-gold-400 hover:border-gold-500/30"
                  }`}
                >
                  <span className="text-sm">{tag.emoji}</span>
                  <span>{tag.label}</span>
                </button>
              );
            })}

            {selectedTag && (
              <button
                type="button"
                onClick={() => setSelectedTag(null)}
                className="px-2.5 py-2 rounded-xl text-xs font-bold text-stone-400 hover:text-red-400 hover:bg-red-500/10 border border-stone-850 transition-all cursor-pointer flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>حذف فیلتر برچسب</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {!isFilterActive ? (
          <div className="text-center py-16 border border-dashed border-stone-850/80 bg-stone-900/10 rounded-3xl p-8 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-gold-500/10 border border-gold-500/20 text-gold-500 flex items-center justify-center mx-auto">
              <Layers className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-stone-300">
              برای ویرایش، کلمه مورد نظر را جستجو کنید یا یکی از برچسب‌های بالا
              را انتخاب نمایید.
            </p>
            <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
              با انتخاب هر برچسب، تمامی عبارات و متون مربوط به آن بخش از سایت
              یکجا نمایش داده خواهند شد.
            </p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-stone-850 bg-stone-900/10 rounded-3xl p-8 space-y-2">
            <p className="text-xs text-stone-400 font-bold">
              متنی مطابق با فیلتر یا عبارت انتخابی پیدا نشد.
            </p>
            <p className="text-[11px] text-stone-600">
              عبارت جستجو را تغییر دهید یا برچسب دیگری را انتخاب نمایید.
            </p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isSaving = savingPath === item.path && isPending;
            const currentVal = values[item.path] ?? item.value;
            const originalVal = savedValues[item.path] ?? item.value;
            const isDirty = currentVal !== originalVal;

            return (
              <div
                key={item.path}
                className={`bg-stone-900/30 border p-4 sm:p-5 rounded-2xl transition-all space-y-3 animate-in fade-in duration-150 ${
                  isDirty
                    ? "border-gold-500/40 bg-gold-500/5 shadow-lg shadow-gold-500/5"
                    : "border-stone-850 hover:border-stone-800"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-850/80 pb-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="text-[11px] font-bold text-gold-400 font-sans tracking-wide bg-gold-500/10 px-2.5 py-0.5 rounded-lg border border-gold-500/20 w-fit"
                      dir="ltr"
                    >
                      {item.path}
                    </span>

                    {isDirty && (
                      <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold animate-pulse">
                        تغییر ذخیره‌نشده
                      </span>
                    )}
                  </div>

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
                        className={`w-full bg-stone-950 border rounded-xl p-3 text-xs sm:text-sm text-stone-100 outline-none resize-none leading-relaxed transition-all font-medium ${
                          isDirty
                            ? "border-gold-500/50 focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
                            : "border-stone-800 focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
                        }`}
                      />
                    ) : (
                      <input
                        type="text"
                        value={currentVal}
                        onChange={(e) =>
                          handleValueChange(item.path, e.target.value)
                        }
                        className={`w-full bg-stone-950 border rounded-xl px-4 py-2.5 text-xs sm:text-sm text-stone-100 outline-none transition-all font-medium ${
                          isDirty
                            ? "border-gold-500/50 focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
                            : "border-stone-800 focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
                        }`}
                      />
                    )}
                  </div>

                  <Button
                    onClick={() => handleSaveItem(item.path)}
                    disabled={isSaving || !isDirty}
                    className={`font-black px-5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0 self-end sm:self-auto h-10 transition-all ${
                      isDirty
                        ? "bg-gold-500 hover:bg-gold-600 text-stone-950 shadow-md shadow-gold-500/10"
                        : "bg-stone-800 text-stone-400 opacity-60 cursor-not-allowed"
                    }`}
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
