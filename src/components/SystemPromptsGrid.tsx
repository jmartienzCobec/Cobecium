"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useSystemPrompts } from "@/hooks/useSystemPrompts";
import type { Id } from "../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  SystemPromptForm,
  type SystemPromptFields,
} from "@/components/SystemPromptForm";
import { SystemPromptCard } from "@/components/SystemPromptCard";
import { normalizeSystemPromptsImport } from "@/lib/systemPromptsImport";
import { useSearchParams } from "react-router-dom";
import { LynxHeader } from "@/components/LynxHeader";

export function SystemPromptsGrid() {
  const prompts = useSystemPrompts();
  const createPrompt = useMutation(api.systemPrompts.create);
  const updatePrompt = useMutation(api.systemPrompts.update);
  const removePrompt = useMutation(api.systemPrompts.remove);
  const importFromJson = useMutation(api.systemPrompts.importFromJson);

  const [searchParams] = useSearchParams();
  const openId = searchParams.get("openId");
  const urlQuery = (searchParams.get("q") ?? searchParams.get("state") ?? "").trim();

  const [formOpen, setFormOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [editing, setEditing] = useState<{
    id: Id<"chatSystemPrompts">;
    fields: SystemPromptFields;
  } | null>(null);
  const [search, setSearch] = useState(urlQuery);

  useEffect(() => {
    // Keep UI in sync if user navigates in-app via querystring links.
    setSearch(urlQuery);
  }, [urlQuery]);

  useEffect(() => {
    if (!openId) return;
    // Defer until after render.
    setTimeout(() => {
      document.getElementById(openId)?.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 0);
  }, [openId]);

  const filteredPrompts = useMemo(() => {
    if (!prompts) return [];
    const q = search.trim().toLowerCase();
    if (!q) return prompts;
    return prompts.filter((p) => {
      return (
        (p.state ?? "").toLowerCase().includes(q) ||
        (p.title ?? "").toLowerCase().includes(q) ||
        (p.typeName ?? "").toLowerCase().includes(q) ||
        (p.typeDisplayName ?? "").toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q)
      );
    });
  }, [prompts, search]);

  const handleAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleEdit = (id: Id<"chatSystemPrompts">, fields: SystemPromptFields) => {
    setEditing({ id, fields });
    setFormOpen(true);
  };

  const handleFormClose = (open: boolean) => {
    setFormOpen(open);
    if (!open) setEditing(null);
  };

  const handleSubmit = async (data: SystemPromptFields) => {
    if (editing) {
      await updatePrompt({
        id: editing.id,
        title: data.title,
        description: data.description,
        systemPromptText: data.systemPromptText,
        isPrimarySystemPrompt: data.isPrimarySystemPrompt,
        type: data.type,
        typeName: data.typeName,
        typeDisplayName: data.typeDisplayName,
      });
    } else {
      await createPrompt({
        title: data.title,
        description: data.description,
        systemPromptText: data.systemPromptText,
        isPrimarySystemPrompt: data.isPrimarySystemPrompt,
        type: data.type,
        typeName: data.typeName,
        typeDisplayName: data.typeDisplayName,
      });
    }
    setFormOpen(false);
    setEditing(null);
  };

  const handleDelete = async (id: Id<"chatSystemPrompts">) => {
    if (!confirm("Delete this system prompt?")) return;
    await removePrompt({ id });
  };

  const handleImportSubmit = async () => {
    setImportError(null);
    let parsed: unknown;
    try {
      parsed = JSON.parse(importText);
    } catch {
      setImportError("Invalid JSON.");
      return;
    }
    const { prompts: normalized, error } = normalizeSystemPromptsImport(parsed);
    if (error) {
      setImportError(error);
      return;
    }
    if (normalized.length === 0) {
      setImportError(
        "No valid prompts to import. Provide an array of prompt objects or an object with chatSystemPrompts array. Each item needs at least a title."
      );
      return;
    }
    setImporting(true);
    try {
      await importFromJson({ prompts: normalized });
      setImportOpen(false);
      setImportText("");
      setImportError(null);
    } catch (e) {
      setImportError(e instanceof Error ? e.message : "Import failed.");
    } finally {
      setImporting(false);
    }
  };

  if (prompts === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-primary">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <div
        className="fixed inset-0 pointer-events-none opacity-30 base-pattern"
        aria-hidden
      />

      <LynxHeader subtitle="System prompts" activePage="system-prompts" />

      <div className="relative max-w-6xl mx-auto px-6 py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">
          <div className="space-y-2 w-full sm:max-w-md">
            <label
              htmlFor="system-prompts-search"
              className="text-sm font-medium text-muted-foreground uppercase tracking-wide"
            >
              Search by state, title, or type
            </label>
            <Input
              id="system-prompts-search"
              type="text"
              placeholder="e.g. Wyoming, leads"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-2 border-accent bg-card text-foreground placeholder:text-muted-foreground focus-visible:ring-accent rounded-none"
            />
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setImportOpen(true);
                setImportError(null);
                setImportText("");
              }}
              className="border-2 border-accent text-accent font-semibold uppercase hover:bg-accent hover:text-accent-foreground rounded-none"
            >
              Import JSON
            </Button>
            <Button
              onClick={handleAdd}
              className="bg-primary text-primary-foreground font-bold uppercase hover:bg-primary/90 rounded-none"
            >
              Add prompt
            </Button>
          </div>
        </div>

        {prompts.length === 0 ? (
          <div className="border-4 border-dashed border-primary p-16 text-center">
            <p className="text-muted-foreground text-xl font-semibold uppercase mb-8">
              No system prompts yet.
            </p>
            <Button
              variant="outline"
              onClick={handleAdd}
              className="border-2 border-accent text-accent font-semibold uppercase hover:bg-accent hover:text-accent-foreground rounded-none"
            >
              Add prompt
            </Button>
          </div>
        ) : filteredPrompts.length === 0 ? (
          <div className="border-4 border-dashed border-primary p-12 text-center">
            <p className="text-muted-foreground uppercase">
              No matches for your search.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrompts.map((prompt) => (
              <SystemPromptCard
                key={prompt._id}
                prompt={prompt}
                onEdit={handleEdit}
                onDelete={handleDelete}
                autoOpenView={openId === prompt._id}
                highlight={openId === prompt._id}
              />
            ))}
          </div>
        )}
      </div>

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="sm:max-w-lg bg-card border-4 border-primary text-foreground rounded-none">
          <DialogHeader>
            <DialogTitle className="text-primary font-bold uppercase">
              Import system prompts
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            Paste JSON: object with <code className="bg-muted px-1">chatSystemPrompts</code> array or a root array of prompt objects.
          </p>
          <textarea
            className="min-h-[200px] w-full border-2 border-accent bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary rounded-none font-mono text-sm"
            placeholder='{"chatSystemPrompts": [...]}'
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
          />
          {importError && (
            <p className="text-destructive font-medium">{importError}</p>
          )}
          <DialogFooter className="gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setImportOpen(false)}
              disabled={importing}
              className="border-2 border-muted-foreground text-foreground hover:border-accent font-semibold uppercase rounded-none"
            >
              Cancel
            </Button>
            <Button
              onClick={handleImportSubmit}
              disabled={importing || !importText.trim()}
              className="bg-primary text-primary-foreground font-bold disabled:opacity-50 uppercase rounded-none"
            >
              {importing ? "Importing…" : "Import"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SystemPromptForm
        open={formOpen}
        onOpenChange={handleFormClose}
        initial={editing?.fields}
        onSubmit={handleSubmit}
        isEditing={editing !== null}
      />
    </div>
  );
}
