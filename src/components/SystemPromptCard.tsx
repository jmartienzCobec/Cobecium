"use client";

import type { Doc, Id } from "../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import type { SystemPromptFields } from "./SystemPromptForm";

type Props = {
  prompt: Doc<"chatSystemPrompts">;
  onEdit: (id: Id<"chatSystemPrompts">, fields: SystemPromptFields) => void;
  onDelete: (id: Id<"chatSystemPrompts">) => void;
  autoOpenView?: boolean;
  highlight?: boolean;
};

const TRUNCATE_LEN = 120;

export function SystemPromptCard({
  prompt,
  onEdit,
  onDelete,
  autoOpenView,
  highlight,
}: Props) {
  const [viewOpen, setViewOpen] = useState(false);
  const descTruncated =
    prompt.description.length > TRUNCATE_LEN
      ? prompt.description.slice(0, TRUNCATE_LEN) + "…"
      : prompt.description;
  const textTruncated =
    prompt.systemPromptText.length > TRUNCATE_LEN
      ? prompt.systemPromptText.slice(0, TRUNCATE_LEN) + "…"
      : prompt.systemPromptText;

  useEffect(() => {
    if (autoOpenView) setViewOpen(true);
  }, [autoOpenView]);

  return (
    <>
      <div
        id={prompt._id}
        className={`relative bg-card border-l-4 p-5 transition-all border-border ${
          highlight
            ? "ring-2 ring-primary/60 shadow-[4px_4px_0_0_var(--base-orange)]"
            : "hover:shadow-[4px_4px_0_0_var(--base-teal)]"
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {prompt.state}
            </span>
            <h3 className="text-lg font-bold text-foreground mt-0.5 truncate">
              {prompt.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {descTruncated || "—"}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                {prompt.typeDisplayName}
              </span>
              {prompt.isPrimarySystemPrompt && (
                <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded bg-primary/20 text-primary">
                  Primary
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-1 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewOpen(true)}
              className="text-xs text-muted-foreground hover:text-primary font-semibold uppercase h-auto py-1"
            >
              View
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                onEdit(prompt._id, {
                  title: prompt.title,
                  description: prompt.description,
                  systemPromptText: prompt.systemPromptText,
                  isPrimarySystemPrompt: prompt.isPrimarySystemPrompt,
                  type: prompt.type,
                  typeName: prompt.typeName,
                  typeDisplayName: prompt.typeDisplayName,
                })
              }
              className="text-xs text-muted-foreground hover:text-primary font-semibold uppercase h-auto py-1"
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(prompt._id)}
              className="text-xs text-destructive hover:text-destructive font-semibold uppercase h-auto py-1"
            >
              Delete
            </Button>
          </div>
        </div>
        {prompt.systemPromptText.length > TRUNCATE_LEN && (
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
            {textTruncated}
          </p>
        )}
      </div>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto border-border bg-card">
          <DialogHeader>
            <DialogTitle className="font-display text-xl tracking-tight">
              {prompt.title}
            </DialogTitle>
          </DialogHeader>
          <pre className="whitespace-pre-wrap text-sm text-foreground font-sans bg-muted/30 p-4 rounded-md overflow-x-auto">
            {prompt.systemPromptText}
          </pre>
        </DialogContent>
      </Dialog>
    </>
  );
}
