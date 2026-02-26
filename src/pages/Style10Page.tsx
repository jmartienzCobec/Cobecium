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
    let data: Record<string, Array<{ state: string; city: string; official_website: string; procurement_link: string }>>;
    try {
      data = JSON.parse(importText) as typeof data;
    } catch {
      setImportError("Invalid JSON.");
      return;
    }
    if (typeof data !== "object" || data === null || Array.isArray(data)) {
      setImportError("JSON must be an object with keys and arrays of links.");
      return;
    }
    const hasArrays = Object.values(data).every((v) => Array.isArray(v));
    if (!hasArrays) {
      setImportError("Each value must be an array of link objects.");
      return;
    }
    setImporting(true);
    try {
      await importFromJson({ data });
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
      <div className="min-h-screen bg-[#1a1a1e] flex items-center justify-center" style={{ fontFamily: '"Syne", sans-serif' }}>
        <p className="text-[#f59e0b]">Loading…</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#1a1a1e] text-[#f0f0f2] antialiased"
      style={{ fontFamily: '"Syne", sans-serif' }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&display=swap');
      `}</style>

      {/* Diagonal stripe pattern */}
      <div
        className="fixed inset-0 pointer-events-none opacity-30"
        aria-hidden
        style={{
          backgroundImage: "repeating-linear-gradient( -45deg, transparent, transparent 20px, #0d9488 20px, #0d9488 21px ), repeating-linear-gradient( 45deg, transparent, transparent 20px, #f59e0b 20px, #f59e0b 21px )",
          backgroundBlendMode: "overlay",
        }}
      />

      <header className="relative border-b-4 border-[#f59e0b] px-6 py-5">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-6">
          <h1 className="text-3xl font-extrabold text-[#f0f0f2] uppercase tracking-tight">
            Procurement links
          </h1>
          <p className="absolute left-1/2 -translate-x-1/2 top-[3.2rem] text-[#8a8a8e] text-sm uppercase tracking-widest">
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
              className="px-4 py-2.5 border-2 border-[#0d9488] text-[#0d9488] font-semibold uppercase hover:bg-[#0d9488] hover:text-[#1a1a1e] transition-colors"
            >
              Import JSON
            </button>
            <button
              type="button"
              onClick={handleAdd}
              className="px-4 py-2.5 bg-[#f59e0b] text-[#1a1a1e] font-bold uppercase hover:bg-[#e58f00] transition-colors"
            >
              Add link
            </button>
          </div>
        </div>
      </header>

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="sm:max-w-lg bg-[#25252a] border-4 border-[#f59e0b] text-[#f0f0f2] rounded-none">
          <DialogHeader>
            <DialogTitle className="text-[#f59e0b] font-bold uppercase">
              Import procurement links
            </DialogTitle>
          </DialogHeader>
          <p className="text-[#8a8a8e] text-sm">
            Paste JSON: object with keys and arrays of link objects.
          </p>
          <textarea
            className="min-h-[200px] w-full bg-[#1a1a1e] border-2 border-[#0d9488] px-4 py-3 text-[#f0f0f2] focus:outline-none focus:border-[#f59e0b]"
            placeholder='{"us_state_procurement": [...]}'
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
          />
          {importError && <p className="text-red-400 font-medium">{importError}</p>}
          <DialogFooter className="gap-3 mt-4">
            <button
              type="button"
              onClick={() => setImportOpen(false)}
              disabled={importing}
              className="px-4 py-2.5 border-2 border-[#8a8a8e] text-[#f0f0f2] hover:border-[#0d9488] font-semibold uppercase"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleImportSubmit}
              disabled={importing || !importText.trim()}
              className="px-4 py-2.5 bg-[#f59e0b] text-[#1a1a1e] font-bold disabled:opacity-50 uppercase"
            >
              {importing ? "Importing…" : "Import"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <main className="relative max-w-6xl mx-auto px-6 py-10">
        {links.length === 0 ? (
          <div className="border-4 border-dashed border-[#f59e0b] p-16 text-center">
            <p className="text-[#8a8a8e] text-xl font-semibold uppercase mb-8">No procurement links yet.</p>
            <button
              type="button"
              onClick={handleAdd}
              className="px-4 py-2.5 border-2 border-[#0d9488] text-[#0d9488] font-semibold uppercase hover:bg-[#0d9488] hover:text-[#1a1a1e]"
            >
              Add link
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {links.map((link, i) => (
              <div
                key={link._id}
                className="relative bg-[#25252a] border-l-4 border-[#f59e0b] p-5 hover:border-[#0d9488] hover:shadow-[4px_4px_0_0_#0d9488] transition-all"
                style={{
                  borderLeftColor: i % 2 === 0 ? "#f59e0b" : "#0d9488",
                }}
              >
                <h2 className="text-xl font-bold text-[#f0f0f2] uppercase">
                  {link.city}
                </h2>
                <p className="text-[#8a8a8e] text-sm mt-1 uppercase tracking-wide">{link.state}</p>
                <div className="mt-4 space-y-2">
                  {link.official_website && (
                    <a
                      href={link.official_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-[#f59e0b] hover:text-[#0d9488] font-semibold uppercase text-sm transition-colors"
                    >
                      Official site
                    </a>
                  )}
                  {link.procurement_link && (
                    <a
                      href={link.procurement_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-[#0d9488] hover:text-[#f59e0b] font-semibold uppercase text-sm transition-colors"
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
                  className="mt-3 text-xs text-[#8a8a8e] hover:text-[#f59e0b] font-semibold uppercase"
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
