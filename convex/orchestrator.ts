import { action } from "./_generated/server";
import { v } from "convex/values";

const BASE_URL = process.env.ORCHESTRATOR_BASE_URL;
/** Convex admin key for Orchestrator auth; doc: "Authorization: Convex <ADMIN_KEY>" */
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

/** Agent capabilities for workflows:create (see INTEGRATION.md) */
const agentOptionsValidator = v.optional(
  v.object({
    enableWebSearch: v.optional(v.boolean()),
    enableBrowserWorkflow: v.optional(v.boolean()),
  })
);

/**
 * Create a workflow on the AI Orchestrator. Returns the workflow ID for polling.
 * API: POST /api/mutation with path "workflows:create" (see docs/INTEGRATION.md).
 */
export const createWorkflow = action({
  args: {
    prompt: v.string(),
    systemPrompt: v.string(),
    workspaceSlug: v.optional(v.string()),
    agentOptions: agentOptionsValidator,
    createDynamicWorkspace: v.optional(v.boolean()),
    urlsToScrape: v.optional(v.array(v.string())),
  },
  handler: async (_ctx, { prompt, systemPrompt, workspaceSlug, agentOptions, createDynamicWorkspace, urlsToScrape }) => {
    const args: {
      prompt: string;
      systemPrompt: string;
      workspaceSlug?: string;
      agentOptions?: { enableWebSearch?: boolean; enableBrowserWorkflow?: boolean };
      createDynamicWorkspace?: boolean;
      urlsToScrape?: string[];
    } = {
      prompt,
      systemPrompt,
    };
    if (workspaceSlug != null && workspaceSlug !== "") {
      args.workspaceSlug = workspaceSlug;
    }
    if (agentOptions != null && (agentOptions.enableWebSearch !== undefined || agentOptions.enableBrowserWorkflow !== undefined)) {
      args.agentOptions = agentOptions;
    }
    if (createDynamicWorkspace === true) {
      args.createDynamicWorkspace = true;
    }
    if (urlsToScrape != null && urlsToScrape.length > 0) {
      args.urlsToScrape = urlsToScrape;
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

/** Validation result from the Orchestrator (set after validation). */
export type WorkflowValidationResult =
  | { valid: true }
  | { valid: false; rejectionReason?: string };

/** Workflow document returned by workflows:get (see docs/INTEGRATION.md). */
export type WorkflowDoc = {
  status: string;
  result?: string | null;
  error?: string | null;
  logs?: string[] | null;
  updatedAt?: number;
  prompt?: string;
  systemPrompt?: string;
  workspaceSlug?: string;
  /** Set after validation (e.g. qa, summarization, research, code_assist, data_gathering, general). */
  workflowType?: string;
  /** Ordered steps from the validation agent. */
  steps?: string[];
  /** Tools required (e.g. rag, web_search, web_scrape, browser, none). */
  toolsRequired?: string[];
  /** Present when validation has run. */
  validationResult?: WorkflowValidationResult;
};
