"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useProcurementLinks } from "@/hooks/useProcurementLinks";
import {
  ProcurementLinkForm,
  type ProcurementLinkFields,
} from "@/components/ProcurementLinkForm";
import { normalizeProcurementImport } from "@/lib/procurementImport";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export function Style10Page() {
  const links = useProcurementLinks();
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

  const handleAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleEdit = (_id: Id<"procurementLinks">, fields: ProcurementLinkFields) => {
    setEditing({ id: _id, fields });
    setFormOpen(true);
  };

  const handleFormClose = (open: boolean) => {
    setFormOpen(open);
    if (!open) setEditing(null);
  };

  const handleSubmit = (_data: ProcurementLinkFields) => {
    setFormOpen(false);
    setEditing(null);
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
      await importFromJson({ links });
      setImportOpen(false);
      setImportText("");
      setImportError(null);
    } catch (e) {
      setImportError(e instanceof Error ? e.message : "Import failed.");
    } finally {
      setImporting(false);
    }
  };

  if (links === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-primary">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground antialiased relative">
      {/* Diagonal stripe pattern (global base-pattern) */}
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
            <button
              type="button"
              onClick={() => {
                setImportOpen(true);
                setImportError(null);
                setImportText("");
              }}
              className="px-4 py-2.5 border-2 border-accent text-accent font-semibold uppercase hover:bg-accent hover:text-accent-foreground transition-colors rounded-none"
            >
              Import JSON
            </button>
            <button
              type="button"
              onClick={handleAdd}
              className="px-4 py-2.5 bg-primary text-primary-foreground font-bold uppercase hover:bg-primary/90 transition-colors rounded-none"
            >
              Add link
            </button>
          </div>
        </div>
      </header>

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
            className="min-h-[200px] w-full bg-background border-2 border-accent px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary rounded-none"
            placeholder='{"us_state_procurement": [...]}'
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
          />
          {importError && <p className="text-destructive font-medium">{importError}</p>}
          <DialogFooter className="gap-3 mt-4">
            <button
              type="button"
              onClick={() => setImportOpen(false)}
              disabled={importing}
              className="px-4 py-2.5 border-2 border-muted-foreground text-foreground hover:border-accent font-semibold uppercase rounded-none"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleImportSubmit}
              disabled={importing || !importText.trim()}
              className="px-4 py-2.5 bg-primary text-primary-foreground font-bold disabled:opacity-50 uppercase rounded-none"
            >
              {importing ? "Importing…" : "Import"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <main className="relative max-w-6xl mx-auto px-6 py-10">
        {links.length === 0 ? (
          <div className="border-4 border-dashed border-primary p-16 text-center">
            <p className="text-muted-foreground text-xl font-semibold uppercase mb-8">
              No procurement links yet.
            </p>
            <button
              type="button"
              onClick={handleAdd}
              className="px-4 py-2.5 border-2 border-accent text-accent font-semibold uppercase hover:bg-accent hover:text-accent-foreground rounded-none"
            >
              Add link
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {links.map((link, i) => {
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
                  className="mt-3 text-xs text-muted-foreground hover:text-primary font-semibold uppercase"
                >
                  Edit
                </button>
              </div>
              );
            })}
          </div>
        )}
      </main>

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
