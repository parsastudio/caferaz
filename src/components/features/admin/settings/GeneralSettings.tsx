"use client";

import React from "react";
import ProductContentSettings from "@/components/features/admin/settings/ProductContentSettings";
import FooterContactSettings from "@/components/features/admin/settings/FooterContactSettings";
import { FooterConfig } from "@/types";

interface GeneralSettingsProps {
  initialSettings: {
    siteSubtitle: string;
    siteFooter: FooterConfig;
    productId: string;
    productName: string;
    productDescription: string;
  };
}

export default function GeneralSettings({
  initialSettings,
}: GeneralSettingsProps) {
  return (
    <div
      className="space-y-6 max-w-3xl text-right animate-in fade-in duration-200"
      dir="rtl"
    >
      <ProductContentSettings
        productId={initialSettings.productId}
        initialProductName={initialSettings.productName}
        initialProductDescription={initialSettings.productDescription}
        initialSiteSubtitle={initialSettings.siteSubtitle}
      />
      <FooterContactSettings initialFooter={initialSettings.siteFooter} />
    </div>
  );
}
