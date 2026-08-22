import { DEFAULT_SITE_CONTENT } from "@/lib/content/default-content";
import {
  SiteBlendItem,
  SiteGrindItem,
} from "@/domain/validations/content.schema";

export type CoffeeBlend = SiteBlendItem;
export type CoffeeGrind = SiteGrindItem;
export type BlendProfile = SiteBlendItem["profile"];

export const STATIC_BLENDS: CoffeeBlend[] = DEFAULT_SITE_CONTENT.product.blends;
export const STATIC_GRINDS: CoffeeGrind[] = DEFAULT_SITE_CONTENT.product.grinds;
