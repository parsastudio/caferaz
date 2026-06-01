import CoffeeProductPage from "@/components/CoffeeProductPage";
import { getProductAction } from "@/app/actions/product";
import { getCommentsAction } from "@/app/actions/comment";
import { getCouponsAction } from "@/app/actions/coupon";
import { getOption } from "@/lib/mock-db";
import WhyCafeRaz from "@/components/landing/WhyCafeRaz";
import FAQSection from "@/components/landing/FAQSection";

export default async function Page() {
  const productResult = await getProductAction("prod_coffee_bulk_01");
  const commentsResult = await getCommentsAction("prod_coffee_bulk_01");
  const couponsResult = await getCouponsAction();

  const usps = getOption("site_usps") || [];
  const faqs = getOption("site_faq") || [];

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
      />
      <WhyCafeRaz usps={usps} />
      <FAQSection faqs={faqs} />
    </main>
  );
}
