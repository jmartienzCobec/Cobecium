"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Doc, Id } from "../../convex/_generated/dataModel";
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
  ProcurementLinkForm,
  type ProcurementLinkFields,
} from "@/components/ProcurementLinkForm";
import { normalizeProcurementImport } from "@/lib/procurementImport";
import { LynxHeader } from "@/components/LynxHeader";
import {
  SystemPromptForm,
  type SystemPromptFields,
} from "@/components/SystemPromptForm";
import { HuntChatModal } from "@/components/HuntChatModal";

function stateKey(s: string | null | undefined) {
  return (s ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[().,]/g, "");
}

export function ProcurementGrid() {
  const links = useQuery(api.procurementLinks.list);
  const prompts = useQuery(api.systemPrompts.list);
  const myRole = useQuery(api.users.getMyRole);
  const isAdmin = myRole?.role === "admin";
  const importFromJson = useMutation(api.procurementLinks.importFromJson);
  const createSystemPrompt = useMutation(api.systemPrompts.create);
  const updateSystemPrompt = useMutation(api.systemPrompts.update);
  const [contextMenu, setContextMenu] = useState<null | {
    x: number;
    y: number;
    state: string;
  }>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [editing, setEditing] = useState<{
    id: Id<"procurementLinks">;
    fields: ProcurementLinkFields;
  } | null>(null);
  const [search, setSearch] = useState("");
  const [systemPromptFormOpen, setSystemPromptFormOpen] = useState(false);
  const [editingSystemPrompt, setEditingSystemPrompt] = useState<{
    id?: Id<"chatSystemPrompts">;
    initial: SystemPromptFields;
  } | null>(null);
  const [huntModalOpen, setHuntModalOpen] = useState(false);
  const [huntModalState, setHuntModalState] = useState<string | null>(null);
  const [huntModalDefaultPrompt, setHuntModalDefaultPrompt] = useState("");

  const filteredLinks = useMemo(() => {
    if (!links) return [];
    const keywords = search
      .split(",")
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean);
    if (keywords.length === 0) return links;
    return links.filter((link) => {
      const state = (link.state ?? "").toLowerCase();
      const city = (link.city ?? "").toLowerCase();
      const officialWebsite = (link.official_website ?? "").toLowerCase();
      const procurementLink = (link.procurement_link ?? "").toLowerCase();
      return keywords.some(
        (q) =>
          state.includes(q) ||
          city.includes(q) ||
          officialWebsite.includes(q) ||
          procurementLink.includes(q)
      );
    });
  }, [links, search]);

  const linksByState = useMemo(() => {
    const byState: Record<string, typeof filteredLinks> = {};
    for (const link of filteredLinks) {
      const state = link.state ?? "";
      if (!byState[state]) byState[state] = [];
      byState[state].push(link);
    }
    return byState;
  }, [filteredLinks]);

  const sortedStates = useMemo(
    () => Object.keys(linksByState).sort((a, b) => a.localeCompare(b)),
    [linksByState]
  );

  const promptByState = useMemo(() => {
    const map = new Map<string, Doc<"chatSystemPrompts">>();
    if (!prompts) return map;
    for (const p of prompts) {
      const k = stateKey(p.state);
      if (!k || k === "not found") continue;
      const existing = map.get(k);
      const isLeads = p.typeName === "leads";
      const existingIsLeads = existing ? existing.typeName === "leads" : false;
      if (!existing || (isLeads && !existingIsLeads)) {
        map.set(k, p);
      }
    }
    return map;
  }, [prompts]);

  const handleAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleEdit = (id: Id<"procurementLinks">, fields: ProcurementLinkFields) => {
    setEditing({ id, fields });
    setFormOpen(true);
  };

  const handleFormClose = (open: boolean) => {
    setFormOpen(open);
    if (!open) setEditing(null);
  };

  const handleSubmit = (_data: ProcurementLinkFields) => {
    setFormOpen(false);
    setEditing(null);
    // TODO: wire to Convex mutation when implemented
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
    const { links, error } = normalizeProcurementImport(parsed);
    if (error) {
      setImportError(error);
      return;
    }
    if (links.length === 0) {
      setImportError("No valid links to import. Provide an array of link objects, or an object with arrays of link objects. Each link needs state, city, official_website (or officialWebsite), and procurement_link (or procurementLink).");
      return;
    }
    setImporting(true);
    try {
      const { inserted } = await importFromJson({ links });
      setImportOpen(false);
      setImportText("");
      setImportError(null);
      if (inserted > 0) {
        // Optional: toast or message "Imported N links"
      }
    } catch (e) {
      setImportError(e instanceof Error ? e.message : "Import failed.");
    } finally {
      setImporting(false);
    }
  };

  const openSystemPromptEditor = (state: string) => {
    const affiliated = promptByState.get(stateKey(state));
    if (affiliated) {
      setEditingSystemPrompt({
        id: affiliated._id,
        initial: {
          title: affiliated.title,
          description: affiliated.description,
          systemPromptText: affiliated.systemPromptText,
          isPrimarySystemPrompt: affiliated.isPrimarySystemPrompt,
          type: affiliated.type,
          typeName: affiliated.typeName,
          typeDisplayName: affiliated.typeDisplayName,
        },
      });
      setSystemPromptFormOpen(true);
      return;
    }

    // Fallback: allow creating a prompt without leaving the page.
    setEditingSystemPrompt({
      initial: {
        title: `${state} - Leads Generation Prompt`,
        description: `Auto-generated state-specific prompt for ${state}`,
        systemPromptText: "",
        isPrimarySystemPrompt: false,
        type: "",
        typeName: "leads",
        typeDisplayName: "Leads",
      },
    });
    setSystemPromptFormOpen(true);
  };

  const handleSystemPromptSubmit = async (data: SystemPromptFields) => {
    try {
      if (editingSystemPrompt?.id) {
        await updateSystemPrompt({
          id: editingSystemPrompt.id,
          title: data.title,
          description: data.description,
          systemPromptText: data.systemPromptText,
          isPrimarySystemPrompt: data.isPrimarySystemPrompt,
          type: data.type,
          typeName: data.typeName,
          typeDisplayName: data.typeDisplayName,
        });
      } else {
        await createSystemPrompt({
          title: data.title,
          description: data.description,
          systemPromptText: data.systemPromptText,
          isPrimarySystemPrompt: data.isPrimarySystemPrompt,
          type: data.type,
          typeName: data.typeName,
          typeDisplayName: data.typeDisplayName,
        });
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to save system prompt.");
    } finally {
      setEditingSystemPrompt(null);
    }
  };

  useEffect(() => {
    if (!contextMenu) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setContextMenu(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [contextMenu]);

  if (links === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-primary">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Diagonal stripe pattern (base theme) */}
      <div
        className="fixed inset-0 pointer-events-none opacity-30 base-pattern"
        aria-hidden
      />

      <LynxHeader subtitle="State & city portals" activePage="procurement" />

      <div className="relative max-w-6xl mx-auto px-6 py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">
          <div className="space-y-2 w-full sm:max-w-md">
            <label
              htmlFor="procurement-search"
              className="text-sm font-medium text-muted-foreground uppercase tracking-wide"
            >
              Search by state or city
            </label>
            <Input
              id="procurement-search"
              type="text"
              placeholder="e.g. California, Los Angeles or CA, Austin"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-2 border-accent bg-card text-foreground placeholder:text-muted-foreground focus-visible:ring-accent rounded-none"
            />
          </div>
          {isAdmin && (
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
                Add link
              </Button>
            </div>
          )}
        </div>

        {links.length === 0 ? (
          <div className="border-4 border-dashed border-primary p-16 text-center">
            <p className="text-muted-foreground text-xl font-semibold uppercase mb-8">
              No procurement links yet.
            </p>
            {isAdmin && (
              <Button
                variant="outline"
                onClick={handleAdd}
                className="border-2 border-accent text-accent font-semibold uppercase hover:bg-accent hover:text-accent-foreground rounded-none"
              >
                Add link
              </Button>
            )}
          </div>
        ) : filteredLinks.length === 0 ? (
          <div className="border-4 border-dashed border-primary p-12 text-center">
            <p className="text-muted-foreground uppercase">No matches for your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedStates.map((state, stateIndex) => {
              const stateLinks = linksByState[state];
              const isOrange = stateIndex % 2 === 0;
              return (
                <div
                  key={state}
                  className={`relative bg-card border-l-4 p-5 transition-all ${isOrange ? "hover:shadow-[4px_4px_0_0_var(--base-orange)]" : "hover:shadow-[4px_4px_0_0_var(--base-teal)]"}`}
                  style={{
                    borderLeftColor: isOrange ? "var(--base-orange)" : "var(--base-teal)",
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setContextMenu({ x: e.clientX, y: e.clientY, state });
                  }}
                >
                  <h2 className="text-xl font-bold text-foreground uppercase">
                    {state}
                  </h2>
                  {isAdmin && (
                    <div className="mt-1">
                      <button
                        type="button"
                        onClick={() => openSystemPromptEditor(state)}
                        className="text-muted-foreground text-xs uppercase tracking-wide transition-colors hover:text-primary"
                      >
                        Prompt
                      </button>
                    </div>
                  )}
                  <ul className="mt-4 space-y-2 list-none p-0">
                    {(stateLinks ?? []).map((link) => (
                      <li key={link._id} className="flex items-center gap-2 flex-wrap">
                        {link.procurement_link ? (
                          <a
                            href={link.procurement_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent hover:text-primary font-semibold uppercase text-sm transition-colors"
                          >
                            {link.city}
                          </a>
                        ) : (
                          <span className="text-muted-foreground uppercase text-sm">
                            {link.city}
                          </span>
                        )}
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() =>
                              handleEdit(link._id, {
                                state: link.state,
                                city: link.city,
                                official_website: link.official_website,
                                procurement_link: link.procurement_link,
                              })
                            }
                            className="text-xs text-muted-foreground hover:text-primary font-semibold uppercase shrink-0"
                          >
                            Edit
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {contextMenu && (() => {
        const padding = 8;
        const menuWidth = 220;
        const menuHeight = 44;
        const vw =
          typeof window !== "undefined" ? window.innerWidth : contextMenu.x + menuWidth + padding;
        const vh =
          typeof window !== "undefined"
            ? window.innerHeight
            : contextMenu.y + menuHeight + padding;
        const left = Math.max(
          padding,
          Math.min(contextMenu.x, vw - menuWidth - padding)
        );
        const top = Math.max(
          padding,
          Math.min(contextMenu.y, vh - menuHeight - padding)
        );

        return (
          <div
            className="fixed inset-0 z-50"
            onClick={() => setContextMenu(null)}
            onContextMenu={(e) => {
              e.preventDefault();
              setContextMenu(null);
            }}
            aria-hidden
          >
            <div
              className="fixed bg-card border-2 border-accent shadow-[4px_4px_0_0_var(--base-orange)] rounded-none min-w-[220px]"
              style={{ left, top }}
              onClick={(e) => e.stopPropagation()}
              role="menu"
              aria-label={`Actions for ${contextMenu.state}`}
            >
              <button
                type="button"
                className="w-full text-left px-3 py-2 text-sm font-semibold uppercase text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                role="menuitem"
                onClick={() => {
                  const state = contextMenu.state;
                  const defaultPrompt =
                    promptByState.get(stateKey(state))?.systemPromptText ?? "";
                  setHuntModalState(state);
                  setHuntModalDefaultPrompt(defaultPrompt);
                  setHuntModalOpen(true);
                  setContextMenu(null);
                }}
              >
                Start Hunt
              </button>
            </div>
          </div>
        );
      })()}

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="sm:max-w-lg bg-card border-4 border-primary text-foreground rounded-none">
          <DialogHeader>
            <DialogTitle className="text-primary font-bold uppercase">
              Import procurement links
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            Paste JSON: object with keys and arrays of link objects.
          </p>
          <textarea
            className="min-h-[200px] w-full border-2 border-accent bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary rounded-none"
            placeholder='{"us_state_procurement": [...]}'
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

      <ProcurementLinkForm
        open={formOpen}
        onOpenChange={handleFormClose}
        initial={editing?.fields}
        onSubmit={handleSubmit}
        isEditing={editing !== null}
      />

      <SystemPromptForm
        open={systemPromptFormOpen}
        onOpenChange={(open) => {
          setSystemPromptFormOpen(open);
          if (!open) setEditingSystemPrompt(null);
        }}
        initial={editingSystemPrompt?.initial}
        onSubmit={handleSystemPromptSubmit}
        isEditing={Boolean(editingSystemPrompt?.id)}
      />

      <HuntChatModal
        open={huntModalOpen}
        onOpenChange={(open) => {
          setHuntModalOpen(open);
          if (!open) setHuntModalState(null);
        }}
        stateName={huntModalState ?? ""}
        defaultSystemPrompt={huntModalDefaultPrompt}
      />
    </div>
  );
}
