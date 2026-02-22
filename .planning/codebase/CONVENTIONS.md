# Coding Conventions

**Analysis Date:** 2026-02-19

## Naming Patterns

**Files:**
- TypeScript/JavaScript utilities: camelCase (`date.ts`, `format.ts`, `github.ts`)
- Astro components: PascalCase with `.astro` extension (`Footer.astro`, `WorkCard.astro`, `BaseLayout.astro`)
- Svelte components: PascalCase with `.svelte` extension (`ThemeToggle.svelte`, `ReadingProgress.svelte`, `TableOfContents.svelte`)
- Markdown content: kebab-case with date folder structure (`src/content/writing/YYYY/MM/post-slug.md`)
- Scripts: either kebab-case (`.mjs`, `.js`) or camelCase (`ingest.mjs`, `new-post.mjs`, `prebuild-clean.js`)
- Style classes: kebab-case with optional prefix (`gw-code-mockup`, `gw-code-mockup__header`, `.work-card`)

**Functions:**
- camelCase: `formatDate()`, `parseGitHubData()`, `getReadingTime()`, `slugify()`, `findUniqueSlug()`
- Helper functions: descriptive verbs first (`collectSlugs()`, `escapeYamlString()`, `relativeTime()`)
- Private/internal functions: same convention (no underscore prefix, but use comments to document scope)

**Variables:**
- camelCase for all JavaScript/TypeScript variables: `theme`, `progress`, `writingDir`, `baseSlug`
- CONSTANT_CASE for module-level constants: `WORDS_PER_MINUTE`, `TERMINAL_LANGS`, `TAG_KEYWORDS`, `VALID_TAGS`
- Type variables: PascalCase in generics (`<Props>`, `<'writing'>`, `<'work'>`)

**Types:**
- Interface and Type names: PascalCase (`Props`, `GitHubData`, `ActivityItem`, `ArticleSchema`, `BreadcrumbItem`)
- Literal type unions: kebab-case for string literals (`'dark' | 'light'`, `'homelab' | 'docker' | 'linux'`)
- Discriminated union values: kebab-case (`status: 'active' | 'maintained' | 'archived'`)

## Code Style

**Formatting:**
- No dedicated formatter is configured (no `.prettierrc`, `biome.json`, or `.eslintrc`)
- Import statements use double quotes
- JSDoc/TSDoc comments use the `/**` standard format (see examples below)
- Semicolons are used throughout
- Two-space indentation (observed in astro.config.mjs, scripts)
- One blank line between top-level functions and types

**Comments:**
- File-level: JSDoc block with purpose description (see `src/utils/date.ts`, `src/utils/github.ts`)
- Function-level: JSDoc comment with brief description and `@param`/`@return` where helpful
- Inline comments: sparingly used for non-obvious logic (see `src/utils/reading-time.ts` lines 9, 18)
- Implementation notes: Comments document intent (`// Escape backslashes first (before other escapes add more)`)
- Control character stripping: Comments reference intentions (`// biome-ignore lint/...` to document intentional patterns)

## Import Organization

**Order:**
1. Node.js built-in modules (`import { readFile } from 'node:fs/promises'`)
2. Third-party packages (`import { defineCollection, z } from 'astro:content'`)
3. Astro internal imports (`import type { CollectionEntry } from 'astro:content'`)
4. Relative imports with path aliases (`import { formatDate } from '@utils/date'`)
5. Relative imports without aliases (`.`) (`import './styles/global.css'`)

**Path Aliases:**
Configured in `tsconfig.json` for type-safe imports:
- `@components/*` → `src/components/*`
- `@layouts/*` → `src/layouts/*`
- `@utils/*` → `src/utils/*`
- `@styles/*` → `src/styles/*`
- `@content/*` → `src/content/*`

**Barrel Files:**
Not used in this codebase. Components and utilities are imported directly from their specific files.

## Error Handling

**Approach:**
- Permissive parsing with safe defaults: Functions like `parseGitHubData()` validate and return empty defaults rather than throwing
- Type guards for validation: `isValidMbid()` uses a type guard (`id is string`) to safely narrow types
- Try-catch for external operations: `safeUrl()` wraps URL parsing in try-catch, returns `undefined` on failure
- Early returns for error conditions: `if (!raw || typeof raw !== 'object') return EMPTY_GITHUB_DATA`
- Invalid input handling: Validate dates with `Number.isNaN(d.getTime())` before use

**Pattern Examples:**

Permissive parsing with defaults:
```typescript
// From src/utils/github.ts
export function parseGitHubData(raw: unknown): GitHubData {
  if (!raw || typeof raw !== 'object') return EMPTY_GITHUB_DATA;
  const data = raw as Record<string, unknown>;
  // Type-check each field before using
  return {
    lastUpdated: typeof data.lastUpdated === 'string' ? data.lastUpdated : '',
    // ...
  };
}
```

Safe URL handling:
```typescript
// From src/utils/format.ts
export function safeUrl(url: string | undefined | null): string | undefined {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return url;
  } catch {
    // invalid URL
  }
  return undefined;
}
```

## Logging

**Framework:** `console` (native, no logging library)

**Patterns:**
- Interactive CLI scripts use `console.log()` for user feedback (see `scripts/ingest.mjs`)
- No log levels or structured logging (application is mostly static site generation)
- Errors in try-catch blocks are caught but not logged (silent failure approach)

## JSDoc/TSDoc

**Usage:** Extensively documented for all exported functions and types.

**Pattern:**
- File header: Describes module purpose
- Function documentation: Brief description, parameters, return type
- Complex algorithms: Inline comments explain non-obvious steps

**Examples:**

```typescript
/**
 * Format a date as "December 9, 2024" using Canadian English locale.
 */
export function formatDate(date: Date): string {
  // ...
}

/**
 * Safely load and validate GitHub data from the JSON import.
 */
export function parseGitHubData(raw: unknown): GitHubData {
  // ...
}

/**
 * Relative time string from an ISO date (e.g. "3h ago", "2d ago").
 */
export function relativeTime(dateString: string): string {
  // ...
}

/**
 * Generate Article schema for writing posts
 */
export function articleSchema({
  title,
  description,
  pubDate,
  updatedDate,
  url,
  siteUrl,
}: ArticleSchema): object {
  // ...
}
```

## Function Design

**Size:**
- Utility functions are typically 5-40 lines
- Transformer functions (Shiki, Rehype) can be 70+ lines with internal helper functions
- Each function does one thing clearly

**Parameters:**
- Destructured props objects for Astro/Svelte components (see `WorkCard.astro`)
- Positional parameters for simple utilities (`formatDate(date: Date)`)
- Options objects for functions with multiple related parameters

**Return Values:**
- Typed explicitly: Functions return specific types (`GitHubData`, `string`, `number`, `Element`)
- Defensive returns: Safe defaults on invalid input (`EMPTY_GITHUB_DATA`, `undefined`, empty string `''`)
- Tuple returns: Not used; use objects instead
- Void for side-effects: Only in event handlers and lifecycle methods

## Module Design

**Exports:**
- Each utility file exports specific functions/types it defines (no wildcard exports)
- Types are exported alongside their utility functions
- Constants are exported at module level

**Pattern:**
```typescript
// src/utils/format.ts exports:
export function relativeTime(dateString: string): string { ... }
export function truncate(str: string, max: number): string { ... }
export function isValidMbid(id: string | null | undefined): id is string { ... }
export function safeUrl(url: string | undefined | null): string | undefined { ... }
export function formatTimestamp(dateString: string): string { ... }

// src/utils/github.ts exports:
export interface GitHubContributions { ... }
export interface CalendarDay { ... }
export type ActivityType = 'commit' | 'pr' | 'issue';
export interface ActivityItem { ... }
export function activityIconPath(type: ActivityType): string { ... }
export function activityLabel(type: ActivityType): string { ... }
export const EMPTY_GITHUB_DATA: GitHubData = { ... };
export function parseGitHubData(raw: unknown): GitHubData { ... }
```

## Astro Component Conventions

**Props pattern:**
```typescript
interface Props {
  project: CollectionEntry<'work'>;
}

const { project } = Astro.props;
```

**Frontmatter organization:**
1. Imports
2. Type definitions (Props interface)
3. Props destructuring
4. Derived values and computed properties
5. Template markup
6. Styles (scoped)

**Client directives:**
- `client:idle` for interactive components that aren't immediately necessary (`ReadingProgress`, `TableOfContents`)
- No hydration for static components

## Svelte 5 Conventions

**Reactivity:**
- Runes for state: `let theme = $state('dark')`
- Effects: `$effect(() => { ... })`
- Event handlers inline: `onclick={toggle}`, `onchange={handleChange}`

**Scoped styles:**
- All styles within `<style>` blocks are component-scoped
- CSS custom properties for theming (`--colour-accent-primary`, `--space-4`)

## Schema Validation

**Tool:** Zod for content schema validation (see `src/content/config.ts`)

**Pattern:**
```typescript
const writing = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      title: z.string().max(100),
      description: z.string().max(200),
      pubDate: z.coerce.date(),
      tags: z.array(z.string()).min(1).max(4),
      draft: z.boolean().default(false),
      heroImage: image().optional(),
    }),
});
```

## Source of Truth Comments

Cross-file duplication is documented with "SOURCE OF TRUTH" comments:
- `src/utils/tags.ts` is the canonical source for tag taxonomy
- `scripts/lib/cli-utils.mjs` and `scripts/ingest.mjs` duplicate these because `.mjs` cannot import `.ts` without a build step
- Comments explicitly state which file is authoritative and what files must be kept in sync

Example from `src/utils/tags.ts`:
```typescript
/**
 * Canonical tag taxonomy for gwilym.ca writing collection.
 *
 * SOURCE OF TRUTH: This file defines the authoritative tag taxonomy.
 * The CLI scripts (scripts/lib/cli-utils.mjs, scripts/ingest.mjs) duplicate
 * these definitions because .mjs cannot import .ts without a build step.
 * When modifying tags here, also update:
 *   - scripts/lib/cli-utils.mjs (TAG_CATEGORIES, VALID_TAGS)
 *   - scripts/ingest.mjs (TAG_KEYWORDS)
 */
```

---

*Convention analysis: 2026-02-19*
