export interface FlattenedContentItem {
  path: string;
  value: string;
  isMultiline: boolean;
}

export function flattenContent(
  obj: unknown,
  prefix = "",
): FlattenedContentItem[] {
  const items: FlattenedContentItem[] = [];

  if (obj === null || obj === undefined) {
    return items;
  }

  if (
    typeof obj === "string" ||
    typeof obj === "number" ||
    typeof obj === "boolean"
  ) {
    const strVal = String(obj);
    items.push({
      path: prefix,
      value: strVal,
      isMultiline: strVal.length > 60 || strVal.includes("\n"),
    });
    return items;
  }

  if (Array.isArray(obj)) {
    obj.forEach((val, idx) => {
      const currentPath = prefix ? `${prefix}.${idx}` : `${idx}`;
      items.push(...flattenContent(val, currentPath));
    });
    return items;
  }

  if (typeof obj === "object") {
    for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
      const currentPath = prefix ? `${prefix}.${key}` : key;
      items.push(...flattenContent(val, currentPath));
    }
  }

  return items;
}

export function setNestedValue(
  obj: Record<string, unknown>,
  path: string,
  value: unknown,
): Record<string, unknown> {
  const root = JSON.parse(JSON.stringify(obj)) as Record<string, unknown>;
  const keys = path.split(".");
  let current: Record<string, unknown> = root;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    const nextKey = keys[i + 1];
    const isNextKeyIndex = /^\d+$/.test(nextKey);

    if (
      current[key] === undefined ||
      current[key] === null ||
      typeof current[key] !== "object"
    ) {
      current[key] = isNextKeyIndex ? [] : {};
    }

    current = current[key] as Record<string, unknown>;
  }

  const lastKey = keys[keys.length - 1];
  const targetOldVal = current[lastKey];

  if (typeof targetOldVal === "number") {
    const num = Number(value);
    current[lastKey] = isNaN(num) ? value : num;
  } else if (typeof targetOldVal === "boolean") {
    current[lastKey] = value === "true" || value === true;
  } else {
    current[lastKey] = value;
  }

  return root;
}
