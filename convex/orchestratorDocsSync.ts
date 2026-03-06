import {
  action,
  internalAction,
  internalMutation,
  mutation,
  query,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

const DEFAULT_DOCS_URL = "http://cobec-spark:5180/api/docs";

function getDocsUrl(): string {
  const url = process.env.ORCHESTRATOR_DOCS_URL;
  return (url?.trim() || DEFAULT_DOCS_URL).replace(/\/$/, "");
}

async function sha256Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Internal: upsert the single orchestrator-docs row; sets updatedAt when contentHash changes. Returns { changed }. */
export const storeOrchestratorDocsResult = internalMutation({
  args: {
    contentHash: v.string(),
    lastFetchedAt: v.number(),
    storageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const now = args.lastFetchedAt;
    const existing = await ctx.db.query("orchestratorDocsSync").first();
    const changed = !existing || existing.contentHash !== args.contentHash;
    const updatedAt = changed ? now : existing!.updatedAt;
    const doc = {
      contentHash: args.contentHash,
      lastFetchedAt: args.lastFetchedAt,
      updatedAt,
      lastSeenAt: existing?.lastSeenAt,
      storageId: args.storageId,
    };
    if (existing) {
      await ctx.db.patch(existing._id, doc);
    } else {
      await ctx.db.insert("orchestratorDocsSync", doc);
    }
    return { changed };
  },
});

/** Internal: set lastSeenAt on the singleton row. */
export const markOrchestratorDocsSeenInternal = internalMutation({
  args: {},
  handler: async (ctx) => {
    const row = await ctx.db.query("orchestratorDocsSync").first();
    if (row) {
      await ctx.db.patch(row._id, { lastSeenAt: Date.now() });
    }
  },
});

/** Internal: fetch docs, hash, store, return { changed, lastFetchedAt }. */
export const fetchAndStoreOrchestratorDocsInternal = internalAction({
  args: {},
  handler: async (
    ctx
  ): Promise<{ changed: boolean; lastFetchedAt: number }> => {
    const url = getDocsUrl();
    const res = await fetch(url, { method: "GET" });
    if (!res.ok) {
      throw new Error(
        `Orchestrator docs fetch failed: ${res.status} ${res.statusText}`
      );
    }
    const body = await res.text();
    const contentHash = await sha256Hex(body);
    const lastFetchedAt = Date.now();
    const result = await ctx.runMutation(
      internal.orchestratorDocsSync.storeOrchestratorDocsResult,
      { contentHash, lastFetchedAt }
    );
    return { changed: result.changed, lastFetchedAt };
  },
});

/** Public wrapper so CLI and app can run the sync. */
export const fetchAndStoreOrchestratorDocs = action({
  args: {},
  handler: async (
    ctx
  ): Promise<{ changed: boolean; lastFetchedAt: number }> => {
    return await ctx.runAction(
      internal.orchestratorDocsSync.fetchAndStoreOrchestratorDocsInternal
    );
  },
});

/** Public: status for the UI indicator (hasUnseenChanges = updatedAt > lastSeenAt or lastSeenAt missing). */
export const getOrchestratorDocsStatus = query({
  args: {},
  handler: async (ctx) => {
    const row = await ctx.db.query("orchestratorDocsSync").first();
    if (!row) {
      return { hasUnseenChanges: false, updatedAt: undefined, lastSeenAt: undefined };
    }
    const hasUnseenChanges =
      row.lastSeenAt == null || row.updatedAt > row.lastSeenAt;
    return {
      hasUnseenChanges,
      updatedAt: row.updatedAt,
      lastSeenAt: row.lastSeenAt,
    };
  },
});

/** Public: mark docs as seen when user clicks the indicator. */
export const markOrchestratorDocsSeen = mutation({
  args: {},
  handler: async (ctx) => {
    const row = await ctx.db.query("orchestratorDocsSync").first();
    if (row) {
      await ctx.db.patch(row._id, { lastSeenAt: Date.now() });
    }
  },
});