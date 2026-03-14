import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./users";

/**
 * Record that a hunt was started for the given US state.
 * Call after createWorkflow succeeds in the UI.
 */
export const recordHuntStarted = mutation({
  args: {
    state: v.string(),
  },
  handler: async (ctx, { state }) => {
    await ctx.db.insert("huntStarts", {
      state: state.trim() || "Unknown",
      startedAt: Date.now(),
    });
  },
});

/**
 * Return hunt counts by state and total, for the analytics UI.
 * Sorted by count descending.
 */
export const getHuntCountsByState = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const all = await ctx.db.query("huntStarts").collect();
    const byStateMap = new Map<string, number>();
    for (const doc of all) {
      byStateMap.set(doc.state, (byStateMap.get(doc.state) ?? 0) + 1);
    }
    const byState = Array.from(byStateMap.entries())
      .map(([state, count]) => ({ state, count }))
      .sort((a, b) => b.count - a.count);
    const total = all.length;
    return { byState, total };
  },
});
