"use client";

import React from "react";
import { Tag, X } from "lucide-react";
import { CATEGORY_TAGS } from "@/lib/content/content-categories";

interface SpotlightCategoryFilterProps {
  selectedTag: string | null;
  onToggleTag: (tagId: string) => void;
  onClearTag: () => void;
}

export default function SpotlightCategoryFilter({
  selectedTag,
  onToggleTag,
  onClearTag,
}: SpotlightCategoryFilterProps) {
  return (
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
              onClick={() => onToggleTag(tag.id)}
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
            onClick={onClearTag}
            className="px-2.5 py-2 rounded-xl text-xs font-bold text-stone-400 hover:text-red-400 hover:bg-red-500/10 border border-stone-855 transition-all cursor-pointer flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            <span>حذف فیلتر برچسب</span>
          </button>
        )}
      </div>
    </div>
  );
}
