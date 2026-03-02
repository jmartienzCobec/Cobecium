/**
 * Normalized shape we send to the API and store in the DB.
 */
export type NormalizedSystemPrompt = {
  title: string;
  description: string;
  systemPromptText: string;
  isPrimarySystemPrompt: boolean;
  type: string;
  typeName: string;
  typeDisplayName: string;
  state: string;
  createdAt: number;
  updatedAt: number;
};

/**
 * Parse state from system prompt title (e.g. "Wyoming - Leads Generation Prompt" → "Wyoming").
 * If no " - " separator or result is empty, return "Not found".
 */
export function parseStateFromTitle(title: string): string {
  if (typeof title !== "string" || !title.trim()) return "Not found";
  const idx = title.indexOf(" - ");
  if (idx === -1) return "Not found";
  const state = title.slice(0, idx).trim();
  return state || "Not found";
}

/** Flexible prompt-like object (camelCase or snake_case). */
type FlexiblePrompt = Record<string, unknown> & {
  title?: string;
  description?: string;
  systemPromptText?: string;
  system_prompt_text?: string;
  isPrimarySystemPrompt?: boolean;
  is_primary_system_prompt?: boolean;
  type?: string;
  typeName?: string;
  type_name?: string;
  typeDisplayName?: string;
  type_display_name?: string;
  createdAt?: number;
  created_at?: number;
  updatedAt?: number;
  updated_at?: number;
};

function pickString(obj: FlexiblePrompt, ...keys: string[]): string {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "string") return v.trim();
  }
  return "";
}

function pickBoolean(obj: FlexiblePrompt, ...keys: string[]): boolean {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "boolean") return v;
    if (v === "true" || v === 1) return true;
    if (v === "false" || v === 0) return false;
  }
  return false;
}

function pickNumber(obj: FlexiblePrompt, ...keys: string[]): number {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "number" && !Number.isNaN(v)) return v;
    if (typeof v === "string") {
      const n = Number(v);
      if (!Number.isNaN(n)) return n;
    }
  }
  return 0;
}

function normalizeOne(row: FlexiblePrompt, now: number): NormalizedSystemPrompt | null {
  const title = pickString(row, "title");
  if (!title) return null;

  const description = pickString(row, "description");
  const systemPromptText = pickString(row, "systemPromptText", "system_prompt_text") || "";
  const isPrimarySystemPrompt = pickBoolean(row, "isPrimarySystemPrompt", "is_primary_system_prompt");
  const type = pickString(row, "type") || "";
  const typeName = pickString(row, "typeName", "type_name") || "";
  const typeDisplayName = pickString(row, "typeDisplayName", "type_display_name") || "";

  const createdAt = pickNumber(row, "createdAt", "created_at") || now;
  const updatedAt = pickNumber(row, "updatedAt", "updated_at") || now;
  const state = parseStateFromTitle(title);

  return {
    title,
    description,
    systemPromptText,
    isPrimarySystemPrompt,
    type,
    typeName,
    typeDisplayName,
    state,
    createdAt,
    updatedAt,
  };
}

/**
 * Collect all prompt-like objects from JSON that can be:
 * - A top-level array of prompt objects
 * - An object with key "chatSystemPrompts" (array)
 * Strips _id and _creationTime; accepts camelCase and snake_case; sets state from title.
 */
export function normalizeSystemPromptsImport(
  json: unknown
): { prompts: NormalizedSystemPrompt[]; error?: string } {
  if (json == null || typeof json !== "object") {
    return { prompts: [], error: "Invalid JSON: expected an object or array." };
  }

  let rawRows: unknown[] = [];

  if (Array.isArray(json)) {
    rawRows = json;
  } else {
    const obj = json as Record<string, unknown>;
    const chatSystemPrompts = obj.chatSystemPrompts ?? obj.chat_system_prompts;
    if (Array.isArray(chatSystemPrompts)) {
      rawRows = chatSystemPrompts;
    } else {
      // Fallback: any array value
      for (const value of Object.values(obj)) {
        if (Array.isArray(value)) rawRows.push(...value);
      }
    }
  }

  const now = Date.now();
  const prompts: NormalizedSystemPrompt[] = [];

  for (const item of rawRows) {
    if (item != null && typeof item === "object" && !Array.isArray(item)) {
      const row = item as Record<string, unknown>;
      const { _id, _creationTime, ...rest } = row;
      const normalized = normalizeOne(rest as FlexiblePrompt, now);
      if (normalized) prompts.push(normalized);
    }
  }

  if (prompts.length === 0 && rawRows.length > 0) {
    return {
      prompts: [],
      error:
        "No valid prompt objects found. Each item needs at least a title.",
    };
  }

  return { prompts };
}
