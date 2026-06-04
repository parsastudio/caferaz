import CoffeeProductPage from "@/components/features/product/CoffeeProductPage";
import { getProductAction } from "@/actions/product";
import { getCommentsAction } from "@/actions/comment";
import { getCouponsAction } from "@/actions/coupon";
import { prisma } from "@/lib/prisma";
import WhyCafeRaz from "@/components/features/landing/WhyCafeRaz";
import FAQSection, { FAQ } from "@/components/features/landing/FAQSection";

export default async function Page() {
  const productResult = await getProductAction("prod_coffee_bulk_01");
  const commentsResult = await getCommentsAction("prod_coffee_bulk_01");
  const couponsResult = await getCouponsAction();

  const siteFaqOpt = await prisma.option.findUnique({
    where: { key: "site_faq" },
  });
  const siteSubtitleOpt = await prisma.option.findUnique({
    where: { key: "site_subtitle" },
  });

  const faqs = siteFaqOpt ? (siteFaqOpt.value as unknown as FAQ[]) : [];
  const siteSubtitle = siteSubtitleOpt ? (siteSubtitleOpt.value as string) : "";

  if (!productResult.success) {
    return (
      <div className="text-center py-20 text-stone-400">
        {productResult.error}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground pb-20">
      <CoffeeProductPage
        initialProduct={productResult.data}
        initialComments={
          commentsResult.success && commentsResult.data
            ? commentsResult.data
            : []
        }
        activeCoupons={
          couponsResult.success && couponsResult.data ? couponsResult.data : []
        }
        siteSubtitle={siteSubtitle}
      />
      <WhyCafeRaz />
      <FAQSection faqs={faqs} />
    </main>
  );
}
