---
name: ProcurementGrid enhancements
overview: "Enhance the prompt for ProcurementGrid changes: add a search bar that filters by the table's indexed fields (state, city), with comma-separated terms OR'd for multiple states/cities; consolidate the UI by state with counts and clickable city/procurement links."
todos: []
isProject: false
---

# Enhanced prompt: ProcurementGrid search and state consolidation

Use this refined prompt when implementing or delegating the work:

---

**In [src/components/ProcurementGrid.tsx](src/components/ProcurementGrid.tsx), make the following changes:**

**1) Add a search bar that uses the table's indexed fields**

- Add a search input (e.g. using [src/components/ui/input.tsx](src/components/ui/input.tsx)) above the grid, with a clear label (e.g. "Search by state or city"). The search bar should handle multiple keywords with comma separation: **each term is OR'd** so that a link matches if it matches *any* term. This allows filtering for multiple states at once (e.g. "texas, florida") or different cities in different states (e.g. "Austin, Miami").
- Filter the displayed links using the same fields that are indexed on the `procurementLinks` table in [convex/schema.ts](convex/schema.ts): **state**, **city**, and optionally **official_website** and **procurement_link** (e.g. case-insensitive substring match on state and city; URL fields optional). 
- Keep filtering **client-side** by filtering the result of the existing `list` query; the indices are the source of truth for which fields are searchable. If you later need server-side search for large datasets, add a Convex query that uses `by_state` / `by_city` (e.g. filter by state first, then search within that state).

**2) Consolidate the cards by state**

- **Group links by state**: One card (or section) per state instead of one card per link.
- Preserve the **Edit** action per link (e.g. per row or via an edit button next to each city/link).

---

## Implementation notes (for the plan)

- **Data flow**: Continue using `useQuery(api.procurementLinks.list)`; derive `filteredLinks` with a `useMemo` that filters by search string (state, city, and optionally URL fields). Derive `linksByState` by grouping `filteredLinks` by `link.state`.
- **Search**: Search string is split on commas into multiple terms; a link is included if it matches **any** term (OR logic). Each term is matched against `state`, `city`, and optionally `official_website` and `procurement_link` (case-insensitive substring). Example: "texas, florida" shows all links in Texas or Florida; "Austin, Miami" shows those cities regardless of state.
- **UI structure**: Map over `Object.entries(linksByState)` (or a sorted array of states) and render one Card per state; inside each card, map over that state's links and render city + clickable procurement link (+ optional official site link) + Edit.
- **Empty state**: If `filteredLinks.length === 0`, show a "No matches" message; if `links.length === 0`, keep the existing empty state.

---

## Clarification you may want to confirm

- **Clickable element**: The prompt says "make the html element a clickable link." Assumption: the **procurement portal** (and optionally the official site) for each city should be `<a>` tags; the **city name** can be either plain text or also link to the procurement URL. If you want the city name itself to be the link to the procurement portal, say so explicitly in the prompt.
