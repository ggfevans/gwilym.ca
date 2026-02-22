# Codebase Structure

**Analysis Date:** 2026-02-19

## Directory Layout

```
gwilym.ca/
├── src/
│   ├── components/           # Reusable UI elements
│   ├── content/              # Markdown collections with Zod schemas
│   ├── data/                 # Static JSON/YAML for widgets
│   ├── layouts/              # Page shells
│   ├── pages/                # Route definitions
│   ├── styles/               # Global CSS, design tokens
│   └── utils/                # Pure utility functions
├── scripts/                  # Build-time scripts
├── docs/                     # Project documentation
├── .planning/codebase/       # GSD analysis documents
├── astro.config.mjs          # Astro config
├── tsconfig.json             # TypeScript config with path aliases
├── package.json              # Dependencies and scripts
└── dist/                     # Build output (gitignored)
```

## Directory Purposes

**`src/components/`:**
- Purpose: Reusable UI building blocks
- Contains: `.astro` static components, `.svelte` islands, `.tsx` React components, `.css` scoped styles
- Key files: `Header.astro`, `Footer.astro`, `BaseHead.astro`, `ThemeToggle.svelte`, `Search.svelte`, `PostCard.astro`
- Subdirectory: `widgets/` for activity display components (ReadWidget, ListenWidget, etc.)

**`src/content/`:**
- Purpose: Type-safe markdown content with frontmatter validation
- Contains: `config.ts` (collection schemas), `writing/` (blog posts), `work/` (project case studies)
- Structure: Posts organised by year/month in `writing/` (e.g., `writing/2024/12/my-post.md`)
- Schema enforcement: Zod validates `title`, `description`, `pubDate`, `tags`, `draft` (posts) and `title`, `description`, `status`, `tags` (work)

**`src/data/`:**
- Purpose: Static or generated data for widgets and timelines
- Contains: `github.json` (contributions), `reading.json` (current book), `listening.json` (music), `watching.json` (films/shows), `timeline.yaml` (experience timeline)
- Population: Manual edits or populated by ingest scripts (`scripts/ingest.mjs`)

**`src/layouts/`:**
- Purpose: Reusable page shells with consistent chrome
- Contains: `BaseLayout.astro` (root HTML structure with theme init), `PostLayout.astro` (blog post wrapper), `PageLayout.astro` (generic content pages)
- Usage: Wrap `<slot />` with header, footer, metadata, and styling

**`src/pages/`:**
- Purpose: Route definitions that map to URLs
- Contains: `.astro` files for server-side rendering, `.ts` files for API endpoints
- Structure: Flat routes map to URLs (e.g., `pages/about/index.astro` → `/about/`), dynamic routes use brackets (e.g., `pages/write/[slug].astro` → `/write/{slug}/`)
- Special files: `rss.xml.ts` (RSS endpoint), `llms.txt.ts` (LLM manifest)

**`src/styles/`:**
- Purpose: Global styling, design tokens, utilities
- Contains: `global.css` (Tailwind imports, CSS variables, base styles), `widgets.css` (widget layout), `code-mockup.css` (code block styling), `shiki-gwilym.json` (code highlight theme)
- Design system: Custom properties for colours (p1-p5 palette, zinc neutrals), typography (Space Grotesk, Inter, JetBrains Mono), spacing (4px grid), widths (content, wide)

**`src/utils/`:**
- Purpose: Pure functions for data transformation, formatting, external APIs
- Contains: `date.ts` (Intl.DateTimeFormat), `format.ts` (text utilities), `json-ld.ts` (schema generators), `reading-time.ts` (estimate from markdown body), `tags.ts` (tag filtering), `github.ts` (GitHub API calls), `rehype-code-mockup.ts` (plugin for code styling)

**`scripts/`:**
- Purpose: Build-time automation
- Contains: `new-post.mjs` (scaffold blog post), `ingest.mjs` (fetch external data for widgets), `prebuild-clean.js` (clean build artifacts)

**`docs/`:**
- Purpose: Reference documentation
- Contains: `ARCHITECTURE.md` (tech stack), `CONTENT-SCHEMA.md` (frontmatter guide), `DESIGN-SYSTEM.md` (colours/fonts), `INFRASTRUCTURE.md` (CI/CD), `DECISIONS.md` (ADRs)

## Key File Locations

**Entry Points:**
- `src/pages/index.astro`: Homepage
- `src/pages/write/[slug].astro`: Individual blog post page
- `src/pages/write/index.astro`: Blog listing
- `src/pages/rss.xml.ts`: RSS feed endpoint

**Configuration:**
- `astro.config.mjs`: Astro build, markdown plugins (Shiki, rehype-slug), integrations (Svelte, React, Sitemap, Tailwind)
- `tsconfig.json`: Path aliases (`@components`, `@layouts`, `@utils`, `@styles`, `@content`)
- `package.json`: Scripts (dev, build, preview, new-post, ingest)

**Core Logic:**
- `src/layouts/BaseLayout.astro`: Root template with theme initialization script
- `src/layouts/PostLayout.astro`: Blog post wrapper with metadata, TOC, reading progress
- `src/components/Header.astro`: Navigation with breadcrumbs, theme toggle, search
- `src/components/ThemeToggle.svelte`: Dark/light theme toggle
- `src/components/Search.svelte`: Pagefind search modal
- `src/content/config.ts`: Zod collection schemas

**Testing:**
- No test files present (site is purely static, linted at build time)

**Styling:**
- `src/styles/global.css`: Design tokens, base styles, Tailwind configuration
- `src/styles/shiki-gwilym.json`: Custom code highlight theme

## Naming Conventions

**Files:**
- Astro components: `kebab-case.astro` (e.g., `post-card.astro` → imported as `PostCard`)
- Svelte components: `camelCase.svelte` (e.g., `ThemeToggle.svelte`)
- Utilities: `camelCase.ts` (e.g., `date.ts`, `json-ld.ts`)
- Markdown posts: `kebab-case.md` under `writing/YYYY/MM/` (e.g., `writing/2024/12/hello-world.md`)

**Components:**
- **Astro components (`.astro`):** Rendered as static HTML during build. Named in PascalCase when imported (e.g., `import PostCard from '@components/PostCard.astro'`), file is `post-card.astro`.
- **Svelte islands (`.svelte`):** Client-side interactivity. Imported directly with `.svelte` extension (e.g., `import ThemeToggle from '@components/ThemeToggle.svelte'`).
- **CSS classes:** Prefixed with `gw-` (e.g., `gw-navbar`, `gw-widget`, `gw-status`).

**Variables:**
- Camel case for function parameters, component props, state variables
- UPPER_CASE for constants (e.g., `SITE_NAME`, `DEFAULT_SITE_URL`)
- `--` prefix for CSS custom properties (e.g., `--colour-bg-primary`, `--space-4`)

**Types:**
- Zod schemas in `content/config.ts` define collection shapes
- Component Props interfaces (e.g., `interface Props { post: CollectionEntry<'writing'> }`)

## Where to Add New Code

**New Blog Post:**
- File: `src/content/writing/YYYY/MM/{slug}.md`
- Frontmatter: `title`, `description`, `pubDate`, `tags` (required); `draft`, `updatedDate`, `heroImage` (optional)
- URL: `/write/{slug}/` (derived from filename only, not folder structure)

**New Section Page (About, Work, Read, etc.):**
- Route: `src/pages/{section}/index.astro`
- Wrap with: `<BaseLayout>` template
- Navigation: Auto-included in header nav if route added to `navItems` in `Header.astro`

**New Reusable Component:**
- Location: `src/components/{ComponentName}.astro` (static) or `.svelte` (interactive)
- Pattern: Accept props via `interface Props`, style with scoped `<style>` block
- Prefix: Use `gw-` prefix for component root class

**New Utility Function:**
- Location: `src/utils/{purpose}.ts`
- Pattern: Pure function, export as named export, no side effects
- Example: `export function myFormatter(input: string): string { ... }`

**New Activity Widget:**
- Location: `src/components/widgets/{Name}Widget.astro`
- Data source: Import from `src/data/{name}.json` or similar
- Pattern: Wrap content in `.gw-widget` container with `.gw-widget__label`, `.gw-widget__content`
- Style: Inherit from `src/styles/widgets.css` base classes

**New Static Data File:**
- Location: `src/data/{name}.json` or `.yaml`
- Usage: Import in component (`import data from '@data/{name}.json'`)
- Population: Manually edited or populated by `scripts/ingest.mjs`

**New Script (Build-Time Automation):**
- Location: `scripts/{purpose}.mjs` or `.js`
- Usage: Run via `npm run {script-name}` (add to `package.json` scripts)
- Example: `scripts/ingest.mjs` fetches external data and writes to `src/data/`

## Special Directories

**`dist/`:**
- Purpose: Build output
- Generated: Yes (by `astro build`)
- Committed: No (gitignored)
- Contents: Static HTML, CSS, JS, and Pagefind search index

**`.astro/`:**
- Purpose: Astro build cache and generated types
- Generated: Yes (by Astro)
- Committed: No (gitignored)
- Contents: Type definitions for content collections

**`node_modules/`:**
- Purpose: npm dependencies
- Generated: Yes (by `npm install`)
- Committed: No (gitignored)

**`.planning/codebase/`:**
- Purpose: GSD analysis documents
- Contents: `ARCHITECTURE.md`, `STRUCTURE.md`, `CONVENTIONS.md`, `TESTING.md`, `CONCERNS.md` (as generated)
- Committed: Yes (reference for future phases)

## Content Organization Patterns

**Blog Post Paths:**
- Content stored: `src/content/writing/2024/12/hello-world.md`
- URL generated: `/write/hello-world/`
- Logic: `src/pages/write/[slug].astro` extracts filename from full slug via `slugParts[slugParts.length - 1]`
- Reason: Decouple file organization (by date) from public URLs (by name)

**Tag Filtering:**
- Tag archive: `src/pages/write/tags/[tag].astro`
- URL: `/write/tags/{tagname}/`
- Data: Posts marked with tags in frontmatter, filtered at page level
- Tag list: `src/components/TagList.astro` renders as colourful badges

## Module Boundaries

**No strict layer separation:** Components freely import from utils, layouts import components, pages import layouts. Dependency flows one direction: pages → layouts → components → utils.

**Path aliases:**
- `@components/*` → `src/components/*` (for UI)
- `@layouts/*` → `src/layouts/*` (for page shells)
- `@utils/*` → `src/utils/*` (for logic)
- `@styles/*` → `src/styles/*` (for styling)
- `@content/*` → `src/content/*` (for content metadata)

---

*Structure analysis: 2026-02-19*
