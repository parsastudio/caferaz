"use client";

import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import GeneralSettings from "@/components/features/admin/settings/GeneralSettings";
import FAQSettings from "@/components/features/admin/settings/FAQSettings";
import HeroContentSettings from "@/components/features/admin/settings/HeroContentSettings";
import CheckoutContentSettings from "@/components/features/admin/settings/CheckoutContentSettings";
import { SiteContent } from "@/domain/validations/content.schema";

interface AdminSettingsClientProps {
  initialSettings: {
    siteSubtitle: string;
    siteFooter: {
      phones: string[];
      address: string;
      eitaa: string;
      website: string;
    };
    productId: string;
    productName: string;
    productDescription: string;
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
      <Tabs defaultValue="general" className="flex flex-col w-full" dir="rtl">
        <TabsList
          className="bg-stone-900 border border-stone-800 p-1 mb-8 flex flex-wrap gap-1 w-full max-w-2xl justify-start"
          dir="rtl"
        >
          <TabsTrigger
            value="general"
            className="cursor-pointer py-2.5 px-4 text-xs font-bold flex-1"
          >
            ⚙️ عمومی و محصول
          </TabsTrigger>
          <TabsTrigger
            value="hero"
            className="cursor-pointer py-2.5 px-4 text-xs font-bold flex-1"
          >
            ✨ هیرو و مزایا
          </TabsTrigger>
          <TabsTrigger
            value="checkout"
            className="cursor-pointer py-2.5 px-4 text-xs font-bold flex-1"
          >
            🛍️ تسویه و سفارش
          </TabsTrigger>
          <TabsTrigger
            value="faqs"
            className="cursor-pointer py-2.5 px-4 text-xs font-bold flex-1"
          >
            ❓ سوالات متداول
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <GeneralSettings initialSettings={initialSettings} />
        </TabsContent>

        <TabsContent value="hero">
          <HeroContentSettings
            initialHero={initialSettings.siteContent.hero}
            initialWhyUs={initialSettings.siteContent.whyUs}
          />
        </TabsContent>

        <TabsContent value="checkout">
          <CheckoutContentSettings
            initialCheckout={initialSettings.siteContent.checkout}
          />
        </TabsContent>

        <TabsContent value="faqs">
          <FAQSettings
            initialFaqs={initialSettings.siteContent.faq.items || []}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
