# wcWIKI Search & Auto-Suggest Rules

> **Purpose:** This document defines the search and auto-suggest behavior for wcWIKI.
> All future development MUST follow these rules to maintain consistency.
> Read this document before making ANY changes to search or suggestion logic.

---

## 1. Search Architecture

### Components
| Component | Technology | Purpose |
|-----------|-----------|---------|
| Full-text search | MeiliSearch v1.12 | Searches artists, paintings, articles indexes |
| Query logging | PostgreSQL (SearchQuery table) | Logs every completed search for analytics |
| Auto-suggest API | `/api/search/suggest` | Returns keyword suggestions while typing |
| Search API | `/api/search` | Returns search results from MeiliSearch |
| SearchBox UI | `SearchBox.tsx` (React client) | Input with auto-suggest dropdown |

### MeiliSearch Indexes
- `artists` — searchable: name, bio, nationality, styles
- `paintings` — searchable: title, artistName, description, tags, medium
- `articles` — searchable: title, excerpt, content (HTML stripped), tags, authorName
- `suggestions` — auxiliary index (populated at sync but NOT used for auto-suggest)

---

## 2. Search Behavior

### How Search Works
1. User types query → SearchBox debounces 150ms → calls `/api/search/suggest`
2. User submits (Enter / clicks result) → navigates to `/search?q=...` → calls `/api/search`
3. `/api/search` queries MeiliSearch → returns results → logs query to PostgreSQL

### Search Options
- **Matching strategy:** `"frequency"` — prioritizes documents where ALL query words appear
- **Phrase search:** Wrap in `"double quotes"` for exact phrase matching (MeiliSearch native)
- **Highlighting:** `<mark>` tags around matched terms
- **Article content cropping:** `cropLength: 30` on article body content

### What Gets Logged
- **ONLY completed searches** are logged (when user navigates to search results page)
- Auto-suggest keystrokes are **NEVER** logged
- Logged data: query (lowercase), category, result count, country (from headers), user agent

---

## 3. Auto-Suggest Rules (Google-style)

### Core Principle
> Auto-suggest shows **plain keyword/phrase suggestions only**.
> It does NOT show entity cards, direct links, or type indicators.
> Every suggestion, when clicked, triggers a search — just like Google.

### Suggestion Source
- **Past user queries ONLY** — Completed searches from the DB that passed quality filters. No content titles, artist names, painting titles, or tags. This keeps suggestions clean and purely based on real user search behavior, just like Google.

### Quality Filters for DB Queries
| Rule | Value | Reason |
|------|-------|--------|
| Minimum query length | 3 chars | Rejects keystroke fragments like "tu", "wa" |
| Minimum occurrence count | 2 searches | Ensures query was searched by multiple users or multiple times |
| Repeated characters | Rejected | Filters "aaa", "ttt" etc. |
| Time window | 90 days | Only recent queries are relevant |
| Exact match of input | Skipped | Don't suggest what user already typed |
| Deduplication | Case-insensitive | "Watercolor" and "watercolor" are the same |

### Trending (Empty Input)
When the user focuses the search box with no input:
- Shows **"Trending Searches"** from the last 7 days
- Same quality filters apply (≥3 chars, no repeated chars)
- Minimum count: 1 (lower threshold since trending has less data)
- Shows search count next to each trending term

### Dropdown Behavior
- Debounce: 150ms after last keystroke
- Maximum items: 8
- Trending visible while suggestions are loading (no flicker)
- "Search for '...'" button always visible at bottom when typing
- Keyboard navigation: ArrowUp/Down, Enter to select, Escape to close
- Click outside to close

---

## 4. What NOT to Do

### Never
- Show content titles, artist names, painting titles, or tags in auto-suggest
- Show entity types (Artist, Painting, Article) in auto-suggest
- Navigate directly to an entity page from auto-suggest (always search first)
- Log auto-suggest API calls as search queries
- Show queries shorter than 3 characters in suggestions
- Use MeiliSearch indexes for auto-suggest (only use past DB queries)

### Avoid
- Showing partial keystroke queries (e.g., "waterc", "tur") as suggestions
- Adding any non-query data source to suggestions
- Removing the quality filter without replacing it with something better

---

## 5. Scaling Notes (10K+ Queries)

As query volume grows, the suggestions will naturally improve since they are purely based on real user searches:

- **No code changes needed** — the `MIN_QUERY_COUNT` filter (≥2) naturally surfaces popular queries and hides one-off junk
- **Consider increasing `MIN_QUERY_COUNT`** to 3-5 when you reach 50K+ queries to keep suggestions clean
- **90-day window** ensures seasonal/trending relevance without noise from ancient searches

### Future Improvements (When Query Volume Justifies)
1. **Prefix matching** — Switch from `contains` to `startsWith` for DB queries once you have enough data (Google uses prefix match)
2. **Query normalization table** — Merge "watercolour" / "watercolor" / "water color" into one canonical form
3. **Click-through tracking** — Track which suggestion was clicked to rank by conversion, not just search count
4. **Personalization** — Factor in user's past searches (requires auth)

---

## 6. Configuration Constants

All tunable values are at the top of `src/app/api/search/suggest/route.ts`:

```typescript
const MIN_QUERY_LENGTH = 3;       // Minimum chars for a query to be a suggestion
const MIN_QUERY_COUNT = 2;        // Minimum DB occurrences to qualify
const DB_WINDOW_DAYS = 90;        // How far back to look for popular queries
const TRENDING_WINDOW_DAYS = 7;   // How far back for trending
const TRENDING_MIN_COUNT = 1;     // Minimum count for trending
```

---

## 7. File Map

| File | Purpose |
|------|---------|
| `src/app/api/search/route.ts` | Main search API — queries MeiliSearch, logs queries |
| `src/app/api/search/suggest/route.ts` | Auto-suggest API — returns keyword suggestions |
| `src/components/search/SearchBox.tsx` | Search input UI with dropdown |
| `src/lib/search/client.ts` | MeiliSearch client + index names |
| `src/lib/search/sync.ts` | TypeScript sync functions (used by admin reindex) |
| `src/lib/search/utils.ts` | `stripHtml()` utility |
| `scripts/sync-meilisearch.js` | Docker entrypoint sync script |
| `docs/SEARCH-RULES.md` | **This file** — search behavior rules |
