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

export function Style6Page() {
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

  // Staggered span pattern: 2,2,2 then 3,3 then 2,3,2 then 3,2,3 ...
  const getColSpan = (i: number) => {
    const pattern = [2, 2, 2, 3, 3, 2, 3, 2, 3, 2];
    return pattern[i % pattern.length];
  };

  if (links === undefined) {
    return (
      <div className="min-h-screen bg-[#0c120c] flex items-center justify-center text-[#69f0ae]" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
        <p>Loading…</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#0c120c] text-[#c8e6c9] antialiased"
      style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
      `}</style>

      <header className="border-b border-[#2e7d32] px-6 py-4">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-[#c8e6c9]" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
              &gt; procurement_links
            </h1>
            <p className="text-[#558b2f] text-sm mt-0.5" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
              state and city procurement portals
            </p>
          </div>
          <nav className="flex gap-2" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
            <button
              type="button"
              onClick={() => {
                setImportOpen(true);
                setImportError(null);
                setImportText("");
              }}
              className="px-3 py-1.5 border border-[#2e7d32] text-[#c8e6c9] text-sm hover:border-[#69f0ae] hover:text-[#69f0ae] transition-colors rounded-sm"
            >
              import_json
            </button>
            <button
              type="button"
              onClick={handleAdd}
              className="px-3 py-1.5 bg-[#69f0ae] text-[#0c120c] text-sm font-medium hover:bg-[#8ef0c4] transition-colors rounded-sm"
              style={{ fontFamily: '"JetBrains Mono", monospace' }}
            >
              add_link
            </button>
          </nav>
        </div>
      </header>

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="sm:max-w-lg bg-[#0c120c] border border-[#2e7d32] text-[#c8e6c9] rounded-sm">
          <DialogHeader>
            <DialogTitle className="text-[#69f0ae]" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
              import procurement links
            </DialogTitle>
          </DialogHeader>
          <p className="text-[#558b2f] text-sm" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
            Paste JSON: object with keys and arrays of &#123; state, city, official_website, procurement_link &#125;
          </p>
          <textarea
            className="min-h-[200px] w-full bg-[#0a0f0a] border border-[#2e7d32] px-3 py-2 text-[#c8e6c9] rounded-sm text-sm focus:outline-none focus:border-[#69f0ae] font-mono"
            placeholder='{"us_state_procurement": [...]}'
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
          />
          {importError && <p className="text-[#ff5252] text-sm">{importError}</p>}
          <DialogFooter className="gap-2">
            <button
              type="button"
              onClick={() => setImportOpen(false)}
              disabled={importing}
              className="px-3 py-1.5 border border-[#558b2f] text-[#c8e6c9] text-sm hover:border-[#69f0ae] rounded-sm"
              style={{ fontFamily: '"JetBrains Mono", monospace' }}
            >
              cancel
            </button>
            <button
              type="button"
              onClick={handleImportSubmit}
              disabled={importing || !importText.trim()}
              className="px-3 py-1.5 bg-[#69f0ae] text-[#0c120c] text-sm font-medium disabled:opacity-50 rounded-sm"
              style={{ fontFamily: '"JetBrains Mono", monospace' }}
            >
              {importing ? "importing…" : "import"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {links.length === 0 ? (
          <div className="border border-dashed border-[#2e7d32] rounded-sm p-12 text-center">
            <p className="text-[#558b2f] mb-4">No procurement links yet.</p>
            <button
              type="button"
              onClick={handleAdd}
              className="px-3 py-1.5 border border-[#69f0ae] text-[#69f0ae] text-sm hover:bg-[#69f0ae] hover:text-[#0c120c] transition-colors rounded-sm"
              style={{ fontFamily: '"JetBrains Mono", monospace' }}
            >
              add_link
            </button>
          </div>
        ) : (
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: "repeat(6, 1fr)" }}
          >
            {links.map((link, i) => (
              <div
                key={link._id}
                className="border border-[#2e7d32] rounded-sm p-4 flex flex-col justify-between bg-[#0a0f0a]/50 hover:border-[#69f0ae] transition-colors border-l-[3px] border-l-[#69f0ae]"
                style={{ gridColumn: `span ${getColSpan(i)}` }}
              >
                <div>
                  <h2 className="font-semibold text-[#c8e6c9]">
                    {link.city}
                  </h2>
                  <p className="text-[#558b2f] text-sm mt-0.5">{link.state}</p>
                </div>
                <div className="mt-3 space-y-1">
                  {link.official_website && (
                    <a
                      href={link.official_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-[#69f0ae] hover:underline text-sm"
                    >
                      Official site →
                    </a>
                  )}
                  {link.procurement_link && (
                    <a
                      href={link.procurement_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-[#69f0ae] hover:underline text-sm"
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
                  className="mt-2 text-xs text-[#558b2f] hover:text-[#69f0ae] self-start"
                  style={{ fontFamily: '"JetBrains Mono", monospace' }}
                >
                  edit
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
