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

export function Style5Page() {
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
      <div className="min-h-screen bg-[#0d1b2a] flex items-center justify-center">
        <p className="text-[#c9a227]" style={{ fontFamily: '"Cinzel", serif' }}>
          Loading…
        </p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#0d1b2a] text-[#e8e4dc] antialiased"
      style={{ fontFamily: '"Cormorant Garamond", "Georgia", serif' }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&display=swap');
      `}</style>

      <header className="relative border-b-2 border-[#c9a227] px-6 py-6">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-baseline gap-3">
            <span className="text-[#c9a227] text-xl" style={{ fontFamily: '"Cinzel", serif' }}>
              ◆
            </span>
            <div>
              <h1
                className="text-2xl tracking-[0.2em] uppercase text-[#e8e4dc]"
                style={{ fontFamily: '"Cinzel", serif' }}
              >
                Lynx
                <span className="ml-2 text-sm text-[#c9a227] tracking-widest">Art deco</span>
              </h1>
              <p className="text-[#8b9aaa] text-sm mt-0.5 tracking-widest uppercase" style={{ fontFamily: '"Cinzel", serif', letterSpacing: "0.25em" }}>
                State and city portals
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setImportOpen(true);
                setImportError(null);
                setImportText("");
              }}
              className="px-4 py-2 border-2 border-[#c9a227] text-[#c9a227] hover:bg-[#c9a227]/10 transition-colors uppercase tracking-widest text-sm"
              style={{ fontFamily: '"Cinzel", serif' }}
            >
              Import JSON
            </button>
            <button
              type="button"
              onClick={handleAdd}
              className="px-4 py-2 bg-[#c9a227] text-[#0d1b2a] hover:bg-[#d4af37] transition-colors uppercase tracking-widest text-sm font-semibold"
              style={{ fontFamily: '"Cinzel", serif' }}
            >
              Add link
            </button>
          </div>
        </div>
      </header>

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="sm:max-w-lg bg-[#1b2838] border-2 border-[#c9a227]/50 text-[#e8e4dc] rounded-none">
          <DialogHeader>
            <DialogTitle className="text-[#c9a227]" style={{ fontFamily: '"Cinzel", serif' }}>
              Import procurement links
            </DialogTitle>
          </DialogHeader>
          <p className="text-[#8b9aaa] text-sm">
            Paste JSON: object with keys and arrays of link objects.
          </p>
          <textarea
            className="min-h-[200px] w-full bg-[#0d1b2a] border border-[#c9a227]/40 px-3 py-2 text-[#e8e4dc] focus:outline-none focus:border-[#c9a227]"
            placeholder='{"us_state_procurement": [...]}'
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
          />
          {importError && <p className="text-amber-200 text-sm">{importError}</p>}
          <DialogFooter className="gap-2">
            <button
              type="button"
              onClick={() => setImportOpen(false)}
              disabled={importing}
              className="px-4 py-2 border-2 border-[#8b9aaa] text-[#e8e4dc] hover:border-[#c9a227] uppercase tracking-widest text-sm"
              style={{ fontFamily: '"Cinzel", serif' }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleImportSubmit}
              disabled={importing || !importText.trim()}
              className="px-4 py-2 bg-[#c9a227] text-[#0d1b2a] font-semibold disabled:opacity-50 uppercase tracking-widest text-sm"
              style={{ fontFamily: '"Cinzel", serif' }}
            >
              {importing ? "Importing…" : "Import"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {links.length === 0 ? (
          <div className="border-2 border-dashed border-[#c9a227]/40 p-14 text-center">
            <p className="text-[#8b9aaa] mb-6 uppercase tracking-widest">No procurement links yet.</p>
            <button
              type="button"
              onClick={handleAdd}
              className="px-4 py-2 border-2 border-[#c9a227] text-[#c9a227] hover:bg-[#c9a227]/10 uppercase tracking-widest"
              style={{ fontFamily: '"Cinzel", serif' }}
            >
              Add link
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {links.map((link) => (
              <div
                key={link._id}
                className="relative border-2 border-[#2d3e50] p-5 hover:border-[#c9a227]/60 transition-colors group"
              >
                <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-[#c9a227]/70" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-[#c9a227]/70" />
                <h2
                  className="text-lg font-semibold text-[#e8e4dc] uppercase tracking-wide"
                  style={{ fontFamily: '"Cinzel", serif' }}
                >
                  {link.city}
                </h2>
                <p className="text-[#8b9aaa] text-sm mt-1 uppercase tracking-widest">{link.state}</p>
                <div className="mt-4 space-y-1.5">
                  {link.official_website && (
                    <a
                      href={link.official_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-[#c9a227] hover:text-[#d4af37] text-sm uppercase tracking-wide"
                    >
                      Official site
                    </a>
                  )}
                  {link.procurement_link && (
                    <a
                      href={link.procurement_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-[#c9a227] hover:text-[#d4af37] text-sm uppercase tracking-wide"
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
                  className="mt-3 text-xs text-[#8b9aaa] hover:text-[#c9a227] uppercase tracking-widest"
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
