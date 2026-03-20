"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export type ProcurementLinkFields = {
  state: string;
  city: string;
  official_website: string;
  procurement_link: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: ProcurementLinkFields;
  onSubmit: (data: ProcurementLinkFields) => void | Promise<void>;
  isEditing: boolean;
};

const empty: ProcurementLinkFields = {
  state: "",
  city: "",
  official_website: "",
  procurement_link: "",
};

export function ProcurementLinkForm({
  open,
  onOpenChange,
  initial,
  onSubmit,
  isEditing,
}: Props) {
  const [form, setForm] = useState<ProcurementLinkFields>(empty);

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? {
              state: initial.state,
              city: initial.city,
              official_website: initial.official_website,
              procurement_link: initial.procurement_link,
            }
          : { ...empty }
      );
    }
  }, [open, initial]);

  const stateTrimmed = form.state.trim();
  const cityTrimmed = form.city.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stateTrimmed || !cityTrimmed) return;
    try {
      await Promise.resolve(onSubmit(form));
      onOpenChange(false);
    } catch {
      // Caller may alert; keep dialog open for retry.
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-[min(96vw,480px)] max-h-[90vh] overflow-hidden flex flex-col gap-0 p-0 border-4 border-primary bg-card text-foreground rounded-none shadow-[8px_8px_0_0_var(--base-teal)]">
        <div className="px-6 py-5 border-b-2 border-border bg-[linear-gradient(90deg,rgba(245,158,11,0.14),rgba(37,37,42,0.96),rgba(13,148,136,0.12))]">
          <DialogHeader className="space-y-1">
            <DialogTitle className="font-display text-2xl tracking-tight">
              {isEditing ? "Edit procurement link" : "Add procurement link"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Add or update the official website and procurement portal for a city.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form
          onSubmit={handleSubmit}
          className="min-h-0 flex-1 overflow-y-auto"
        >
          <div className="px-6 py-5 space-y-4">
            <div className="grid gap-2">
              <Label
                htmlFor="state"
                className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground"
              >
                State
              </Label>
              <Input
                id="state"
                value={form.state}
                onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                placeholder="e.g. New York"
                required
                className="border-2 border-accent bg-background/40 text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:border-primary rounded-none"
              />
            </div>

            <div className="grid gap-2">
              <Label
                htmlFor="city"
                className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground"
              >
                City
              </Label>
              <Input
                id="city"
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                placeholder="e.g. New York City"
                required
                className="border-2 border-accent bg-background/40 text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:border-primary rounded-none"
              />
            </div>

            <div className="grid gap-2">
              <Label
                htmlFor="official_website"
                className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground"
              >
                Official website
              </Label>
              <Input
                id="official_website"
                type="url"
                value={form.official_website}
                onChange={(e) =>
                  setForm((f) => ({ ...f, official_website: e.target.value }))
                }
                placeholder="https://..."
                className="border-2 border-accent bg-background/40 text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:border-primary rounded-none"
              />
            </div>

            <div className="grid gap-2">
              <Label
                htmlFor="procurement_link"
                className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground"
              >
                Procurement link
              </Label>
              <Input
                id="procurement_link"
                type="url"
                value={form.procurement_link}
                onChange={(e) =>
                  setForm((f) => ({ ...f, procurement_link: e.target.value }))
                }
                placeholder="https://..."
                className="border-2 border-accent bg-background/40 text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:border-primary rounded-none"
              />
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t-2 border-border bg-card/90 backdrop-blur-sm flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              {stateTrimmed && cityTrimmed ? (
                <>
                  {isEditing ? "Editing" : "Creating"} link for{" "}
                  <span className="text-foreground">
                    {stateTrimmed} — {cityTrimmed}
                  </span>
                </>
              ) : (
                "Add a state and city to enable saving."
              )}
            </p>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-2 border-muted-foreground text-foreground hover:border-accent font-semibold uppercase rounded-none"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!stateTrimmed || !cityTrimmed}
                className="bg-primary text-primary-foreground font-bold disabled:opacity-50 uppercase rounded-none"
              >
                {isEditing ? "Save" : "Add"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
