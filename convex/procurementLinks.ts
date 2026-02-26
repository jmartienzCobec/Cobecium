import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const procurementLinkValidator = v.object({
  state: v.string(),
  city: v.string(),
  official_website: v.string(),
  procurement_link: v.string(),
});

/** JSON shape: { [category: string]: Array<{ state, city, official_website, procurement_link }> } e.g. docs/procurementLinks.json */
export const importFromJson = mutation({
  args: {
    data: v.record(v.string(), v.array(procurementLinkValidator)),
  },
  handler: async (ctx, { data }) => {
    const inserted: string[] = [];
    for (const links of Object.values(data)) {
      for (const row of links) {
        await ctx.db.insert("procurementLinks", row);
        inserted.push(row.procurement_link);
      }
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
