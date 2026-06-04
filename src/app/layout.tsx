import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { CheckoutProvider } from "@/context/CheckoutContext";
import Footer, { FooterConfig } from "@/components/layout/Footer";
import GlobalStatusBar from "@/components/layout/GlobalStatusBar";
import RouteProgressBar from "@/components/layout/RouteProgressBar";
import { prisma } from "@/lib/prisma";
import { Suspense } from "react";

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
  const footerOpt = await prisma.option.findUnique({
    where: { key: "site_footer" },
  });

  let footerData: FooterConfig | null = null;

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
      instagram: typeof raw.instagram === "string" ? raw.instagram : "",
      telegram: typeof raw.telegram === "string" ? raw.telegram : "",
    };
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
        <CheckoutProvider>
          <Suspense fallback={null}>
            <RouteProgressBar />
          </Suspense>
          <GlobalStatusBar />
          <div className="flex-grow">{children}</div>
          <Footer config={footerData} />
        </CheckoutProvider>
      </body>
    </html>
  );
}
