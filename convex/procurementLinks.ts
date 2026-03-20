import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./users";

const procurementLinkValidator = v.object({
  state: v.string(),
  city: v.string(),
  official_website: v.string(),
  procurement_link: v.string(),
});

/** Accepts a flat array of link objects (snake_case). Frontend normalizes dynamic JSON (array or object, camelCase or snake_case) before sending. */
export const importFromJson = mutation({
  args: {
    links: v.array(procurementLinkValidator),
  },
  handler: async (ctx, { links }) => {
    await requireAdmin(ctx);
    const inserted: string[] = [];
    for (const row of links) {
      await ctx.db.insert("procurementLinks", row);
      inserted.push(row.procurement_link);
    }
    return { inserted: inserted.length };
  },
});

export const create = mutation({
  args: {
    state: v.string(),
    city: v.string(),
    official_website: v.string(),
    procurement_link: v.string(),
  },
  handler: async (ctx, row) => {
    await requireAdmin(ctx);
    await ctx.db.insert("procurementLinks", row);
  },
});

export const update = mutation({
  args: {
    id: v.id("procurementLinks"),
    state: v.string(),
    city: v.string(),
    official_website: v.string(),
    procurement_link: v.string(),
  },
  handler: async (ctx, { id, ...patch }) => {
    await requireAdmin(ctx);
    const doc = await ctx.db.get(id);
    if (!doc) throw new Error("Procurement link not found");
    await ctx.db.patch(id, patch);
  },
});

export const remove = mutation({
  args: { id: v.id("procurementLinks") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    const doc = await ctx.db.get(id);
    if (!doc) throw new Error("Procurement link not found");
    await ctx.db.delete(id);
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("procurementLinks").collect();
  },
});

/**
 * Export all procurement links in a concise, research-agent-friendly JSON shape.
 * Use this payload to pass to external research agents tasked with finding more portals.
 * Omits internal IDs and timestamps; includes exportedAt and count for context.
 */
export const exportForResearch = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("procurementLinks").collect();
    const links = rows.map((r) => ({
      state: r.state,
      city: r.city,
      official_website: r.official_website,
      procurement_link: r.procurement_link,
    }));
    return {
      exportedAt: new Date().toISOString(),
      count: links.length,
      links,
    };
  },
});
