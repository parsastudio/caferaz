import CoffeeProductPage from "@/components/CoffeeProductPage";
import { getProductWithPricing, getCommentsByProductId } from "@/lib/mock-db";

export default async function Page() {
  const product = getProductWithPricing("prod_coffee_bulk_01");
  const comments = getCommentsByProductId("prod_coffee_bulk_01");

  if (!product) {
    return <div className="text-center py-20">محصول یافت نشد.</div>;
  }

  return (
    <main className="min-h-screen bg-background text-foreground pb-20">
      <CoffeeProductPage initialProduct={product} initialComments={comments} />
    </main>
  );
}
