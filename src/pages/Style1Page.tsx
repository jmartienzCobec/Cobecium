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

export function Style1Page() {
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
      <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5] flex items-center justify-center font-mono">
        <p className="text-[#ffeb00]">LOADING…</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5] font-mono text-sm antialiased"
      style={{ fontFamily: '"IBM Plex Mono", "Courier New", monospace'}}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&display=swap');
      `}</style>
      <header className="border-b-4 border-[#ffeb00] px-6 py-5">
        <div className="max-w-[1400px] mx-auto flex items-end justify-between gap-6 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#f5f5f5] uppercase">
              Procurement links
            </h1>
            <p className="text-[#888] mt-1 uppercase tracking-wider text-xs">
              State and city procurement portals
            </p>
          </div>
          <nav className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setImportOpen(true);
                setImportError(null);
                setImportText("");
              }}
              className="px-4 py-2 border-2 border-[#f5f5f5] bg-transparent text-[#f5f5f5] uppercase font-semibold hover:bg-[#f5f5f5] hover:text-[#0a0a0a] transition-colors"
            >
              Import JSON
            </button>
            <button
              type="button"
              onClick={handleAdd}
              className="px-4 py-2 bg-[#ffeb00] text-[#0a0a0a] font-bold uppercase hover:bg-[#ffe000] transition-colors"
            >
              Add link
            </button>
          </nav>
        </div>
      </header>

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="sm:max-w-lg bg-[#0a0a0a] border-2 border-[#333] text-[#f5f5f5] font-mono">
          <DialogHeader>
            <DialogTitle className="text-[#ffeb00] font-bold uppercase">Import procurement links</DialogTitle>
          </DialogHeader>
          <p className="text-[#888] text-xs uppercase">
            Paste JSON: object with keys and arrays of &#123; state, city, official_website, procurement_link &#125;
          </p>
          <textarea
            className="min-h-[200px] w-full bg-[#111] border-2 border-[#333] px-3 py-2 text-[#f5f5f5] font-mono text-sm focus:outline-none focus:border-[#ffeb00]"
            placeholder='{"us_state_procurement": [...]}'
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
          />
          {importError && <p className="text-red-400 text-xs">{importError}</p>}
          <DialogFooter className="gap-2">
            <button
              type="button"
              onClick={() => setImportOpen(false)}
              disabled={importing}
              className="px-4 py-2 border-2 border-[#666] text-[#f5f5f5] hover:border-[#f5f5f5] uppercase"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleImportSubmit}
              disabled={importing || !importText.trim()}
              className="px-4 py-2 bg-[#ffeb00] text-[#0a0a0a] font-bold uppercase disabled:opacity-50"
            >
              {importing ? "Importing…" : "Import"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <main className="max-w-[1400px] mx-auto px-6 py-8">
        <div
          className="grid gap-0"
          style={{
            gridTemplateColumns: "1fr 1fr 1.2fr",
            gridAutoRows: "minmax(140px, auto)",
          }}
        >
          {links.length === 0 ? (
            <div
              className="col-span-3 border-2 border-dashed border-[#333] p-12 text-center"
              style={{ gridColumn: "1 / -1" }}
            >
              <p className="text-[#666] uppercase mb-4">No procurement links yet.</p>
              <button
                type="button"
                onClick={handleAdd}
                className="px-4 py-2 border-2 border-[#666] text-[#f5f5f5] hover:border-[#ffeb00] hover:text-[#ffeb00] uppercase"
              >
                Add link
              </button>
            </div>
          ) : (
            links.map((link, i) => (
              <div
                key={link._id}
                className="border-b-2 border-r-2 border-[#222] p-4 flex flex-col justify-between hover:border-[#ffeb00] hover:bg-[#111] transition-colors"
                style={{
                  gridColumn: i % 5 === 0 ? "span 2" : "span 1",
                }}
              >
                <div>
                  <h2 className="font-bold text-[#f5f5f5] uppercase tracking-tight">
                    {link.city}
                  </h2>
                  <p className="text-[#666] text-xs uppercase mt-0.5">{link.state}</p>
                </div>
                <div className="mt-2 space-y-1">
                  {link.official_website && (
                    <a
                      href={link.official_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-[#ffeb00] hover:underline truncate text-xs uppercase"
                    >
                      Official site →
                    </a>
                  )}
                  {link.procurement_link && (
                    <a
                      href={link.procurement_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-[#ffeb00] hover:underline truncate text-xs uppercase"
                    >
                      Procurement →
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
                  className="mt-2 text-xs text-[#666] hover:text-[#ffeb00] uppercase self-start"
                >
                  Edit
                </button>
              </div>
            ))
          )}
        </div>
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
