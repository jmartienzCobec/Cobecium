import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createSample = mutation({
  args: {
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("samples", {
      message: args.message,
      createdAt: Date.now(),
    });
    return id;
  },
});
