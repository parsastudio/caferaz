"use client";

import React from "react";
import SpotlightContentEditor from "@/components/features/admin/settings/SpotlightContentEditor";
import { SiteContent } from "@/domain/validations/content.schema";

interface AdminSettingsClientProps {
  initialSettings: {
    siteContent: SiteContent;
  };
}

export default function AdminSettingsClient({
  initialSettings,
}: AdminSettingsClientProps) {
  return (
    <div
      className="w-full text-right animate-in fade-in duration-200"
      dir="rtl"
    >
      <SpotlightContentEditor initialContent={initialSettings.siteContent} />
    </div>
  );
}
