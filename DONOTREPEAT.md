# DONOTREPEAT.md — Procurement hub UI styles

Track of implemented styles and their snapshots to ensure **no repetition** across /1 through /5.

## Acceptance summary

- **Styles 1 and 5 — Accepted.** Kept in the app; reachable at `/1` and `/5`.
- **Styles 2, 3, and 4 — Rejected.** Removed from the app. Details retained below for reference and to avoid repeating these directions in future styles.

---

## Style 1 — Path: `/1` — **Accepted**

**Name:** Brutalist / Raw  
**Snapshot:** `snapshots/style-1.txt`  
**Screenshot:** `snapshots/style-1.png` (capture when running app)

### High-level idea
- Brutalist, raw aesthetic: monospace, no rounded corners, stark contrast.
- Asymmetric grid with some cards spanning two columns.

### Color scheme
- Background: `#0a0a0a` (near black)
- Text: `#f5f5f5` (off-white)
- Muted: `#888`, `#666`, `#222`
- Accent: `#ffeb00` (electric yellow) for CTAs, links, key borders

### Layout
- Header: full-width, thick yellow bottom border; title left, two buttons right.
- Main: CSS Grid 3 columns (1fr 1fr 1.2fr); every 5th item `grid-column: span 2`.
- Cards: rectangular blocks, 2px borders, hover border → yellow.

### Text representation (from snapshot)
```
Background: Pure black. Font: IBM Plex Mono.
Header: "PROCUREMENT LINKS" + "IMPORT JSON" | "ADD LINK" (yellow).
Grid: Asymmetric 3-col; cards with CITY, STATE, Official site →, Procurement →, Edit.
No rounded corners. Electric yellow accents only.
```

### Do NOT repeat in future styles
- Black background + single bright accent (e.g. yellow)
- Monospace-only typography
- Asymmetric grid with “every Nth item spans 2 columns”
- Raw 2px rectangular borders, no radius
- IBM Plex Mono

---

## Style 2 — Path: `/2` — **Rejected**

**Name:** Editorial / Magazine  
**Snapshot:** `snapshots/style-2.txt`  
**Screenshot:** `snapshots/style-2.png` (capture when running app)

### High-level idea
- Editorial, magazine-like: serif typography, warm cream background, bento grid with mixed card widths.
- Rounded corners, soft shadows, generous whitespace.

### Color scheme
- Background: `#f8f4ef` (warm cream)
- Text: `#2c1810` (dark brown)
- Muted / secondary: `#6b4423`, `#8b4510`, `#d4c4b0`
- Accent: `#6b2d2d` (deep burgundy) for primary actions and links

### Layout
- Header: max-w-5xl, no thick border; title + subtitle left, two rounded-full buttons right.
- Main: 12-column grid; every 4th item col-span-8 (wide), others col-span-4. Cards rounded-2xl.

### Text representation (from snapshot)
```
Background: Warm cream. Fonts: Playfair Display, Source Serif 4 (serif).
Header: "Procurement links" (serif) + rounded-full "Import from JSON" | "Add link" (burgundy).
Bento grid: 12-col; every 4th card wide (8 cols). Cards rounded-2xl, soft border, burgundy links.
```

### Do NOT repeat in future styles
- Warm cream (#f8f4ef) + burgundy (#6b2d2d) palette
- Playfair Display + Source Serif 4
- Bento 12-column grid with "every 4th item wide"
- Rounded-full buttons, rounded-2xl cards
- Editorial / magazine tone

---

## Style 3 — Path: `/3` — **Rejected**

**Name:** Retro-futuristic / Glass  
**Snapshot:** `snapshots/style-3.txt`  
**Screenshot:** `snapshots/style-3.png` (capture when running app)

### High-level idea
- Retro-futuristic: dark blue-gray background, cyan glow, geometric sans (Orbitron, Rajdhani), glassmorphism cards in a single-column list with left-border accent.

### Color scheme
- Background: `#0f1419` (dark blue-gray)
- Text: `#e0e6eb` (light gray)
- Muted: `#6b7b8a`
- Accent: `#00e5cc` (cyan/teal) with glow (text-shadow, box-shadow)

### Layout
- Header: thin cyan/30 bottom border; Orbitron title with glow; two outlined/ghost buttons.
- Main: single-column list (max-w-3xl). Each card: 4px left border cyan, glass (backdrop-blur), rounded-lg; city/state left, links + Edit right.

### Text representation (from snapshot)
```
Background: Dark blue-gray + soft cyan glow orbs. Fonts: Orbitron, Rajdhani.
Header: "PROCUREMENT LINKS" (cyan, glow) + outline buttons.
Single-column list: cards with left cyan border, glass bg, city left / links right.
```

### Do NOT repeat in future styles
- Dark blue-gray (#0f1419) + cyan (#00e5cc) palette
- Orbitron + Rajdhani
- Single-column list (no multi-column grid)
- Glassmorphism (backdrop-blur) + left-border accent cards
- Glow effects (text-shadow, box-shadow on cyan)

---

## Style 4 — Path: `/4` — **Rejected**

**Name:** Organic / Natural  
**Snapshot:** `snapshots/style-4.txt`  
**Screenshot:** `snapshots/style-4.png` (capture when running app)

### High-level idea
- Organic, natural: sage green background, earth green accent, Nunito (soft rounded sans), uniform 2–3 column grid with very rounded cards; subtle noise texture.

### Color scheme
- Background: `#e8f0e8` (sage green)
- Text: `#1a2f1a` (dark green)
- Muted: `#3d5c3d`, `#a8c5a8`, `#b8d0b8`
- Accent: `#2d5a27` (earth green) for primary actions and links

### Layout
- Header: max-w-4xl; title + subtitle left; rounded-full buttons right.
- Main: grid 2 cols (md: 3). Cards equal size, rounded-[1.5rem], white/90, soft green border.

### Text representation (from snapshot)
```
Background: Sage green + subtle noise. Font: Nunito.
Header: "Procurement links" + rounded-full Import | Add link (earth green).
Uniform 2–3 col grid; cards rounded-[1.5rem], white/90, earth green links.
```

### Do NOT repeat in future styles
- Sage (#e8f0e8) + earth green (#2d5a27) palette
- Nunito only
- Uniform 2–3 column grid (equal card sizes)
- Very rounded cards (rounded-[1.5rem] or rounded-3xl)
- Noise/grain texture overlay
- Organic / natural tone

---

## Style 5 — Path: `/5` — **Accepted**

**Name:** Art deco / Geometric  
**Snapshot:** `snapshots/style-5.txt`  
**Screenshot:** `snapshots/style-5.png` (capture when running app)

### High-level idea
- Art deco: deep navy background, gold accents, Cinzel + Cormorant Garamond, decorative corner brackets on cards, strict 4-column grid, sharp corners (no radius).

### Color scheme
- Background: `#0d1b2a` (deep navy)
- Text: `#e8e4dc` (off-white)
- Muted: `#8b9aaa`, `#2d3e50`
- Accent: `#c9a227` (gold/brass) for borders, links, CTAs

### Layout
- Header: double gold bottom border; diamond ◆ + Cinzel title (tracking-widest); outline/solid gold buttons.
- Main: 4-column grid (2 on small). Cards: no radius, double border, top-left and bottom-right L-shaped gold corner brackets.

### Text representation (from snapshot)
```
Background: Deep navy. Fonts: Cinzel, Cormorant Garamond.
Header: ◆ "PROCUREMENT LINKS" (gold border) + gold buttons (tracking-widest).
4-col grid; cards with gold corner brackets, sharp corners, gold links.
```

### Do NOT repeat in future styles
- Deep navy (#0d1b2a) + gold (#c9a227) palette
- Cinzel + Cormorant Garamond
- Art deco corner brackets (L-shaped accents on cards)
- Strict 4-column grid
- Sharp corners (rounded-none) on cards/dialogs
- Decorative diamond/symbol in header
