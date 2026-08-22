import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { CheckoutProvider } from "@/context/CheckoutContext";
import { ContentProvider } from "@/context/ContentContext";
import Footer from "@/components/layout/Footer";
import { FooterConfig } from "@/types";
import GlobalStatusBar from "@/components/layout/GlobalStatusBar";
import RouteProgressBar from "@/components/layout/RouteProgressBar";
import { prisma } from "@/lib/prisma";
import { Suspense } from "react";
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
  let footerData: FooterConfig | null = null;

  try {
    const footerOpt = await prisma.option.findUnique({
      where: { key: "site_footer" },
    });

    if (
      footerOpt &&
      typeof footerOpt.value === "object" &&
      footerOpt.value !== null
    ) {
      const raw = footerOpt.value as Record<string, unknown>;

      footerData = {
        phones: Array.isArray(raw.phones) ? (raw.phones as string[]) : [],
        address: typeof raw.address === "string" ? raw.address : "",
        website: typeof raw.website === "string" ? raw.website : "",
        eitaa: typeof raw.eitaa === "string" ? raw.eitaa : "",
      };
    }
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
        <ContentProvider content={DEFAULT_SITE_CONTENT}>
          <CheckoutProvider>
            <Suspense fallback={null}>
              <RouteProgressBar />
            </Suspense>
            <GlobalStatusBar />
            <div className="flex-grow">{children}</div>
            <Footer config={footerData} />
          </CheckoutProvider>
        </ContentProvider>
      </body>
    </html>
  );
}
