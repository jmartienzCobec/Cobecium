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

export function StylePath10Page() {
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

  const getInitial = (city: string) =>
    (city || "?").charAt(0).toUpperCase();

  if (links === undefined) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-[#7c3aed]" style={{ fontFamily: '"Lexend", sans-serif' }}>
        <p>Loading…</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#0f172a] text-[#e2e8f0] antialiased"
      style={{ fontFamily: '"Figtree", sans-serif' }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@500;600;700&family=Figtree:wght@400;500;600&display=swap');
      `}</style>

      <header className="border-b border-[#334155] px-6 py-5">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold text-white tracking-tight" style={{ fontFamily: '"Lexend", sans-serif' }}>
            Lynx
          </h1>
          <p className="text-[#94a3b8] text-sm">State and city portals</p>
          <nav className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setImportOpen(true);
                setImportError(null);
                setImportText("");
              }}
              className="px-4 py-2 border border-[#7c3aed] text-[#7c3aed] rounded-lg font-medium hover:bg-[#7c3aed] hover:text-white transition-colors"
              style={{ fontFamily: '"Lexend", sans-serif' }}
            >
              Import JSON
            </button>
            <button
              type="button"
              onClick={handleAdd}
              className="px-4 py-2 bg-[#7c3aed] text-white rounded-lg font-semibold hover:bg-[#6d28d9] transition-colors"
              style={{ fontFamily: '"Lexend", sans-serif' }}
            >
              Add link
            </button>
          </nav>
        </div>
      </header>

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="sm:max-w-lg bg-[#1e293b] border border-[#334155] text-[#e2e8f0] rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-[#a78bfa]" style={{ fontFamily: '"Lexend", sans-serif' }}>
              Import procurement links
            </DialogTitle>
          </DialogHeader>
          <p className="text-[#94a3b8] text-sm">
            Paste JSON: object with keys and arrays of &#123; state, city, official_website, procurement_link &#125;
          </p>
          <textarea
            className="min-h-[200px] w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-3 text-[#e2e8f0] focus:outline-none focus:border-[#7c3aed]"
            placeholder='{"us_state_procurement": [...]}'
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
          />
          {importError && <p className="text-red-400 text-sm">{importError}</p>}
          <DialogFooter className="gap-3 mt-4">
            <button
              type="button"
              onClick={() => setImportOpen(false)}
              disabled={importing}
              className="px-4 py-2 border border-[#64748b] text-[#e2e8f0] rounded-lg font-medium hover:border-[#7c3aed]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleImportSubmit}
              disabled={importing || !importText.trim()}
              className="px-4 py-2 bg-[#7c3aed] text-white rounded-lg font-semibold disabled:opacity-50"
              style={{ fontFamily: '"Lexend", sans-serif' }}
            >
              {importing ? "Importing…" : "Import"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {links.length === 0 ? (
          <div className="border border-dashed border-[#475569] rounded-xl p-12 text-center">
            <p className="text-[#94a3b8] mb-4">No procurement links yet.</p>
            <button
              type="button"
              onClick={handleAdd}
              className="px-4 py-2 border-2 border-[#7c3aed] text-[#7c3aed] rounded-lg font-semibold hover:bg-[#7c3aed] hover:text-white transition-colors"
              style={{ fontFamily: '"Lexend", sans-serif' }}
            >
              Add link
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {links.map((link) => (
              <div
                key={link._id}
                className="bg-[#1e293b] border border-[#334155] rounded-xl p-4 flex gap-4 hover:border-[#7c3aed]/60 transition-colors"
              >
                <div
                  className="flex-shrink-0 w-12 h-12 rounded-full bg-[#7c3aed] text-white flex items-center justify-center text-lg font-bold"
                  style={{ fontFamily: '"Lexend", sans-serif' }}
                  aria-hidden
                >
                  {getInitial(link.city)}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-white text-lg" style={{ fontFamily: '"Lexend", sans-serif' }}>
                    {link.city}
                  </h2>
                  <p className="text-[#94a3b8] text-sm mt-0.5">{link.state}</p>
                  <div className="mt-3 space-y-1">
                    {link.official_website && (
                      <a
                        href={link.official_website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-[#a78bfa] hover:text-[#c4b5fd] text-sm transition-colors"
                      >
                        Official site
                      </a>
                    )}
                    {link.procurement_link && (
                      <a
                        href={link.procurement_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-[#a78bfa] hover:text-[#c4b5fd] text-sm transition-colors"
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
                    className="mt-2 text-xs text-[#94a3b8] hover:text-[#a78bfa] transition-colors"
                  >
                    Edit
                  </button>
                </div>
              </div>
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
