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

  if (!productResult.success || !productResult.data) {
    return (
      <div className="text-center py-20 text-stone-400">
        {productResult.error || "محصولی یافت نشد."}
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

  return (
    <main className="min-h-screen bg-background text-foreground pb-20">
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
