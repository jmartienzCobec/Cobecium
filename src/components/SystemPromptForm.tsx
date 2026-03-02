"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export type SystemPromptFields = {
  title: string;
  description: string;
  systemPromptText: string;
  isPrimarySystemPrompt: boolean;
  type: string;
  typeName: string;
  typeDisplayName: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: SystemPromptFields;
  onSubmit: (data: SystemPromptFields) => void;
  isEditing: boolean;
};

const empty: SystemPromptFields = {
  title: "",
  description: "",
  systemPromptText: "",
  isPrimarySystemPrompt: false,
  type: "",
  typeName: "",
  typeDisplayName: "",
};

export function SystemPromptForm({
  open,
  onOpenChange,
  initial,
  onSubmit,
  isEditing,
}: Props) {
  const [form, setForm] = useState<SystemPromptFields>(empty);

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? {
              title: initial.title,
              description: initial.description,
              systemPromptText: initial.systemPromptText,
              isPrimarySystemPrompt: initial.isPrimarySystemPrompt,
              type: initial.type,
              typeName: initial.typeName,
              typeDisplayName: initial.typeDisplayName,
            }
          : { ...empty }
      );
    }
  }, [open, initial]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSubmit(form);
    onOpenChange(false);
  };

  const titleTrimmed = form.title.trim();
  const charCount = form.systemPromptText.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-none w-[min(96vw,980px)] max-h-[90vh] overflow-hidden flex flex-col gap-0 p-0 border-4 border-primary bg-card text-foreground rounded-none shadow-[8px_8px_0_0_var(--base-teal)]">
        <div className="px-6 py-5 border-b-2 border-border bg-[linear-gradient(90deg,rgba(245,158,11,0.14),rgba(37,37,42,0.96),rgba(13,148,136,0.12))]">
          <DialogHeader className="space-y-1">
            <DialogTitle className="font-display text-2xl tracking-tight">
              {isEditing ? "Edit system prompt" : "Add system prompt"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Tighten the title, then treat the body like source code. Keep it explicit and scannable.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="min-h-0 flex-1 overflow-y-auto">
          <div className="px-6 py-5 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
            <div className="space-y-5">
              <div className="grid gap-2">
                <Label
                  htmlFor="title"
                  className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground"
                >
                  Title
                </Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Wyoming — Leads Generation Prompt"
                  required
                  className="border-2 border-accent bg-background/40 text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:border-primary rounded-none"
                />
              </div>

              <div className="grid gap-2">
                <Label
                  htmlFor="description"
                  className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground"
                >
                  Description
                </Label>
                <Input
                  id="description"
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="Auto-generated state-specific prompt for Wyoming"
                  className="border-2 border-accent bg-background/40 text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:border-primary rounded-none"
                />
              </div>

              <div className="grid gap-2">
                <div className="flex items-end justify-between gap-3">
                  <Label
                    htmlFor="systemPromptText"
                    className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground"
                  >
                    System prompt text
                  </Label>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {charCount.toLocaleString()} chars
                  </span>
                </div>
                <textarea
                  id="systemPromptText"
                  value={form.systemPromptText}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, systemPromptText: e.target.value }))
                  }
                  placeholder="Paste the full system prompt here…"
                  className="min-h-[340px] w-full resize-y border-2 border-accent bg-background/40 px-4 py-3 text-sm leading-6 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary rounded-none font-mono"
                />
              </div>
            </div>

            <aside className="space-y-5">
              <div className="border-2 border-border bg-background/30 p-4 rounded-none">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      Primary
                    </p>
                    <p className="text-sm text-foreground mt-1">
                      Mark this as the default system prompt for its type.
                    </p>
                  </div>
                  <label className="shrink-0 inline-flex items-center gap-2 select-none">
                    <input
                      type="checkbox"
                      checked={form.isPrimarySystemPrompt}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          isPrimarySystemPrompt: e.target.checked,
                        }))
                      }
                      className="peer sr-only"
                      aria-label="Primary system prompt"
                    />
                    <span className="h-6 w-11 border-2 border-accent bg-background/40 rounded-none relative transition-colors peer-checked:bg-primary peer-checked:border-primary">
                      <span className="absolute left-0.5 top-0.5 h-4 w-4 bg-foreground/80 transition-transform peer-checked:translate-x-5" />
                    </span>
                  </label>
                </div>
              </div>

              <div className="border-l-4 border-accent pl-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Type metadata
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Used for grouping and UI labels.
                </p>

                <div className="mt-4 grid gap-4">
                  <div className="grid gap-2">
                    <Label
                      htmlFor="type"
                      className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground"
                    >
                      Type (ID)
                    </Label>
                    <Input
                      id="type"
                      value={form.type}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, type: e.target.value }))
                      }
                      placeholder="qh76ye7pb3kyzp92vz649d4kq97yxzfx"
                      className="border-2 border-accent bg-background/40 text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:border-primary rounded-none"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label
                      htmlFor="typeName"
                      className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground"
                    >
                      Type name
                    </Label>
                    <Input
                      id="typeName"
                      value={form.typeName}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, typeName: e.target.value }))
                      }
                      placeholder="leads"
                      className="border-2 border-accent bg-background/40 text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:border-primary rounded-none"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label
                      htmlFor="typeDisplayName"
                      className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground"
                    >
                      Type display name
                    </Label>
                    <Input
                      id="typeDisplayName"
                      value={form.typeDisplayName}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, typeDisplayName: e.target.value }))
                      }
                      placeholder="Leads"
                      className="border-2 border-accent bg-background/40 text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:border-primary rounded-none"
                    />
                  </div>
                </div>
              </div>
            </aside>
          </div>

          <DialogFooter className="px-6 py-4 border-t-2 border-border bg-card/90 backdrop-blur-sm flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              {titleTrimmed ? (
                <>
                  Editing <span className="text-foreground">{titleTrimmed}</span>
                </>
              ) : (
                "Add a title to enable saving."
              )}
            </p>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-2 border-muted-foreground text-foreground hover:border-accent font-semibold uppercase rounded-none"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!titleTrimmed}
                className="bg-primary text-primary-foreground font-bold disabled:opacity-50 uppercase rounded-none"
              >
                {isEditing ? "Save" : "Add"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
