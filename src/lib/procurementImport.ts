/**
 * Normalized shape we send to the API and store in the DB.
 */
export type NormalizedLink = {
  state: string;
  city: string;
  official_website: string;
  procurement_link: string;
};

/** Link-like object that may use camelCase or snake_case. */
type FlexibleLink = Record<string, unknown> & {
  state?: string;
  city?: string;
  official_website?: string;
  officialWebsite?: string;
  procurement_link?: string;
  procurementLink?: string;
};

function pickString(obj: FlexibleLink, ...keys: string[]): string | undefined {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "string" && v.trim() !== "") return v.trim();
  }
  return undefined;
}

/**
 * Normalize a single link-like object to NormalizedLink.
 * Accepts both camelCase (officialWebsite, procurementLink) and snake_case (official_website, procurement_link).
 * Returns null if required fields are missing.
 */
function normalizeOne(row: FlexibleLink): NormalizedLink | null {
  const state = pickString(row, "state");
  const city = pickString(row, "city");
  const official_website = pickString(row, "official_website", "officialWebsite");
  const procurement_link = pickString(row, "procurement_link", "procurementLink");
  if (state == null || city == null || official_website == null || procurement_link == null) {
    return null;
  }
  return { state, city, official_website, procurement_link };
}

/**
 * Collect all link-like objects from JSON that can be:
 * - A top-level array of link objects (e.g. approved_links.json)
 * - An object whose values are arrays of link objects (e.g. procurementLinks.json)
 * Supports both camelCase and snake_case field names.
 */
export function normalizeProcurementImport(
  json: unknown
): { links: NormalizedLink[]; error?: string } {
  if (json == null || typeof json !== "object") {
    return { links: [], error: "Invalid JSON: expected an object or array." };
  }

  let rawRows: unknown[] = [];

  if (Array.isArray(json)) {
    rawRows = json;
  } else {
    const obj = json as Record<string, unknown>;
    for (const value of Object.values(obj)) {
      if (Array.isArray(value)) {
        rawRows.push(...value);
      }
    }
  }

  const links: NormalizedLink[] = [];
  for (const item of rawRows) {
    if (item != null && typeof item === "object" && !Array.isArray(item)) {
      const normalized = normalizeOne(item as FlexibleLink);
      if (normalized) links.push(normalized);
    }
  }

  if (links.length === 0 && rawRows.length > 0) {
    return {
      links: [],
      error:
        "No valid link objects found. Each item needs state, city, and either official_website/officialWebsite and procurement_link/procurementLink.",
    };
  }

  return { links };
}
