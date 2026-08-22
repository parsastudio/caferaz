"use client";

import React, { createContext, useContext } from "react";
import { SiteContent } from "@/domain/validations/content.schema";
import { DEFAULT_SITE_CONTENT } from "@/lib/content/default-content";

const ContentContext = createContext<SiteContent>(DEFAULT_SITE_CONTENT);

export function ContentProvider({
  children,
  content = DEFAULT_SITE_CONTENT,
}: {
  children: React.ReactNode;
  content?: SiteContent;
}) {
  return (
    <ContentContext.Provider value={content}>
      {children}
    </ContentContext.Provider>
  );
}

export function useSiteContent(): SiteContent {
  return useContext(ContentContext);
}
