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

  chatSystemPrompts: defineTable({
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
  })
    .index("by_type", ["type"])
    .index("by_typeName", ["typeName"])
    .index("by_state", ["state"])
    .index("by_isPrimarySystemPrompt", ["isPrimarySystemPrompt"]),

  huntStarts: defineTable({
    state: v.string(),
    startedAt: v.number(),
  }).index("by_state", ["state"]),

  lynxUsers: defineTable({
    clerkUserId: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    role: v.union(v.literal("admin"), v.literal("user")),
    updatedAt: v.number(),
  }).index("by_clerkUserId", ["clerkUserId"]),

  /** Singleton-style row for orchestrator API docs sync (hash + timestamps; optional file storage ref). */
  orchestratorDocsSync: defineTable({
    contentHash: v.string(),
    lastFetchedAt: v.number(),
    updatedAt: v.number(),
    lastSeenAt: v.optional(v.number()),
    storageId: v.optional(v.id("_storage")),
  }),
});
