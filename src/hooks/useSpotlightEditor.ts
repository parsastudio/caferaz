"use client";

import { useState, useTransition, useMemo } from "react";
import { toast } from "sonner";
import { SiteContent } from "@/domain/validations/content.schema";
import {
  flattenContent,
  FlattenedContentItem,
} from "@/lib/content/content-flattener";
import { updateSingleContentKeyAction } from "@/actions/content";
import { isItemMatchingCategory } from "@/lib/content/content-categories";
import { toEnglishDigits } from "@/lib/utils";

interface UseSpotlightEditorProps {
  initialContent: SiteContent;
  product?: {
    id: string;
    name: string;
    description: string;
  } | null;
}

export function useSpotlightEditor({
  initialContent,
  product,
}: UseSpotlightEditorProps) {
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

  const allItems = useMemo<FlattenedContentItem[]>(() => {
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

  const handleClearTag = () => {
    setSelectedTag(null);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
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

  return {
    searchQuery,
    setSearchQuery,
    selectedTag,
    values,
    savedValues,
    savingPath,
    isPending,
    isFilterActive,
    filteredItems,
    handleToggleTag,
    handleClearTag,
    handleClearSearch,
    handleValueChange,
    handleSaveItem,
  };
}
