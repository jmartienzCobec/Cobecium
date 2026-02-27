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

export function Style7Page() {
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
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center text-[#e91e8c]" style={{ fontFamily: '"Archivo", sans-serif' }}>
        <p>Loading…</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#0d0d0d] text-[#e0e0e0] antialiased"
      style={{ fontFamily: '"Sora", sans-serif' }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800&family=Sora:wght@400;500;600&display=swap');
      `}</style>

      <header className="px-6 py-5 border-b-4 border-[#e91e8c]">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: '"Archivo", sans-serif' }}>
              Procurement Links
            </h1>
            <p className="text-[#888] text-sm mt-0.5" style={{ fontFamily: '"Sora", sans-serif' }}>
              State & city portals
            </p>
          </div>
          <nav className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setImportOpen(true);
                setImportError(null);
                setImportText("");
              }}
              className="px-4 py-2 border-2 border-[#e91e8c] text-[#e91e8c] rounded-lg font-semibold hover:bg-[#e91e8c] hover:text-[#0d0d0d] transition-colors"
              style={{ fontFamily: '"Archivo", sans-serif' }}
            >
              Import JSON
            </button>
            <button
              type="button"
              onClick={handleAdd}
              className="px-4 py-2 bg-[#e91e8c] text-white font-bold rounded-lg hover:bg-[#f06292] transition-colors"
              style={{ fontFamily: '"Archivo", sans-serif' }}
            >
              Add link
            </button>
          </nav>
        </div>
      </header>

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="sm:max-w-lg bg-[#1a1a1a] border-2 border-[#e91e8c] text-[#e0e0e0] rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-[#e91e8c]" style={{ fontFamily: '"Archivo", sans-serif' }}>
              Import procurement links
            </DialogTitle>
          </DialogHeader>
          <p className="text-[#888] text-sm">
            Paste JSON: object with keys and arrays of &#123; state, city, official_website, procurement_link &#125;
          </p>
          <textarea
            className="min-h-[200px] w-full bg-[#0d0d0d] border-2 border-[#333] rounded-lg px-4 py-3 text-[#e0e0e0] focus:outline-none focus:border-[#e91e8c]"
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
              className="px-4 py-2 border-2 border-[#555] text-[#e0e0e0] rounded-lg hover:border-[#e91e8c] font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleImportSubmit}
              disabled={importing || !importText.trim()}
              className="px-4 py-2 bg-[#e91e8c] text-white font-bold rounded-lg disabled:opacity-50"
              style={{ fontFamily: '"Archivo", sans-serif' }}
            >
              {importing ? "Importing…" : "Import"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {links.length === 0 ? (
          <div className="border-2 border-dashed border-[#e91e8c] rounded-lg p-12 text-center">
            <p className="text-[#888] mb-4">No procurement links yet.</p>
            <button
              type="button"
              onClick={handleAdd}
              className="px-4 py-2 border-2 border-[#e91e8c] text-[#e91e8c] rounded-lg font-semibold hover:bg-[#e91e8c] hover:text-white transition-colors"
              style={{ fontFamily: '"Archivo", sans-serif' }}
            >
              Add link
            </button>
          </div>
        ) : (
          <div
            className="gap-4"
            style={{ columnCount: 2, columnGap: "1.5rem" }}
          >
            {links.map((link) => (
              <div
                key={link._id}
                className="break-inside-avoid mb-4 bg-[#1a1a1a] border-2 border-[#2a2a2a] rounded-lg p-5 border-t-4 border-t-[#e91e8c] hover:border-t-[#f06292] hover:shadow-[0_0_20px_rgba(233,30,140,0.2)] transition-all"
              >
                <h2 className="font-bold text-white text-lg" style={{ fontFamily: '"Archivo", sans-serif' }}>
                  {link.city}
                </h2>
                <p className="text-[#888] text-sm mt-0.5">{link.state}</p>
                <div className="mt-4 space-y-2">
                  {link.official_website && (
                    <a
                      href={link.official_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-[#e91e8c] hover:text-[#f06292] font-medium text-sm transition-colors"
                    >
                      Official site
                    </a>
                  )}
                  {link.procurement_link && (
                    <a
                      href={link.procurement_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-[#e91e8c] hover:text-[#f06292] font-medium text-sm transition-colors"
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
                  className="mt-3 text-xs text-[#888] hover:text-[#e91e8c] transition-colors"
                >
                  Edit
                </button>
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
