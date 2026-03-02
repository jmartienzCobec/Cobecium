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

export function Style8Page() {
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
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center text-[#b71c1c]" style={{ fontFamily: '"Fraunces", serif' }}>
        <p>Loading…</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#faf8f5] text-[#1a1a1a] antialiased"
      style={{ fontFamily: '"Open Sans", sans-serif' }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700&family=Open+Sans:wght@400;500;600&display=swap');
      `}</style>

      <header className="border-b-2 border-[#1a1a1a] px-6 py-5">
        <div className="max-w-3xl mx-auto flex flex-wrap items-baseline justify-between gap-4">
          <h1 className="text-2xl font-semibold text-[#1a1a1a] tracking-tight" style={{ fontFamily: '"Fraunces", serif' }}>
            Lynx
          </h1>
          <p className="text-[#666] text-sm">State and city procurement portals</p>
          <nav className="flex gap-2 w-full sm:w-auto sm:order-3">
            <button
              type="button"
              onClick={() => {
                setImportOpen(true);
                setImportError(null);
                setImportText("");
              }}
              className="px-4 py-2 border-2 border-[#1a1a1a] text-[#1a1a1a] rounded-md font-medium hover:bg-[#1a1a1a] hover:text-[#faf8f5] transition-colors"
            >
              Import JSON
            </button>
            <button
              type="button"
              onClick={handleAdd}
              className="px-4 py-2 bg-[#b71c1c] text-white rounded-md font-semibold hover:bg-[#8b0000] transition-colors"
              style={{ fontFamily: '"Fraunces", serif' }}
            >
              Add link
            </button>
          </nav>
        </div>
      </header>

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="sm:max-w-lg bg-[#faf8f5] border-2 border-[#1a1a1a] text-[#1a1a1a] rounded-md">
          <DialogHeader>
            <DialogTitle className="text-[#b71c1c]" style={{ fontFamily: '"Fraunces", serif' }}>
              Import procurement links
            </DialogTitle>
          </DialogHeader>
          <p className="text-[#666] text-sm">
            Paste JSON: object with keys and arrays of &#123; state, city, official_website, procurement_link &#125;
          </p>
          <textarea
            className="min-h-[200px] w-full bg-white border-2 border-[#ccc] rounded-md px-4 py-3 text-[#1a1a1a] focus:outline-none focus:border-[#b71c1c]"
            placeholder='{"us_state_procurement": [...]}'
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
          />
          {importError && <p className="text-[#b71c1c] text-sm">{importError}</p>}
          <DialogFooter className="gap-3 mt-4">
            <button
              type="button"
              onClick={() => setImportOpen(false)}
              disabled={importing}
              className="px-4 py-2 border-2 border-[#666] text-[#1a1a1a] rounded-md font-medium hover:border-[#1a1a1a]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleImportSubmit}
              disabled={importing || !importText.trim()}
              className="px-4 py-2 bg-[#b71c1c] text-white rounded-md font-semibold disabled:opacity-50"
              style={{ fontFamily: '"Fraunces", serif' }}
            >
              {importing ? "Importing…" : "Import"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <main className="max-w-3xl mx-auto px-6 py-8">
        {links.length === 0 ? (
          <div className="border-2 border-dashed border-[#999] rounded-md p-12 text-center">
            <p className="text-[#666] mb-4">No procurement links yet.</p>
            <button
              type="button"
              onClick={handleAdd}
              className="px-4 py-2 border-2 border-[#b71c1c] text-[#b71c1c] rounded-md font-semibold hover:bg-[#b71c1c] hover:text-white transition-colors"
              style={{ fontFamily: '"Fraunces", serif' }}
            >
              Add link
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-0">
            {[0, 1].map((col) => (
              <ul key={col} className="space-y-0 divide-y divide-[#ddd]">
                {links
                  .filter((_, i) => i % 2 === col)
                  .map((link, idx) => {
                    const i = idx * 2 + col;
                    return (
                      <li
                        key={link._id}
                        className="flex items-start gap-4 py-5 hover:bg-[#f5f3ef] transition-colors rounded-md px-1"
                      >
                        <span
                          className="text-3xl font-semibold text-[#b71c1c] tabular-nums flex-shrink-0 w-10 text-right"
                          style={{ fontFamily: '"Fraunces", serif' }}
                          aria-hidden
                        >
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h2 className="font-semibold text-[#1a1a1a] text-lg" style={{ fontFamily: '"Fraunces", serif' }}>
                            {link.city}
                          </h2>
                          <p className="text-[#666] text-sm mt-0.5">{link.state}</p>
                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                            {link.official_website && (
                              <a
                                href={link.official_website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#b71c1c] hover:underline text-sm font-medium"
                              >
                                Official site
                              </a>
                            )}
                            {link.procurement_link && (
                              <a
                                href={link.procurement_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#b71c1c] hover:underline text-sm font-medium"
                              >
                                Procurement portal
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
                            className="mt-2 text-xs text-[#666] hover:text-[#b71c1c] font-medium"
                          >
                            Edit
                          </button>
                        </div>
                      </li>
                    );
                  })}
              </ul>
            ))}
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
