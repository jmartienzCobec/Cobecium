# DONOTREPEAT.md — Procurement hub UI styles

Track of implemented styles and their snapshots to ensure **no repetition** across /1 through /10.

## Acceptance summary

- **Styles 1, 5, 10 — Accepted.** Reachable at `/1` (Style 1 — Brutalist), `/2` (Style 10 — Maximalist/Bold), `/3` (Style 5 — Art deco).
- **Styles 6, 7, 8, 9, 10 (paths /6–/10) — Accepted.** Reachable at `/6` (Terminal CRT), `/7` (Neon Noir), `/8` (Swiss numbered), `/9` (Horizontal strips), `/10` (Slate + violet, initial circles).
- **Styles 2, 3, 4, 6, 7, 8, 9 (earlier attempts) — Rejected.** See **Rejected styles** below.

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

---

## Style 6 — Path: `/6` — **Accepted**

**Name:** Terminal CRT / Phosphor green  
**Snapshot:** `snapshots/style-6.txt`  
**Screenshot:** `snapshots/style-6.png` (capture when running app)

### High-level idea
- Terminal/CRT aesthetic: phosphor green on dark green-black. JetBrains Mono for header/buttons, Plus Jakarta Sans for card body. 6-column grid with staggered card spans (2,2,2 then 3,3 then 2,3,2…). Cards: 3px left accent, rounded-sm, no corner brackets.

### Color scheme
- Background: `#0c120c` (dark green-black)
- Text: `#c8e6c9` (light green)
- Muted: `#558b2f`
- Borders: `#2e7d32`
- Accent: `#69f0ae` (phosphor green)

### Layout
- Header: thin green bottom border; terminal-style "> procurement_links"; import_json / add_link buttons (rounded-sm).
- Main: 6-column grid; cards span 2 or 3 columns in staggered pattern; 3px left border accent, 1px solid, rounded-sm.

### Text representation (from snapshot)
```
Background: Dark green-black. Fonts: JetBrains Mono (header/buttons), Plus Jakarta Sans (body).
Header: "> procurement_links" + import_json | add_link (phosphor green).
6-col grid; staggered spans; cards with 3px left phosphor border, rounded-sm.
```

### Do NOT repeat in future styles
- Dark green-black (#0c120c) + phosphor green (#69f0ae) palette
- JetBrains Mono + Plus Jakarta Sans
- Terminal/CRT phosphor green tone
- 6-column grid with staggered span pattern (2,2,2 then 3,3 etc.)
- 3px left border accent on cards with rounded-sm

---

## Style 7 — Path: `/7` — **Accepted**

**Name:** Neon Noir / Magenta  
**Snapshot:** `snapshots/style-7.txt`  
**Screenshot:** `snapshots/style-7.png` (capture when running app)

### High-level idea
- Neon noir: near black (#0d0d0d), single accent neon magenta (#e91e8c). Archivo (headers/buttons) + Sora (body). 2-column masonry layout (column-count: 2); cards with 4px top border accent, rounded-lg, magenta glow on hover.

### Color scheme
- Background: `#0d0d0d` (near black)
- Card bg: `#1a1a1a`
- Text: `#e0e0e0`, muted `#888`
- Accent: `#e91e8c` (neon magenta), hover `#f06292`

### Layout
- Header: 4px magenta bottom border; title + subtitle left; Import JSON / Add link right (rounded-lg).
- Main: 2-column masonry (CSS column-count); cards with 4px top border magenta, rounded-lg; break-inside-avoid so cards don’t split.

### Text representation (from snapshot)
```
Background: Near black. Fonts: Archivo, Sora.
Header: "Procurement Links" + magenta border; Import JSON | Add link (rounded-lg).
2-col masonry; cards with 4px top magenta border, rounded-lg, glow on hover.
```

### Do NOT repeat in future styles
- Near black + neon magenta (#e91e8c) palette
- Archivo + Sora
- 4px top border accent on cards
- 2-column masonry (column-count: 2) layout
- Neon noir tone with magenta glow

---

## Style 8 — Path: `/8` — **Accepted**

**Name:** Swiss / Numbered list (two columns)  
**Snapshot:** `snapshots/style-8.txt`  
**Screenshot:** `snapshots/style-8.png` (capture when running app)

### High-level idea
- Swiss/light: cream bg (#faf8f5), black text, deep red (#b71c1c) accent. Fraunces (display/serif) + Open Sans (body). Two-column layout of numbered rows: each column is a vertical list with large red numerals (1, 2, 3…), city/state/links. Not a card grid; not single-column only.

### Color scheme
- Background: `#faf8f5` (light cream)
- Text: `#1a1a1a`, muted `#666`
- Accent: `#b71c1c` (deep red)
- Border: `#1a1a1a`, divide `#ddd`

### Layout
- Header: 2px black bottom border; title + subtitle; Import JSON (outline) / Add link (red), rounded-md.
- Main: 2-column grid (md:grid-cols-2); each column is a list of numbered rows (numeral + city/state/links); divide-y between rows.

### Text representation (from snapshot)
```
Background: Light cream. Fonts: Fraunces, Open Sans.
Header: "Procurement Links" + black border; Import JSON | Add link (red, rounded-md).
Two columns of numbered rows; large red numerals, city/state/links per row.
```

### Do NOT repeat in future styles
- Light cream (#faf8f5) + deep red (#b71c1c) palette
- Fraunces + Open Sans
- Numbered list with large red numerals
- Two-column numbered rows (not card grid)
- Swiss / light tone, rounded-md buttons

---

## Style 9 — Path: `/9` — **Accepted**

**Name:** Horizontal strips / Bar layout  
**Snapshot:** `snapshots/style-9.txt`  
**Screenshot:** `snapshots/style-9.png` (capture when running app)

### High-level idea
- Horizontal strip layout: light warm gray (#f0eeeb), white header bar. Each link = one full-width horizontal bar: city/state left, Official site | Procurement | Edit right. Manrope + Source Sans 3. Blue (#2563eb) accent. Rounded-xl white cards, hover shadow.

### Color scheme
- Background: `#f0eeeb` (light warm gray)
- Card/header bg: white
- Text: `#1c1917`, muted `#78716c`
- Border: `#e5e2de`
- Accent: `#2563eb` (blue)

### Layout
- Header: white bar, shadow, title + subtitle left, Import JSON / Add link right (rounded-lg).
- Main: stacked full-width bars (white, rounded-xl); each row: left = city + state, right = links + Edit; hover border + shadow.

### Text representation (from snapshot)
```
Background: Light warm gray. Header: white bar. Fonts: Manrope, Source Sans 3.
Horizontal strips: city/state left, Official site | Procurement | Edit right. Blue accent, rounded-xl.
```

### Do NOT repeat in future styles
- Light warm gray (#f0eeeb) + blue (#2563eb) palette
- Manrope + Source Sans 3
- Horizontal strip/bar layout (content left, links right, one row per item)
- Rounded-xl white cards on gray bg
- Dashboard/panel tone with white header bar

---

## Style 10 (path `/10`) — **Accepted**

**Name:** Slate + violet with initial circles  
**Snapshot:** `snapshots/style-path10.txt`  
**Screenshot:** `snapshots/style-path10.png` (capture when running app)

### High-level idea
- Dark slate (#0f172a) with violet (#7c3aed) accent. Lexend + Figtree. 3-column grid; each card has a prominent **initial circle** (city first letter in violet circle) left of content. Rounded-xl cards, no left/top border accent.

### Color scheme
- Background: `#0f172a` (slate)
- Card bg: `#1e293b`
- Text: `#e2e8f0`, muted `#94a3b8`
- Border: `#334155`
- Accent: `#7c3aed`, links `#a78bfa`

### Layout
- Header: thin slate border; title + subtitle; Import JSON / Add link (rounded-lg).
- Main: 3-column grid; each card = flex row: [circle with initial] + [city, state, links, Edit]; rounded-xl.

### Text representation (from snapshot)
```
Background: Slate dark. Fonts: Lexend, Figtree.
Header: "Procurement Links" + violet buttons (rounded-lg).
3-col grid; cards with violet initial circle (city letter) + content. Rounded-xl.
```

### Do NOT repeat in future styles
- Slate (#0f172a) + violet (#7c3aed) palette
- Lexend + Figtree
- Initial/avatar circle (city first letter) on each card
- 3-column grid with circle+content card layout
- Dark slate tone, rounded-xl cards
