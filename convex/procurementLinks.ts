import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

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
    const inserted: string[] = [];
    for (const row of links) {
      await ctx.db.insert("procurementLinks", row);
      inserted.push(row.procurement_link);
    }
    return { inserted: inserted.length };
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("procurementLinks").collect();
  },
});
