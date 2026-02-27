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

export function Style9Page() {
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
      <div className="min-h-screen bg-[#f0eeeb] flex items-center justify-center text-[#2563eb]" style={{ fontFamily: '"Manrope", sans-serif' }}>
        <p>Loading…</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#f0eeeb] text-[#1c1917] antialiased"
      style={{ fontFamily: '"Source Sans 3", sans-serif' }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700&family=Source+Sans+3:wght@400;500;600&display=swap');
      `}</style>

      <header className="bg-white border-b border-[#e5e2de] px-6 py-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-xl font-bold text-[#1c1917] tracking-tight" style={{ fontFamily: '"Manrope", sans-serif' }}>
            Procurement Links
          </h1>
          <p className="text-[#78716c] text-sm">State and city portals</p>
          <nav className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setImportOpen(true);
                setImportError(null);
                setImportText("");
              }}
              className="px-3 py-2 border border-[#2563eb] text-[#2563eb] rounded-lg text-sm font-semibold hover:bg-[#2563eb] hover:text-white transition-colors"
              style={{ fontFamily: '"Manrope", sans-serif' }}
            >
              Import JSON
            </button>
            <button
              type="button"
              onClick={handleAdd}
              className="px-3 py-2 bg-[#2563eb] text-white rounded-lg text-sm font-bold hover:bg-[#1d4ed8] transition-colors"
              style={{ fontFamily: '"Manrope", sans-serif' }}
            >
              Add link
            </button>
          </nav>
        </div>
      </header>

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="sm:max-w-lg bg-white border border-[#e5e2de] text-[#1c1917] rounded-xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-[#2563eb]" style={{ fontFamily: '"Manrope", sans-serif' }}>
              Import procurement links
            </DialogTitle>
          </DialogHeader>
          <p className="text-[#78716c] text-sm">
            Paste JSON: object with keys and arrays of &#123; state, city, official_website, procurement_link &#125;
          </p>
          <textarea
            className="min-h-[200px] w-full bg-[#fafaf9] border border-[#e5e2de] rounded-lg px-4 py-3 text-[#1c1917] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent"
            placeholder='{"us_state_procurement": [...]}'
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
          />
          {importError && <p className="text-red-600 text-sm">{importError}</p>}
          <DialogFooter className="gap-3 mt-4">
            <button
              type="button"
              onClick={() => setImportOpen(false)}
              disabled={importing}
              className="px-3 py-2 border border-[#a8a29e] text-[#1c1917] rounded-lg text-sm font-medium hover:bg-[#f0eeeb]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleImportSubmit}
              disabled={importing || !importText.trim()}
              className="px-3 py-2 bg-[#2563eb] text-white rounded-lg text-sm font-bold disabled:opacity-50"
              style={{ fontFamily: '"Manrope", sans-serif' }}
            >
              {importing ? "Importing…" : "Import"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <main className="max-w-4xl mx-auto px-6 py-6">
        {links.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#e5e2de] p-10 text-center shadow-sm">
            <p className="text-[#78716c] mb-4">No procurement links yet.</p>
            <button
              type="button"
              onClick={handleAdd}
              className="px-3 py-2 border-2 border-[#2563eb] text-[#2563eb] rounded-lg font-bold hover:bg-[#2563eb] hover:text-white transition-colors"
              style={{ fontFamily: '"Manrope", sans-serif' }}
            >
              Add link
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {links.map((link) => (
              <div
                key={link._id}
                className="bg-white rounded-xl border border-[#e5e2de] px-5 py-4 flex flex-wrap items-center justify-between gap-4 hover:border-[#2563eb]/40 hover:shadow-md transition-all"
              >
                <div className="min-w-0">
                  <h2 className="font-bold text-[#1c1917] text-lg" style={{ fontFamily: '"Manrope", sans-serif' }}>
                    {link.city}
                  </h2>
                  <p className="text-[#78716c] text-sm mt-0.5">{link.state}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {link.official_website && (
                    <a
                      href={link.official_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#2563eb] hover:underline font-medium text-sm whitespace-nowrap"
                    >
                      Official site
                    </a>
                  )}
                  {link.procurement_link && (
                    <a
                      href={link.procurement_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#2563eb] hover:underline font-medium text-sm whitespace-nowrap"
                    >
                      Procurement
                    </a>
                  )}
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
                    className="text-[#78716c] hover:text-[#2563eb] text-sm font-medium"
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
