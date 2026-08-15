export function calculateRemainingStock(
  stockGrams: number | undefined,
  weight: number,
): number {
  const stock = stockGrams !== undefined ? stockGrams : 150000;
  return Math.floor(stock / weight);
}
