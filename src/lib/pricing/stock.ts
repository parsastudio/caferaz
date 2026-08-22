import { DEFAULT_STOCK_GRAMS } from "@/lib/constants";

export function calculateRemainingStock(
  stockGrams: number | undefined,
  weight: number,
): number {
  const stock = stockGrams !== undefined ? stockGrams : DEFAULT_STOCK_GRAMS;
  return Math.floor(stock / weight);
}
