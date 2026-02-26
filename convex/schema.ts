import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  samples: defineTable({
    message: v.string(),
    createdAt: v.number(),
  }).index("by_created", ["createdAt"]),

  procurementLinks: defineTable({
    state: v.string(),
    city: v.string(),
    official_website: v.string(),
    procurement_link: v.string(),
  })
    .index("by_state", ["state"])
    .index("by_city", ["city"])
    .index("by_official_website", ["official_website"])
    .index("by_procurement_link", ["procurement_link"]),
});
