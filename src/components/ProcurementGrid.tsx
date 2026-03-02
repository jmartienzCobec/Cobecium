"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
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
  ProcurementLinkForm,
  type ProcurementLinkFields,
} from "@/components/ProcurementLinkForm";
import { normalizeProcurementImport } from "@/lib/procurementImport";

export function ProcurementGrid() {
  const links = useQuery(api.procurementLinks.list);
  const importFromJson = useMutation(api.procurementLinks.importFromJson);
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

      <header className="relative border-t-4 border-b-4 border-primary px-6 py-5">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-6">
          <h1 className="text-3xl font-extrabold text-foreground uppercase tracking-tight">
            Procurement links
          </h1>
          <p className="absolute left-1/2 -translate-x-1/2 top-[3.2rem] text-muted-foreground text-sm uppercase tracking-widest">
            State & city portals
          </p>
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
        </div>
      </header>

      <div className="relative max-w-6xl mx-auto px-6 py-6">
        <div className="space-y-2 mb-6">
          <label htmlFor="procurement-search" className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Search by state or city
          </label>
          <Input
            id="procurement-search"
            type="text"
            placeholder="e.g. California, Los Angeles or CA, Austin"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md border-2 border-accent bg-card text-foreground placeholder:text-muted-foreground focus-visible:ring-accent rounded-none"
          />
        </div>

        {links.length === 0 ? (
          <div className="border-4 border-dashed border-primary p-16 text-center">
            <p className="text-muted-foreground text-xl font-semibold uppercase mb-8">
              No procurement links yet.
            </p>
            <Button
              variant="outline"
              onClick={handleAdd}
              className="border-2 border-accent text-accent font-semibold uppercase hover:bg-accent hover:text-accent-foreground rounded-none"
            >
              Add link
            </Button>
          </div>
        ) : filteredLinks.length === 0 ? (
          <div className="border-4 border-dashed border-primary p-12 text-center">
            <p className="text-muted-foreground uppercase">No matches for your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLinks.map((link, i) => {
              const isOrange = i % 2 === 0;
              return (
              <div
                key={link._id}
                className={`relative bg-card border-l-4 p-5 transition-all ${isOrange ? "hover:shadow-[4px_4px_0_0_var(--base-orange)]" : "hover:shadow-[4px_4px_0_0_var(--base-teal)]"}`}
                style={{
                  borderLeftColor: isOrange ? "var(--base-orange)" : "var(--base-teal)",
                }}
              >
                <h2 className="text-xl font-bold text-foreground uppercase">
                  {link.city}
                </h2>
                <p className="text-muted-foreground text-sm mt-1 uppercase tracking-wide">
                  {link.state}
                </p>
                <div className="mt-4 space-y-2">
                  {link.official_website && (
                    <a
                      href={link.official_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-primary hover:text-accent font-semibold uppercase text-sm transition-colors"
                    >
                      Official site
                    </a>
                  )}
                  {link.procurement_link && (
                    <a
                      href={link.procurement_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-accent hover:text-primary font-semibold uppercase text-sm transition-colors"
                    >
                      Procurement
                    </a>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    handleEdit(link._id, {
                      state: link.state,
                      city: link.city,
                      official_website: link.official_website,
                      procurement_link: link.procurement_link,
                    })
                  }
                  className="mt-3 text-xs text-muted-foreground hover:text-primary font-semibold uppercase h-auto p-0"
                >
                  Edit
                </Button>
              </div>
              );
            })}
          </div>
        )}
      </div>

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
    </div>
  );
}
