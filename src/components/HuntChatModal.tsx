"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAction, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { WorkflowDoc } from "../../convex/orchestrator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const POLL_INTERVAL_MS = 2000;
const TERMINAL_STATUSES = ["completed", "failed", "cancelled"] as const;

function statusLabel(status: string): string {
  switch (status) {
    case "pending":
      return "Running…";
    case "validating":
      return "Validating…";
    case "retrieving_context":
      return "Retrieving context…";
    case "generating":
      return "Generating…";
    case "completed":
      return "Completed";
    case "failed":
      return "Failed";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
}

type Phase =
  | "idle"
  | "submitting"
  | "polling"
  | "completed"
  | "failed"
  | "cancelled"
  | "error";

/** Agent options for the Orchestrator (see docs/INTEGRATION.md). */
export type HuntChatAgentOptions = {
  enableWebSearch?: boolean;
  enableBrowserWorkflow?: boolean;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stateName: string;
  defaultSystemPrompt: string;
  /** AnythingLLM workspace slug for RAG. Omit to use Orchestrator default. */
  workspaceSlug?: string;
  /** Enable web search and/or browser workflow (Firecrawl). */
  agentOptions?: HuntChatAgentOptions;
  /** Create a dedicated AnythingLLM workspace for this workflow. */
  createDynamicWorkspace?: boolean;
  /** URLs to scrape via Firecrawl; content is added to context. */
  urlsToScrape?: string[];
};

export function HuntChatModal({
  open,
  onOpenChange,
  stateName,
  defaultSystemPrompt,
  workspaceSlug,
  agentOptions,
  createDynamicWorkspace,
  urlsToScrape,
}: Props) {
  const createWorkflow = useAction(api.orchestrator.createWorkflow);
  const getWorkflow = useAction(api.orchestrator.getWorkflow);
  const recordHuntStarted = useMutation(api.huntAnalytics.recordHuntStarted);

  const [userMessage, setUserMessage] = useState("");
  const [systemPrompt, setSystemPrompt] = useState(defaultSystemPrompt);
  const [phase, setPhase] = useState<Phase>("idle");
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [workflow, setWorkflow] = useState<WorkflowDoc | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sync default system prompt when modal opens or state changes
  useEffect(() => {
    if (open) {
      setSystemPrompt(defaultSystemPrompt);
    }
  }, [open, defaultSystemPrompt]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setUserMessage("");
      setPhase("idle");
      setWorkflowId(null);
      setWorkflow(null);
      setErrorMessage(null);
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    }
  }, [open]);

  const pollOnce = useCallback(async () => {
    if (!workflowId) return;
    try {
      const doc = await getWorkflow({ id: workflowId });
      setWorkflow(doc);
      if (TERMINAL_STATUSES.includes(doc.status as (typeof TERMINAL_STATUSES)[number])) {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        if (doc.status === "completed") setPhase("completed");
        else if (doc.status === "failed") setPhase("failed");
        else setPhase("cancelled");
      }
    } catch (err) {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      setPhase("error");
      setErrorMessage(err instanceof Error ? err.message : "Failed to get workflow status.");
    }
  }, [workflowId, getWorkflow]);

  // Poll when we have a workflow ID and are in polling phase
  useEffect(() => {
    if (!open || phase !== "polling" || !workflowId) return;
    const tick = () => void pollOnce();
    tick();
    pollIntervalRef.current = setInterval(tick, POLL_INTERVAL_MS);
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [open, phase, workflowId, pollOnce]);

  const handleSend = async () => {
    const prompt = userMessage.trim();
    if (!prompt) return;

    // Start Hunt workflows are temporarily disabled — do not send to orchestrator.
    setPhase("error");
    setErrorMessage("Start Hunt is temporarily disabled. No workflow has been sent.");
  };

  const canSend =
    phase === "idle" && userMessage.trim().length > 0;
  const isBusy = phase === "submitting" || phase === "polling";

  const textareaBase =
    "w-full border-2 border-accent/60 bg-background px-4 py-3 text-foreground text-base leading-relaxed placeholder:text-muted-foreground/80 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-md resize-y transition-colors";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-[calc(100vw-2rem)] bg-card border-2 border-primary/80 text-foreground rounded-lg max-h-[90vh] flex flex-col shadow-xl">
        <DialogHeader className="flex-shrink-0 pr-8">
          <DialogTitle className="text-primary font-bold text-xl tracking-tight">
            Start Hunt — {stateName || "State"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm mt-1">
            Send a message to the AI Orchestrator. The response will appear below when ready.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5 py-4 flex-1 min-h-0 overflow-y-auto">
          <div className="space-y-2 flex-shrink-0">
            <label
              htmlFor="hunt-system-prompt"
              className="block text-sm font-semibold uppercase tracking-wide text-foreground"
            >
              System prompt (state)
            </label>
            <textarea
              id="hunt-system-prompt"
              className={textareaBase}
              style={{ minHeight: "12rem" }}
              placeholder="Optional system prompt for this state"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              disabled={isBusy}
              aria-label="System prompt"
              rows={10}
            />
          </div>

          <div className="space-y-2 flex-shrink-0">
            <label
              htmlFor="hunt-user-message"
              className="block text-sm font-semibold uppercase tracking-wide text-foreground"
            >
              User chat message
            </label>
            <textarea
              id="hunt-user-message"
              className={textareaBase}
              style={{ minHeight: "6rem" }}
              placeholder="Enter your question or instruction…"
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              disabled={isBusy}
              aria-label="User chat message"
              rows={4}
            />
          </div>

          {(phase === "submitting" || phase === "polling") && (
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-primary animate-pulse" />
              {phase === "submitting"
                ? "Submitting…"
                : workflow?.status
                  ? statusLabel(workflow.status)
                  : "Running…"}
            </p>
          )}

          {phase === "completed" && workflow?.result != null && (
            <div className="space-y-2 flex-shrink-0">
              {(workflow.workflowType || (workflow.steps && workflow.steps.length > 0) || (workflow.toolsRequired && workflow.toolsRequired.length > 0)) && (
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {workflow.workflowType && (
                    <span className="rounded bg-muted px-2 py-0.5 font-medium">
                      {workflow.workflowType}
                    </span>
                  )}
                  {workflow.toolsRequired && workflow.toolsRequired.length > 0 && (
                    <span className="rounded bg-muted px-2 py-0.5">
                      Tools: {workflow.toolsRequired.join(", ")}
                    </span>
                  )}
                  {workflow.steps && workflow.steps.length > 0 && (
                    <span className="rounded bg-muted px-2 py-0.5">
                      Steps: {workflow.steps.join(" → ")}
                    </span>
                  )}
                </div>
              )}
              <span className="block text-sm font-semibold uppercase tracking-wide text-foreground">
                Result
              </span>
              <div className="border-2 border-accent/60 bg-background p-4 rounded-md min-h-[8rem] max-h-[20rem] overflow-y-auto text-sm leading-relaxed whitespace-pre-wrap">
                {workflow.result}
              </div>
            </div>
          )}

          {phase === "failed" && (
            <div className="space-y-2 flex-shrink-0">
              {workflow?.validationResult &&
                workflow.validationResult.valid === false &&
                workflow.validationResult.rejectionReason && (
                <div className="rounded-md border border-amber-500/50 bg-amber-500/10 px-3 py-2 text-sm text-amber-800 dark:text-amber-200">
                  <span className="font-medium">Validation: </span>
                  {workflow.validationResult.rejectionReason}
                </div>
              )}
              <span className="block text-sm font-semibold uppercase tracking-wide text-destructive">
                Error
              </span>
              <div className="border-2 border-destructive/50 bg-destructive/5 p-4 rounded-md text-sm leading-relaxed">
                {workflow?.error ?? "Workflow failed."}
              </div>
              {workflow?.logs && workflow.logs.length > 0 && (
                <details className="text-muted-foreground text-xs">
                  <summary className="cursor-pointer hover:text-foreground">Logs</summary>
                  <pre className="mt-2 overflow-auto max-h-32 whitespace-pre-wrap rounded p-2 bg-background/80">
                    {workflow.logs.join("\n")}
                  </pre>
                </details>
              )}
            </div>
          )}

          {phase === "cancelled" && (
            <p className="text-muted-foreground text-sm">Workflow was cancelled.</p>
          )}

          {phase === "error" && errorMessage && (
            <p className="text-destructive font-medium text-sm">{errorMessage}</p>
          )}
        </div>

        <DialogFooter className="gap-3 mt-4 flex-shrink-0 border-t border-border pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isBusy}
            className="border-2 border-muted-foreground text-foreground hover:border-accent font-semibold uppercase tracking-wide rounded-md"
          >
            Close
          </Button>
          <Button
            onClick={handleSend}
            disabled={!canSend}
            className="bg-primary text-primary-foreground font-bold disabled:opacity-50 uppercase tracking-wide rounded-md hover:opacity-90 transition-opacity"
          >
            {phase === "submitting" ? "Submitting…" : "Send"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
