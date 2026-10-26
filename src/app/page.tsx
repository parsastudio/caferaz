import { Suspense } from "react";
import CoffeeProductPage from "@/components/features/product/CoffeeProductPage";
import ProductPageSkeleton from "@/components/features/product/ProductPageSkeleton";
import { getMainProductAction } from "@/actions/product";
import { getCommentsAction } from "@/actions/public-comment";
import { getCouponsAction } from "@/actions/admin-coupon";
import WhyCafeRaz from "@/components/features/landing/WhyCafeRaz";
import FAQSection from "@/components/features/landing/FAQSection";
import { getTehranTodayString } from "@/lib/date/formatters";
import { ContentService } from "@/services/content.service";
import { FaqService } from "@/services/faq.service";
import { DEFAULT_SITE_CONTENT } from "@/lib/content/default-content";

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

  let siteContent = DEFAULT_SITE_CONTENT;
  try {
    siteContent = await ContentService.getSiteContent();
  } catch (error) {
    console.warn("Database connection fallback during build", error);
  }

  const siteSubtitle = siteContent.layout.brandSubtitle;
  const faqs = await FaqService.getAllFaqs();
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
      <Suspense fallback={<ProductPageSkeleton />}>
        <CoffeeProductPage
          initialProduct={mainProduct}
          initialComments={
            commentsResult.success && commentsResult.data
              ? commentsResult.data
              : []
          }
          activeCoupons={
            couponsResult.success && couponsResult.data
              ? couponsResult.data
              : []
          }
          siteSubtitle={siteSubtitle}
          serverTodayStr={serverTodayStr}
        />
      </Suspense>
      <WhyCafeRaz content={siteContent.whyUs} />
      <FAQSection header={siteContent.faqHeader} faqs={faqs} />
    </main>
  );
}
