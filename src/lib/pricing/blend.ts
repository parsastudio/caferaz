import { STATIC_BLENDS, BlendProfile } from "@/lib/constants";

export function getBlendProfile(selectedBlend: string): BlendProfile {
  const found = STATIC_BLENDS.find((b) => b.value === selectedBlend);
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
