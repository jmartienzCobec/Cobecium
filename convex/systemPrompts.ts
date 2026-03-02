import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

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

const systemPromptValidator = v.object({
  title: v.string(),
  description: v.string(),
  systemPromptText: v.string(),
  isPrimarySystemPrompt: v.boolean(),
  type: v.string(),
  typeName: v.string(),
  typeDisplayName: v.string(),
  state: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
});

/** Create-insert payload: omit state and timestamps; we set them. */
const createArgsValidator = v.object({
  title: v.string(),
  description: v.string(),
  systemPromptText: v.string(),
  isPrimarySystemPrompt: v.boolean(),
  type: v.string(),
  typeName: v.string(),
  typeDisplayName: v.string(),
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("chatSystemPrompts").collect();
  },
});

export const get = query({
  args: { id: v.id("chatSystemPrompts") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const create = mutation({
  args: createArgsValidator,
  handler: async (ctx, args) => {
    const now = Date.now();
    const state = parseStateFromTitle(args.title);
    await ctx.db.insert("chatSystemPrompts", {
      ...args,
      state,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("chatSystemPrompts"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    systemPromptText: v.optional(v.string()),
    isPrimarySystemPrompt: v.optional(v.boolean()),
    type: v.optional(v.string()),
    typeName: v.optional(v.string()),
    typeDisplayName: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...patch }) => {
    const doc = await ctx.db.get(id);
    if (!doc) return;
    const updatedAt = Date.now();
    const state =
      patch.title !== undefined
        ? parseStateFromTitle(patch.title)
        : doc.state;
    await ctx.db.patch(id, {
      ...patch,
      state,
      updatedAt,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("chatSystemPrompts") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

/** Import normalized prompts (e.g. from frontend normalizer). Each row must include state. */
export const importFromJson = mutation({
  args: {
    prompts: v.array(systemPromptValidator),
  },
  handler: async (ctx, { prompts }) => {
    let count = 0;
    for (const row of prompts) {
      await ctx.db.insert("chatSystemPrompts", row);
      count += 1;
    }
    return { inserted: count };
  },
});
