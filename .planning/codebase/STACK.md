# Technology Stack

**Analysis Date:** 2026-02-19

## Languages

**Primary:**
- TypeScript 5.9.3 - Full codebase type safety
- JavaScript (ESM) - Scripts and configuration

**Secondary:**
- Markdown - Content (blog posts, projects)
- YAML - Data files for workflow configuration

## Runtime

**Environment:**
- Node.js 20+ (enforced via `package.json` engines field)

**Package Manager:**
- npm (default)
- Lockfile: `package-lock.json` (inferred, not visible but standard for npm)

## Frameworks

**Core:**
- Astro 5.17.1 - Static site generation, content collections, markdown processing
- Svelte 5.49.1 - Interactive islands (theme toggle, search component)
- React 19.2.4 - Activity calendar visualization

**Styling:**
- Tailwind CSS 4.1.18 - Utility-first styling with custom CSS variables
- @tailwindcss/vite 4.1.18 - Vite integration for Tailwind

**Content & Markdown:**
- astro:content - Type-safe content collections
- Shiki (built into Astro) - Code syntax highlighting
- rehype-slug 6.0.0 - Auto-generate heading IDs

**UI Components:**
- react-activity-calendar 3.1.1 - GitHub-style contribution heatmap visualization

## Key Dependencies

**Critical:**
- @astrojs/svelte 7.2.5 - Astro integration for Svelte islands
- @astrojs/react 4.4.2 - Astro integration for React components
- @astrojs/rss 4.0.15 - RSS feed generation
- @astrojs/sitemap 3.7.0 - Sitemap generation

**Fonts (Self-Hosted):**
- @fontsource/inter 5.2.8 - Body text (400, 500, 600, 700 weights)
- @fontsource/jetbrains-mono 5.2.8 - Code blocks (400 weight)
- @fontsource/space-grotesk 5.2.10 - Headings h1-h3 (600, 700 weights)

**Development:**
- @inquirer/prompts 8.2.0 - CLI prompts for `npm run ingest` script

## Build Tools

**Vite:**
- Built into Astro 5.x
- Rollup configuration for external pagefind-ui.js: `src/styles/vite-config`

**Linting & Formatting:**
- Not detected - No `.eslintrc` or `.prettierrc` found in root

**Code Highlighting:**
- Shiki (built-in) - Uses custom theme file `src/styles/shiki-gwilym.json`

## Configuration

**TypeScript:**
- Config: `tsconfig.json`
- Extends: `astro/tsconfigs/strict`
- Path aliases defined:
  - `@components/* → src/components/*`
  - `@layouts/* → src/layouts/*`
  - `@utils/* → src/utils/*`
  - `@styles/* → src/styles/*`
  - `@content/* → src/content/*`

**Astro:**
- Config: `astro.config.mjs`
- Site: `https://gwilym.ca`
- Markdown processors: Shiki (custom theme) + rehypeSlug
- Integrations: svelte(), react(), sitemap()

**Svelte:**
- Config: `svelte.config.js`
- Preprocessor: vitePreprocess()

**Environment:**
- Node version lock: `.nvmrc` (specifies Node 20)
- Environment variables: `.env` (present but not readable - contains non-secret config)
- Template: `.env.example` shows structure for future integrations:
  - `HARDCOVER_TOKEN` (future)
  - `HARDCOVER_USER_ID` (future)
  - `LISTENBRAINZ_USERNAME` (future)

## Search & Indexing

**Pagefind:**
- Version: Latest (managed by npm post-build script)
- Integration: Lazy-loaded client-side via `/pagefind/pagefind-ui.js`
- Build step: `npm run build` includes `npx pagefind --site dist`
- Component: `src/components/Search.svelte` - Svelte island that dynamically imports UI

## Platform Requirements

**Development:**
- Node.js 20.x or higher
- npm (for package management and scripts)
- System: macOS, Linux, or Windows (cross-platform standard)

**Production:**
- Cloudflare Pages hosting (see INTEGRATIONS.md)
- Auto-deploys from GitHub on push to `main` branch

---

*Stack analysis: 2026-02-19*
