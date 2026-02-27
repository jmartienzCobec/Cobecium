"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

  const linksByState = useMemo(() => {
    const byState: Record<string, typeof filteredLinks> = {};
    for (const link of filteredLinks) {
      const s = link.state ?? "";
      if (!byState[s]) byState[s] = [];
      byState[s].push(link);
    }
    return byState;
  }, [filteredLinks]);

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
      <div className="container mx-auto p-6">
        <p className="text-muted-foreground">Loading procurement links…</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Procurement links
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            State and city procurement portals
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setImportOpen(true); setImportError(null); setImportText(""); }}>
            Import from JSON
          </Button>
          <Button onClick={handleAdd}>Add link</Button>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="procurement-search" className="text-sm font-medium">
          Search by state or city
        </label>
        <Input
          id="procurement-search"
          type="text"
          placeholder="e.g. California, Los Angeles or CA, Austin"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
      </div>

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Import procurement links</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            Paste JSON in the form of an object with keys and arrays of links, e.g.{" "}
            <code className="text-xs bg-muted px-1 rounded">&#123; &quot;us_state_procurement&quot;: [ &#123; &quot;state&quot;, &quot;city&quot;, &quot;official_website&quot;, &quot;procurement_link&quot; &#125;, ... ] &#125;</code>
          </p>
          <textarea
            className="min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder={'{"us_state_procurement": [{"state": "...", "city": "...", "official_website": "...", "procurement_link": "..."}]}'}
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
          />
          {importError && (
            <p className="text-destructive text-sm">{importError}</p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportOpen(false)} disabled={importing}>
              Cancel
            </Button>
            <Button onClick={handleImportSubmit} disabled={importing || !importText.trim()}>
              {importing ? "Importing…" : "Import"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="space-y-4">
        {links.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground mb-4">
                No procurement links yet. Run the seed or add one.
              </p>
              <Button variant="outline" onClick={handleAdd}>
                Add link
              </Button>
            </CardContent>
          </Card>
        ) : filteredLinks.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No matches for your search.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(linksByState)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([state, stateLinks]) => (
                <Card key={state} className="flex flex-col">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{state}</CardTitle>
                    <CardDescription>
                      {stateLinks.length} {stateLinks.length === 1 ? "city" : "cities"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-3 text-sm">
                    {stateLinks.map((link) => (
                      <div
                        key={link._id}
                        className="flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-border/50 pb-2 last:border-0 last:pb-0"
                      >
                        <span className="font-medium">{link.city}</span>
                        <span className="flex flex-wrap items-center gap-x-2">
                          {link.procurement_link && (
                            <a
                              href={link.procurement_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              Procurement
                            </a>
                          )}
                          {link.official_website && (
                            <a
                              href={link.official_website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              Official site
                            </a>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2"
                            onClick={() =>
                              handleEdit(link._id, {
                                state: link.state,
                                city: link.city,
                                official_website: link.official_website,
                                procurement_link: link.procurement_link,
                              })
                            }
                          >
                            Edit
                          </Button>
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </div>

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
