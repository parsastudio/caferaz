import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { CheckoutProvider } from "@/context/CheckoutContext";
import Footer from "@/components/layout/Footer";
import GlobalStatusBar from "@/components/layout/GlobalStatusBar";
import { getOption } from "@/lib/mock-db";

const vazirMatn = localFont({
  src: "../../public/Vazirmatn.woff2",
  variable: "--font-vazirmatn",
});

export const metadata: Metadata = {
  title: "کافه راز | خرید قهوه فله اسپرسو",
  description: "رست تخصصی و فروش مستقیم قهوه میکس ویژه اسپرسو",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const footerData = getOption("site_footer");

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
          <GlobalStatusBar />
          <div className="flex-grow">{children}</div>
          <Footer config={footerData} />
        </CheckoutProvider>
      </body>
    </html>
  );
}
