import CoffeeProductPage from "@/components/CoffeeProductPage";
import { getProductAction } from "@/app/actions/product";
import { getCommentsAction } from "@/app/actions/comment";
import { getCouponsAction } from "@/app/actions/coupon";

export default async function Page() {
  const productResult = await getProductAction("prod_coffee_bulk_01");
  const commentsResult = await getCommentsAction("prod_coffee_bulk_01");
  const couponsResult = await getCouponsAction();

  if (!productResult.success || !productResult.data) {
    return (
      <div className="text-center py-20 text-stone-400">
        {productResult.error || "محصول یافت نشد."}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground pb-20">
      <CoffeeProductPage
        initialProduct={productResult.data}
        initialComments={commentsResult.success ? commentsResult.data : []}
        activeCoupons={couponsResult.success ? couponsResult.data : []}
      />
    </main>
  );
}
