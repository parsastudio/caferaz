"use client";

import React from "react";
import { SiteContent } from "@/domain/validations/content.schema";
import { useSpotlightEditor } from "@/hooks/useSpotlightEditor";
import SpotlightSearchHeader from "@/components/features/admin/settings/spotlight/SpotlightSearchHeader";
import SpotlightCategoryFilter from "@/components/features/admin/settings/spotlight/SpotlightCategoryFilter";
import SpotlightItemCard from "@/components/features/admin/settings/spotlight/SpotlightItemCard";
import SpotlightEmptyState from "@/components/features/admin/settings/spotlight/SpotlightEmptyState";

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
  const {
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
  } = useSpotlightEditor({ initialContent, product });

  return (
    <div className="space-y-6" dir="rtl">
      <div className="bg-stone-900/40 border border-stone-800 p-4 sm:p-6 rounded-3xl space-y-5">
        <SpotlightSearchHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onClearSearch={handleClearSearch}
          isFilterActive={isFilterActive}
          matchCount={filteredItems.length}
        />

        <SpotlightCategoryFilter
          selectedTag={selectedTag}
          onToggleTag={handleToggleTag}
          onClearTag={handleClearTag}
        />
      </div>

      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <SpotlightEmptyState isFilterActive={isFilterActive} />
        ) : (
          filteredItems.map((item) => {
            const isSaving = savingPath === item.path && isPending;
            const currentVal = values[item.path] ?? item.value;
            const originalVal = savedValues[item.path] ?? item.value;
            const isDirty = currentVal !== originalVal;

            return (
              <SpotlightItemCard
                key={item.path}
                path={item.path}
                currentValue={currentVal}
                isDirty={isDirty}
                isMultiline={item.isMultiline}
                isSaving={isSaving}
                onChange={handleValueChange}
                onSave={handleSaveItem}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
