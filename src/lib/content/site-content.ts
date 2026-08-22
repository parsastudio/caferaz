import {
  SiteContent,
  siteContentSchema,
} from "@/domain/validations/content.schema";

function isPlainObject(item: unknown): item is Record<string, unknown> {
  return Boolean(
    item &&
    typeof item === "object" &&
    !Array.isArray(item) &&
    !(item instanceof Date),
  );
}

export function deepMergeContent(
  fallback: SiteContent,
  override?: unknown,
): SiteContent {
  if (!isPlainObject(override)) {
    return fallback;
  }

  const result: Record<string, unknown> = { ...fallback };

  for (const key of Object.keys(override)) {
    const fallbackVal = result[key];
    const overrideVal = override[key];

    if (Array.isArray(overrideVal)) {
      result[key] = overrideVal;
    } else if (isPlainObject(fallbackVal) && isPlainObject(overrideVal)) {
      result[key] = {
        ...fallbackVal,
        ...overrideVal,
      };
    } else if (overrideVal !== undefined && overrideVal !== null) {
      result[key] = overrideVal;
    }
  }

  const parsed = siteContentSchema.safeParse(result);
  return parsed.success ? parsed.data : fallback;
}
