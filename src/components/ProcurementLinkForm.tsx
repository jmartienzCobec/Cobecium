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
  onSubmit: (data: ProcurementLinkFields) => void;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.state.trim() || !form.city.trim()) return;
    onSubmit(form);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-border bg-card">
        <DialogHeader>
          <DialogTitle className="font-display text-xl tracking-tight">
            {isEditing ? "Edit procurement link" : "Add procurement link"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              value={form.state}
              onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
              placeholder="e.g. New York"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              placeholder="e.g. New York City"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="official_website">Official website</Label>
            <Input
              id="official_website"
              type="url"
              value={form.official_website}
              onChange={(e) =>
                setForm((f) => ({ ...f, official_website: e.target.value }))
              }
              placeholder="https://..."
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="procurement_link">Procurement link</Label>
            <Input
              id="procurement_link"
              type="url"
              value={form.procurement_link}
              onChange={(e) =>
                setForm((f) => ({ ...f, procurement_link: e.target.value }))
              }
              placeholder="https://..."
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? "Save" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
