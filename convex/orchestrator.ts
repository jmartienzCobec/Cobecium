import { action } from "./_generated/server";
import { v } from "convex/values";

const BASE_URL = process.env.ORCHESTRATOR_BASE_URL;
const AUTH_KEY = process.env.HYDRA_KEY;

function orchestratorFetch(path: "mutation" | "query", body: object): Promise<Response> {
  if (!BASE_URL?.trim()) {
    throw new Error(
      "Orchestrator is not configured: ORCHESTRATOR_BASE_URL is not set. Set it in the Convex dashboard (or via npx convex env set)."
    );
  }
  const url = `${BASE_URL.replace(/\/$/, "")}/api/${path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (AUTH_KEY?.trim()) {
    headers["Authorization"] = `Convex ${AUTH_KEY}`;
  }
  return fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

/**
 * Create a workflow on the AI Orchestrator. Returns the workflow ID for polling.
 */
export const createWorkflow = action({
  args: {
    prompt: v.string(),
    systemPrompt: v.string(),
    workspaceSlug: v.optional(v.string()),
  },
  handler: async (_ctx, { prompt, systemPrompt, workspaceSlug }) => {
    const args: { prompt: string; systemPrompt: string; workspaceSlug?: string } = {
      prompt,
      systemPrompt,
    };
    if (workspaceSlug != null && workspaceSlug !== "") {
      args.workspaceSlug = workspaceSlug;
    }
    const res = await orchestratorFetch("mutation", {
      path: "workflows:create",
      args,
      format: "json",
    });

    const data = (await res.json()) as {
      status?: string;
      value?: string;
      errorMessage?: string;
    };

    if (!res.ok) {
      const msg =
        data?.errorMessage ?? data?.value ?? `Orchestrator returned ${res.status}`;
      throw new Error(`Orchestrator request failed: ${msg}`);
    }

    if (data?.status !== "success") {
      throw new Error(
        data?.errorMessage ?? "Orchestrator did not return success."
      );
    }

    const workflowId = data?.value;
    if (typeof workflowId !== "string" || !workflowId) {
      throw new Error("Orchestrator did not return a workflow ID.");
    }

    return { workflowId };
  },
});

/**
 * Fetch workflow status and result from the AI Orchestrator.
 */
export const getWorkflow = action({
  args: { id: v.string() },
  handler: async (_ctx, { id }) => {
    const res = await orchestratorFetch("query", {
      path: "workflows:get",
      args: { id },
      format: "json",
    });

    if (!res.ok) {
      const text = await res.text();
      let msg: string;
      try {
        const data = JSON.parse(text) as { errorMessage?: string };
        msg = data?.errorMessage ?? text;
      } catch {
        msg = text || `Orchestrator returned ${res.status}`;
      }
      throw new Error(`Orchestrator request failed: ${msg}`);
    }

    const doc = (await res.json()) as WorkflowDoc;
    return doc;
  },
});

/** Minimal type for the workflow document returned by workflows:get */
export type WorkflowDoc = {
  status: string;
  result?: string | null;
  error?: string | null;
  logs?: string[] | null;
  updatedAt?: number;
  prompt?: string;
  systemPrompt?: string;
  workspaceSlug?: string;
};
