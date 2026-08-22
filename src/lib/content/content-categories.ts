export interface ContentCategoryTag {
  id: string;
  label: string;
  emoji: string;
}

export const CATEGORY_TAGS: ContentCategoryTag[] = [
  { id: "product_basic", label: "مشخصات کالا", emoji: "☕" },
  { id: "layout", label: "عمومی و فوتر", emoji: "⚙️" },
  { id: "hero", label: "بخش هیرو", emoji: "✨" },
  { id: "config", label: "شخصی‌سازی قهوه", emoji: "🎛️" },
  { id: "whyUs", label: "مزایای کافه راز", emoji: "💎" },
  { id: "checkout", label: "تسویه و سبد خرید", emoji: "🛍️" },
  { id: "auth", label: "ورود و ثبت‌نام", emoji: "🔑" },
  { id: "profile", label: "پیشخوان کاربری", emoji: "👤" },
  { id: "error", label: "پیام‌های خطا و سیستم", emoji: "⚠️" },
];

export function isItemMatchingCategory(
  path: string,
  categoryId: string,
): boolean {
  switch (categoryId) {
    case "product_basic":
      return path === "product.name" || path === "product.description";
    case "layout":
      return path.startsWith("layout.");
    case "hero":
      return path.startsWith("hero.") || path.startsWith("faqHeader.");
    case "config":
      return (
        path.startsWith("product.") &&
        path !== "product.name" &&
        path !== "product.description"
      );
    case "whyUs":
      return path.startsWith("whyUs.");
    case "checkout":
      return path.startsWith("checkout.");
    case "auth":
      return path.startsWith("auth.");
    case "profile":
      return path.startsWith("profile.");
    case "error":
      return path.startsWith("error.");
    default:
      return true;
  }
}
