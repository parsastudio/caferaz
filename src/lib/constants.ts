import { DEFAULT_SITE_CONTENT } from "@/lib/content/default-content";
import {
  SiteUspItem,
  SiteBlendItem,
  SiteGrindItem,
} from "@/domain/validations/content.schema";

export type USP = SiteUspItem;
export type CoffeeBlend = SiteBlendItem;
export type CoffeeGrind = SiteGrindItem;
export type BlendProfile = SiteBlendItem["profile"];

export const STATIC_USPS: USP[] = DEFAULT_SITE_CONTENT.whyUs.items;
export const STATIC_BLENDS: CoffeeBlend[] = DEFAULT_SITE_CONTENT.product.blends;
export const STATIC_GRINDS: CoffeeGrind[] = DEFAULT_SITE_CONTENT.product.grinds;
