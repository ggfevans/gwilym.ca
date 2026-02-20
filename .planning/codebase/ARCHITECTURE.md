# Architecture

**Analysis Date:** 2026-02-19

## Pattern Overview

**Overall:** Astro static site generation with Svelte 5 islands for client-side interactivity

**Key Characteristics:**
- Build-time markdown rendering to HTML with Shiki syntax highlighting
- Client-only (Svelte) interactivity for theme toggle, search, and TOC
- Content Collections API with Zod schemas for type-safe frontmatter
- JSON-LD structured data for SEO (Article, BreadcrumbList, WebSite schemas)
- Tailwind CSS 4 with custom design tokens (colour, typography, spacing)
- No runtime API—all data static or fetched at build time via scripts

## Layers

**Content Layer:**
- Purpose: Define and validate blog posts and work projects
- Location: `src/content/config.ts` (schemas), `src/content/writing/` (posts), `src/content/work/` (projects)
- Contains: Astro Content Collections with Zod validation
- Depends on: Astro:content API
- Used by: Page renderers, RSS feed, post listings

**Page/Route Layer:**
- Purpose: Render page responses from content and data
- Location: `src/pages/` (all route files)
- Contains: `.astro` files that fetch collections and render layouts; `.ts` endpoint handlers for RSS/llms.txt
- Depends on: Layouts, Components, Content Collections, Data files
- Used by: Astro router (outputs HTML at build time)

**Layout Layer:**
- Purpose: Wrap page content with chrome (header, footer, SEO)
- Location: `src/layouts/`
- Contains: `BaseLayout.astro` (root shell with theme script), `PostLayout.astro` (blog post wrapper), `PageLayout.astro` (content pages)
- Depends on: Components (Header, Footer, BaseHead)
- Used by: Page renderers

**Component Layer:**
- Purpose: Reusable UI elements—mostly static Astro components, some Svelte islands
- Location: `src/components/`
- Contains: Astro components (`.astro`) for rendering, Svelte components (`.svelte`) for interactivity, React component (ContributionHeatmap.tsx)
- Depends on: Utilities, Styles, Data files (for widgets)
- Used by: Layouts and pages

**Utility Layer:**
- Purpose: Pure functions for data transformation, formatting, SEO
- Location: `src/utils/`
- Contains: `date.ts` (Intl formatting), `json-ld.ts` (schema generators), `reading-time.ts`, `format.ts`, `tags.ts`, `github.ts` (API interactions)
- Depends on: Standard library, no local dependencies
- Used by: Components, pages, content renderers

**Data Layer:**
- Purpose: Static JSON/YAML files for activity widgets and timelines
- Location: `src/data/` (github.json, reading.json, listening.json, watching.json, timeline.yaml)
- Contains: Manually curated or script-populated data
- Depends on: Manual updates or ingest scripts
- Used by: Widgets (StatusWidget, ReadWidget, ListenWidget, WatchWidget, CodeWidget)

**Styling Layer:**
- Purpose: Global design tokens, component styles, utilities
- Location: `src/styles/`
- Contains: `global.css` (Tailwind imports, design tokens, base styles), `widgets.css` (shared widget styles), `shiki-gwilym.json` (code highlight theme)
- Depends on: Tailwind CSS, theme variables
- Used by: All components via CSS custom properties

## Data Flow

**Static Rendering (Build Time):**

1. Markdown posts loaded from `src/content/writing/` → Zod schema validation (`content/config.ts`)
2. Posts sorted by `pubDate`, filtered (draft status) → Passed to page templates
3. `src/pages/write/[slug].astro` generates static pages for each post
4. Content rendered via `getStaticPaths()` + render API → HTML + JSON cached

**Content Collections → Pages:**

```
src/content/writing/*.md
  ↓
content/config.ts (Zod schema validation)
  ↓
src/pages/index.astro (fetch writing collection, slice 3 recent)
  ↓
PostCard.astro (render each post preview)
  ↓
HTML output
```

**Post Detail Flow:**

```
src/pages/write/[slug].astro
  ↓
getStaticPaths() extracts filenames from collection slugs (e.g., "2024/12/hello-world" → "hello-world")
  ↓
render(post) → Content component
  ↓
PostLayout wraps content with header (metadata, tags, TOC) + footer
  ↓
HTML output
```

**Widget Data Flow:**

```
src/data/github.json, reading.json, etc.
  ↓
Components/widgets/[Type]Widget.astro (import and parse)
  ↓
Display activity (compact or full)
  ↓
HTML static output (no client updates)
```

**State Management:**

- **Theme state:** Initialized by inline script in `BaseLayout.astro` (read localStorage, detect system preference) → Stored in `window.__theme` → Svelte `ThemeToggle` reads and updates
- **Client interactivity:** Svelte islands (`ThemeToggle`, `MobileNav`, `Search`, `TableOfContents`, `ReadingProgress`) manage their own state via Svelte 5 reactivity
- **No global store:** Each Svelte component owns its state; theme is a special case shared via localStorage + DOM class

**Search (Pagefind):**

```
Build: astro build → dist/
  ↓
npx pagefind --site dist (crawls HTML, builds search index)
  ↓
/pagefind/ directory in dist (index.json, pagefind.js, pagefind-ui.js)
  ↓
Search.svelte lazy-loads pagefind-ui.js on dialog open
  ↓
Query results rendered
```

## Key Abstractions

**Content Collection:**
- Purpose: Type-safe markdown with validated frontmatter
- Examples: `src/content/config.ts` defines `writing` and `work` collections
- Pattern: Zod schema validation enforced at collection level; compiler catches invalid frontmatter at build time

**Layout Composition:**
- Purpose: Consistent page structure without duplication
- Examples: `BaseLayout` (root), `PostLayout` (post chrome), `PageLayout` (generic pages)
- Pattern: `<slot />` for main content; named slots for head metadata

**Component Islands:**
- Purpose: Lazy-load interactivity only where needed
- Examples: `ThemeToggle.svelte`, `Search.svelte`, `TableOfContents.svelte`
- Pattern: `client:idle` / `client:load` directives in Astro templates; Svelte handles reactivity

**Utilities as Pure Functions:**
- Purpose: Separate formatting logic from markup
- Examples: `formatDate()`, `toJsonLd()`, `getReadingTime()`
- Pattern: No side effects; reusable across components and pages

**Structured Data (JSON-LD):**
- Purpose: SEO metadata in machine-readable format
- Examples: Article schema, BreadcrumbList, WebSite
- Pattern: Generated by utils, injected as `<script type="application/ld+json">` in head slots

## Entry Points

**Homepage:**
- Location: `src/pages/index.astro`
- Triggers: Root path `/`
- Responsibilities: Fetch recent posts (slice 3), render hero, status widget, activity bar, activity grid, recent writing section

**Blog Post Page:**
- Location: `src/pages/write/[slug].astro`
- Triggers: `/write/{filename}/` (note: filename derived from last path segment of content slug)
- Responsibilities: Fetch single post by slug, render via PostLayout with TOC, reading progress, metadata, JSON-LD

**Writing Listing:**
- Location: `src/pages/write/index.astro`
- Triggers: `/write/`
- Responsibilities: Fetch all non-draft posts, sort by date, render grid of PostCards

**RSS Feed:**
- Location: `src/pages/rss.xml.ts`
- Triggers: `/rss.xml`
- Responsibilities: Generate RSS feed of all non-draft posts with custom language tag (en-CA)

**Tag Archive:**
- Location: `src/pages/write/tags/[tag].astro`
- Triggers: `/write/tags/{tagname}/`
- Responsibilities: Fetch posts matching tag, render filtered listing

**Section Pages:**
- Locations: `src/pages/about/index.astro`, `src/pages/work/index.astro`, `src/pages/read/index.astro`, etc.
- Triggers: `/about`, `/work`, `/read`, `/listen`, `/watch`, `/now`, `/resume`
- Responsibilities: Render static content and activity widget views

## Error Handling

**Strategy:** No explicit error boundaries. Content schema validation fails at build time.

**Patterns:**
- **Missing required fields:** Zod validation throws at build time; prevent publishing invalid frontmatter
- **Broken links:** No runtime validation; use preview build checks or manual audit
- **Missing images:** Image optimization errors surface at build time if `heroImage` reference is invalid
- **Pagefind unavailable:** Fallback message in `Search.svelte`: "Search is not available in development mode"

## Cross-Cutting Concerns

**Logging:** None. Site is purely static; logging would require external service.

**Validation:** Enforced at build time via Zod schemas (`content/config.ts`). Frontmatter must conform or build fails.

**Authentication:** None. Site is public; no auth required.

**Accessibility:** Semantic HTML (article, nav, aside, main), ARIA labels on buttons (theme toggle, search, TOC), skip link in BaseLayout, IntersectionObserver for TOC active state

**Performance:** Static HTML at build time (zero JS overhead for page rendering); Svelte islands async-load on `client:idle` (non-critical) or `client:load` (critical, e.g., Search). Code highlighting done at build time via Shiki.

**SEO:** JSON-LD structured data for all pages, sitemap generated by `@astrojs/sitemap`, RSS feed at `/rss.xml`, heading IDs auto-generated by `rehype-slug`

---

*Architecture analysis: 2026-02-19*
