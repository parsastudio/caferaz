import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { CheckoutProvider } from "@/context/CheckoutContext";
import { ContentProvider } from "@/context/ContentContext";
import Footer from "@/components/layout/Footer";
import GlobalStatusBar from "@/components/layout/GlobalStatusBar";
import RouteProgressBar from "@/components/layout/RouteProgressBar";
import { Suspense } from "react";
import { ContentService } from "@/services/content.service";
import { DEFAULT_SITE_CONTENT } from "@/lib/content/default-content";

const vazirMatn = localFont({
  src: "../../public/Vazirmatn.woff2",
  variable: "--font-vazirmatn",
});

export const metadata: Metadata = {
  title: "کافه راز | خرید قهوه فله اسپرسو",
  description: "رست تخصصی و فروش مستقیم قهوه میکس ویژه اسپرسو",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let siteContent = DEFAULT_SITE_CONTENT;

  try {
    siteContent = await ContentService.getSiteContent();
  } catch (error) {
    console.warn("Database connection fallback during build", error);
  }

  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${vazirMatn.variable} h-full antialiased`}
    >
      <body
        className="min-h-full flex flex-col bg-background text-foreground"
        dir="rtl"
      >
        <ContentProvider content={siteContent}>
          <CheckoutProvider>
            <Suspense fallback={null}>
              <RouteProgressBar />
            </Suspense>
            <GlobalStatusBar />
            <div className="flex-grow">{children}</div>
            <Footer />
          </CheckoutProvider>
        </ContentProvider>
      </body>
    </html>
  );
}
