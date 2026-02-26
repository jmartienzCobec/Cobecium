# DONOTREPEAT.md — Procurement hub UI styles

Track of implemented styles and their snapshots to ensure **no repetition** across /1 through /10.

## Acceptance summary

- **Styles 1, 5, 10 — Accepted.** Reachable at `/1` (Style 1), `/2` (Style 10 — Maximalist/Bold), `/3` (Style 5 — Art deco).
- **Styles 2, 3, 4, 6, 7, 8, 9 — Rejected.** Removed from the app. Details retained below for reference and to avoid repeating these directions in future styles.

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

## Style 6 — Path: `/6` — **Rejected**

**Name:** Industrial / Utilitarian  
**Snapshot:** `snapshots/style-6.txt`

### High-level idea
- Industrial, utilitarian: charcoal background, steel blue accent, Bebas Neue (display) + DM Sans (body). Clean 3-column grid with small “rivet” dot accents on cards (top-right, bottom-left).

### Color scheme
- Background: `#252528` (charcoal)
- Text: `#e8e8ed` (light gray)
- Muted: `#8e8e93`
- Accent: `#5b8fb9` (steel blue) for CTAs, links, rivet dots
- Card bg: `#2d2d30`, border `#3a3a3e`

### Layout
- Header: thin bottom border; Bebas Neue title left; outline + solid steel blue buttons right.
- Main: responsive grid 1/2/3 columns. Cards equal size, 1px border, rivet dots at two corners.

### Text representation (from snapshot)
```
Background: Charcoal. Fonts: Bebas Neue, DM Sans.
Header: "Procurement links" + steel blue Import | Add link.
3-col grid; cards with rivet dots (top-right, bottom-left), steel blue links.
```

### Do NOT repeat in future styles
- Charcoal (#252528) + steel blue (#5b8fb9) palette
- Bebas Neue + DM Sans
- Rivet dots (small circular accents at card corners)
- Industrial / utilitarian tone with 1px borders

---

## Style 7 — Path: `/7` — **Rejected**

**Name:** Luxury / Refined  
**Snapshot:** `snapshots/style-7.txt`

### High-level idea
- Luxury, refined: ivory background, dark charcoal text, deep plum accent. Libre Baskerville + Lora. Generous whitespace, narrow max-width content, 2-column grid. Cards with thin border and subtle shadow.

### Color scheme
- Background: `#fafaf8` (ivory)
- Text: `#1a1a1a` (dark charcoal)
- Muted: `#5a5a5a`, borders `#e8e8e6`, `#e0e0de`
- Accent: `#5c4d7a` (deep plum) for CTAs and links

### Layout
- Header: no thick border; centered max-w-2xl; large serif title; buttons below with generous top padding.
- Main: 2-column grid only (1 col mobile). Cards white, rounded-sm, shadow-sm, hover shadow-md.

### Text representation (from snapshot)
```
Background: Ivory. Fonts: Libre Baskerville, Lora.
Header: Serif title + subtitle; plum outline/solid buttons below.
2-col grid; white cards, thin border, soft shadow, plum links.
```

### Do NOT repeat in future styles
- Ivory (#fafaf8) + deep plum (#5c4d7a) palette
- Libre Baskerville + Lora
- Luxury / refined tone with 2-column-only grid
- Generous whitespace + narrow max-width + soft shadows on cards

---

## Style 8 — Path: `/8` — **Rejected**

**Name:** Playful / Toy-like  
**Snapshot:** `snapshots/style-8.txt`

### High-level idea
- Playful, toy-like: warm cream background (#fef9f0), coral primary (#e07a5f), mint (#81b29a) and butter (#f2cc8f). Fredoka only. Pill buttons (rounded-full), rounded-2xl cards, bouncy hover (scale). 3-column grid.

### Color scheme
- Background: `#fef9f0` (warm cream)
- Text: `#2d2d2d`, muted `#6b6b6b`
- Accent primary: `#e07a5f` (coral)
- Accent secondary: `#81b29a` (mint)
- Border/decor: `#f2cc8f` (butter)

### Layout
- Header: coral title; pill buttons (mint + coral); hover scale.
- Main: 3-col grid; cards white, rounded-2xl, butter border, shadow; hover scale and coral-tinted border. Links mint → coral on hover.

### Text representation (from snapshot)
```
Background: Warm cream. Font: Fredoka.
Header: Coral title + pill "Import JSON" (mint), "Add link" (coral).
3-col grid; rounded-2xl cards, butter border, coral/mint links, bouncy hover.
```

### Do NOT repeat in future styles
- Coral (#e07a5f) + mint (#81b29a) + butter (#f2cc8f) playful palette
- Fredoka only
- Pill buttons (rounded-full) with scale hover
- Playful / toy-like tone with rounded-2xl cards

---

## Style 9 — Path: `/9` — **Rejected**

**Name:** Soft / Pastel  
**Snapshot:** `snapshots/style-9.txt`

### High-level idea
- Soft, pastel: lavender background (#e8e0f0), soft violet accent (#9b8bb5). Outfit only. Rounded-xl (not pill) buttons and cards. Subtle gradient in header. Soft shadows, white/90 cards. 3-column grid.

### Color scheme
- Background: `#e8e0f0` (soft lavender)
- Text: `#3d3548`, muted `#7a6b8a`
- Accent: `#9b8bb5` (soft violet)
- Borders: `#d4c8e0`; dialog bg `#f5f0fa`

### Layout
- Header: soft gradient overlay; rounded-xl buttons (white/80 outline + violet solid).
- Main: 3-col grid; cards white/90, rounded-xl, soft border; hover shadow and violet-tinted border.

### Text representation (from snapshot)
```
Background: Soft lavender. Font: Outfit.
Header: Subtle gradient; rounded-xl Import (outline), Add link (violet).
3-col grid; white/90 cards, rounded-xl, soft violet links, gentle hover.
```

### Do NOT repeat in future styles
- Lavender (#e8e0f0) + soft violet (#9b8bb5) pastel palette
- Outfit only
- Soft pastel tone with rounded-xl (not pill) and header gradient overlay

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
