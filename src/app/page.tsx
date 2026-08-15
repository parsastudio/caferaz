import CoffeeProductPage from "@/components/features/product/CoffeeProductPage";
import { getMainProductAction } from "@/actions/product";
import { getCommentsAction } from "@/actions/comment";
import { getCouponsAction } from "@/actions/coupon";
import { prisma } from "@/lib/prisma";
import WhyCafeRaz from "@/components/features/landing/WhyCafeRaz";
import FAQSection, { FAQ } from "@/components/features/landing/FAQSection";
import { getTehranTodayString } from "@/lib/jalali-converter";

export const dynamic = "force-dynamic";

export default async function Page() {
  const productResult = await getMainProductAction();

  if (!productResult.success) {
    return (
      <div className="text-center py-20 text-stone-400">
        {productResult.error}
      </div>
    );
  }

  const mainProduct = productResult.data;
  const commentsResult = await getCommentsAction(mainProduct.id);
  const couponsResult = await getCouponsAction();

  let faqs: FAQ[] = [];
  let siteSubtitle = "";

  try {
    const siteFaqOpt = await prisma.option.findUnique({
      where: { key: "site_faq" },
    });
    const siteSubtitleOpt = await prisma.option.findUnique({
      where: { key: "site_subtitle" },
    });

    faqs = siteFaqOpt ? (siteFaqOpt.value as unknown as FAQ[]) : [];
    siteSubtitle = siteSubtitleOpt ? (siteSubtitleOpt.value as string) : "";
  } catch (error) {
    console.warn(
      "⚠️ [Page] Database is offline during build time. Using fallbacks for layout configuration.",
      error,
    );
  }

  const serverTodayStr = getTehranTodayString();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: mainProduct.name,
    description: siteSubtitle || mainProduct.description,
    image: "https://caferaz.ir/landing-page-main-pic.webp",
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "IRR",
      lowPrice: (mainProduct.pricing?.pricePerKgRobusta || 1800000) * 10,
      highPrice: (mainProduct.pricing?.pricePerKgArabica || 2200000) * 10,
      offerCount: "5",
      availability:
        mainProduct.stockGrams > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "84",
    },
  };

  return (
    <main className="min-h-screen bg-background text-foreground pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <CoffeeProductPage
        initialProduct={mainProduct}
        initialComments={
          commentsResult.success && commentsResult.data
            ? commentsResult.data
            : []
        }
        activeCoupons={
          couponsResult.success && couponsResult.data ? couponsResult.data : []
        }
        siteSubtitle={siteSubtitle}
        serverTodayStr={serverTodayStr}
      />
      <WhyCafeRaz />
      <FAQSection faqs={faqs} />
    </main>
  );
}
