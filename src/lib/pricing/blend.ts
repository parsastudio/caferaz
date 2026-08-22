import { STATIC_BLENDS, BlendProfile } from "@/lib/constants";
import { SiteBlendItem } from "@/domain/validations/content.schema";

export function getBlendProfile(
  selectedBlend: string,
  blendsList?: SiteBlendItem[],
): BlendProfile {
  const list = blendsList && blendsList.length > 0 ? blendsList : STATIC_BLENDS;
  const found = list.find((b) => b.value === selectedBlend);
  if (found?.profile) {
    return found.profile;
  }

  return {
    robusta: 50,
    arabica: 50,
    caffeine: 60,
    body: 60,
    aroma: 65,
    label: "بالانس متعادل",
  };
}
