export interface Product {
  id: string;
  name: string;
  description: string;
  stock_grams: number;
}

export interface ProductVariantPricing {
  id: string;
  productId: string;
  pricePerKgArabica: number;
  pricePerKgRobusta: number;
}

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "prod_coffee_bulk_01",
    name: "قهوه فله میکس ویژه اسپرسو",
    description:
      "ترکیب دانه‌های مرغوب عربیکا و روبوستا با رست هفتگی، عطر ماندگار و کرمای مخملی غلیظ. ایده‌آل برای مصارف روزانه کافه‌ها، هتل‌ها و مصارف خانگی.",
    stock_grams: 150000,
  },
];

export const MOCK_PRICING_RULES: ProductVariantPricing[] = [
  {
    id: "v_rule_01",
    productId: "prod_coffee_bulk_01",
    pricePerKgArabica: 2200000,
    pricePerKgRobusta: 1800000,
  },
];

export function getProductWithPricing(id: string) {
  const product = MOCK_PRODUCTS.find((p) => p.id === id);
  if (!product) return null;

  const pricing = MOCK_PRICING_RULES.find((pr) => pr.productId === id);
  return {
    ...product,
    pricing: pricing
      ? {
          pricePerKgArabica: pricing.pricePerKgArabica,
          pricePerKgRobusta: pricing.pricePerKgRobusta,
        }
      : null,
  };
}
