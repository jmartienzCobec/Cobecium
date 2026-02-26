# DONOTREPEAT.md — Procurement hub UI styles

Track of implemented styles and their snapshots to ensure **no repetition** across /1 through /10.

## Acceptance summary

- **Styles 1, 5, 10 — Accepted.** Reachable at `/1` (Style 1), `/2` (Style 10 — Maximalist/Bold), `/3` (Style 5 — Art deco).
- **Styles 2, 3, 4, 6, 7, 8, 9 — Rejected.** Removed from the app. See **Rejected styles** below.

---

## Rejected styles — avoid in future UI generation

Do **not** reuse these color palettes, typography, layouts, or approaches when generating new UI styles.

### Rejected color palettes
- **Warm cream + burgundy:** `#f8f4ef` bg, `#6b2d2d` accent (Editorial)
- **Dark blue-gray + cyan:** `#0f1419` bg, `#00e5cc` accent (Retro-futuristic)
- **Sage + earth green:** `#e8f0e8` bg, `#2d5a27` accent (Organic)
- **Charcoal + steel blue:** `#252528` bg, `#5b8fb9` accent (Industrial)
- **Ivory + deep plum:** `#fafaf8` bg, `#5c4d7a` accent (Luxury)
- **Warm cream + coral/mint/butter:** `#fef9f0` bg, `#e07a5f` coral, `#81b29a` mint, `#f2cc8f` butter (Playful)
- **Lavender + soft violet:** `#e8e0f0` bg, `#9b8bb5` accent (Soft pastel)

### Rejected typography
- Playfair Display + Source Serif 4  
- Orbitron + Rajdhani  
- Nunito only  
- Bebas Neue + DM Sans  
- Libre Baskerville + Lora  
- Fredoka only  
- Outfit only (in a soft pastel context)

### Rejected layout / component patterns
- Bento 12-column grid with “every 4th item wide” (col-span-8 vs col-span-4)
- Single-column list only (no multi-column grid)
- Uniform 2–3 column grid with equal card sizes
- 2-column-only grid with narrow max-width and soft shadows
- Rivet dots (small circular accents at card corners)
- Pill buttons (rounded-full) with scale hover
- Rounded-full buttons + rounded-2xl cards together
- Very rounded cards (rounded-[1.5rem] or rounded-3xl) in an organic/playful context

### Rejected visual effects and tone
- Glassmorphism (backdrop-blur) + left-border accent on cards
- Cyan/teal glow (text-shadow, box-shadow)
- Noise/grain texture overlay
- Editorial / magazine tone
- Retro-futuristic / glass tone
- Organic / natural tone
- Industrial / utilitarian tone with 1px borders
- Luxury / refined tone (generous whitespace, narrow max-width, soft shadows)
- Playful / toy-like tone (bouncy scale, coral/mint/butter)
- Soft pastel tone with header gradient overlay

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

## Style 5 — Path: `/3` — **Accepted**

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

---

## Style 10 — Path: `/2` — **Accepted**

**Name:** Maximalist / Bold  
**Snapshot:** `snapshots/style-10.txt`

### High-level idea
- Maximalist, bold: dark background (#1a1a1e) with diagonal stripe pattern (teal + orange). Syne only, uppercase, heavy weight. Dual accents: orange (#f59e0b) and teal (#0d9488). Thick (4px) borders. Cards with alternating 4px left border (orange/teal); hover offset box-shadow. 3-column grid. No rounded corners.

### Color scheme
- Background: `#1a1a1e` (dark)
- Card bg: `#25252a`
- Text: `#f0f0f2`, muted `#8a8a8e`
- Accent 1: `#f59e0b` (orange)
- Accent 2: `#0d9488` (teal)

### Layout
- Header: 4px orange bottom border; Syne extrabold uppercase title; centered small subtitle; teal outline + orange solid buttons.
- Main: 3-col grid; cards with 4px left border alternating orange/teal; hover shadow offset (4px 4px 0 teal). Links: Official site orange, Procurement teal; hover swap.

### Text representation (from snapshot)
```
Background: Dark + diagonal teal/orange stripe pattern. Font: Syne, uppercase.
Header: Thick orange border; "PROCUREMENT LINKS" + teal/orange buttons.
3-col grid; cards with alternating orange/teal left border, offset shadow on hover.
```

### Do NOT repeat in future styles
- Dark + dual orange (#f59e0b) and teal (#0d9488) palette
- Syne only, bold uppercase
- Diagonal stripe pattern background
- Alternating left-border accent on cards (orange/teal by index)
- Offset box-shadow on hover (4px 4px 0)
- Maximalist / bold tone with 4px borders
