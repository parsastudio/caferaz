"use client";

import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import GeneralSettings from "./settings/GeneralSettings";
import FAQSettings from "./settings/FAQSettings";
import { FAQ } from "@/components/landing/FAQSection";

interface AdminSettingsClientProps {
  initialSettings: {
    siteSubtitle: string;
    siteFaq: FAQ[];
    siteFooter: {
      phones: string[];
      address: string;
      eitaa: string;
      website: string;
    };
    productName: string;
    productDescription: string;
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
          className="bg-stone-900 border border-stone-800 p-1 mb-8 flex flex-wrap gap-1 w-full max-w-md justify-start"
          dir="rtl"
        >
          <TabsTrigger
            value="general"
            className="cursor-pointer py-2.5 px-4 text-xs font-bold flex-1"
          >
            ⚙️ عمومی و فوتر
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

        <TabsContent value="faqs">
          <FAQSettings initialFaqs={initialSettings.siteFaq || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
