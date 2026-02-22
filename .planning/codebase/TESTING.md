# Testing Patterns

**Analysis Date:** 2026-02-19

## Test Framework

**Status:** No test framework configured

**Current State:**
- No test runner (Vitest, Jest, etc.) installed
- No test files in `src/` directory (tests are not present)
- No test configuration files (no `vitest.config.ts`, `jest.config.js`, etc.)
- No test scripts in `package.json` (only `dev`, `build`, `preview`, `astro`, `new-post`, `ingest`)

**Dependencies:**
- Only development tooling: `@inquirer/prompts` for CLI scripts
- No testing libraries in `devDependencies`

## Application Type

**Static Site Generator (Astro):**
This is a personal blog/portfolio site built with Astro. The application comprises:
- Markdown content collection (no database)
- Static components (Astro `.astro`, Svelte `.svelte`, React `.tsx`)
- Utility functions for formatting, parsing, validation
- CLI scripts for content ingestion and project management

**Testing Approach:**
Manual testing and code review appear to be the primary quality assurance methods. The application is:
1. **Low-complexity logic** - Most utilities are simple formatting/parsing functions
2. **High-visibility changes** - Content and component changes are easily reviewable in git diffs
3. **Static output** - No runtime state mutations or async complexity requiring test coverage

## Testable Code Areas

If testing were to be implemented, these areas would be prioritized:

### High Priority (Business Logic)

**`src/utils/github.ts`:**
- `parseGitHubData()` - Validates and coerces external JSON data to known shape
- `activityLabel()` - Simple lookup function
- `formatStreak()` - Number formatting with pluralization logic
- **Why test:** External data validation, pluralization edge cases

**`src/utils/format.ts`:**
- `relativeTime()` - Complex date arithmetic with multiple conditions
- `isValidMbid()` - Regex validation with type guard
- `safeUrl()` - Protocol whitelist validation
- `formatTimestamp()` - Locale-specific date formatting
- **Why test:** Date math edge cases, regex validation, protocol safety

**`src/utils/reading-time.ts`:**
- `getReadingTime()` - HTML/markdown stripping, word count, minimum value logic
- **Why test:** Regex patterns for stripping various markdown/HTML formats, edge cases (empty content, tags)

**`src/utils/date.ts`:**
- `formatDate()` - Locale-specific formatting
- **Why test:** Ensure Canadian locale is applied consistently

**`src/utils/json-ld.ts`:**
- Schema generation functions (`articleSchema()`, `breadcrumbSchema()`, etc.)
- `toJsonLd()` - JSON escaping for HTML embedding
- **Why test:** JSON-LD spec compliance, proper escaping of control characters

### Medium Priority (Data Validation)

**`src/content/config.ts`:**
- Zod schema validation for collection types
- **Current state:** Zod library is present for validation, but no test coverage
- **Why test:** Frontmatter parsing, type coercion for dates

**`scripts/lib/cli-utils.mjs`:**
- `slugify()` - String normalization
- `findUniqueSlug()` - Collision detection logic
- `escapeYamlString()` - Control character handling
- `collectSlugs()` - Recursive directory walking
- **Why test:** Edge cases in slug generation, YAML escaping correctness

### Low Priority (UI Components)

**Astro Components:**
- Component snapshot tests would be useful for detecting unintended markup changes
- **Current state:** No component testing framework configured
- **Example:** `src/components/WorkCard.astro`, `src/layouts/PostLayout.astro`

**Svelte Components:**
- Interactive components could benefit from event handler testing
- **Examples:** `src/components/ThemeToggle.svelte`, `src/components/ReadingProgress.svelte`
- **Challenge:** Would require browser environment (Vitest with jsdom or Playwright)

## Recommended Testing Setup (If Needed)

Should testing be added in the future, this stack would align with existing conventions:

```json
{
  "devDependencies": {
    "vitest": "^1.0.0",
    "@vitest/ui": "^1.0.0",
    "@testing-library/svelte": "^4.0.0"
  }
}
```

**Config file:** `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      lines: 70,
      functions: 70,
      branches: 70,
      statements: 70,
    },
  },
});
```

## Test Structure Pattern (If Implemented)

Based on observed code organization:

**File location:** Co-located next to implementation
```
src/utils/format.ts
src/utils/format.test.ts
```

**Suite organization:**
```typescript
import { describe, it, expect } from 'vitest';
import { relativeTime, isValidMbid, safeUrl } from './format';

describe('relativeTime', () => {
  it('should handle negative time differences (future dates)', () => {
    const future = new Date(Date.now() + 1000);
    expect(relativeTime(future.toISOString())).toBe('just now');
  });

  it('should format minutes correctly', () => {
    const oneMinAgo = new Date(Date.now() - 60000);
    expect(relativeTime(oneMinAgo.toISOString())).toBe('1m ago');
  });

  it('should handle invalid dates gracefully', () => {
    expect(relativeTime('invalid')).toBe('unknown date');
  });
});

describe('isValidMbid', () => {
  it('should validate standard UUID format', () => {
    const validId = 'a74b1b7f-71a5-4dc5-b17e-7e6f6b6e8b4f';
    expect(isValidMbid(validId)).toBe(true);
  });

  it('should reject null/undefined', () => {
    expect(isValidMbid(null)).toBe(false);
    expect(isValidMbid(undefined)).toBe(false);
  });

  it('should reject malformed UUIDs', () => {
    expect(isValidMbid('not-a-uuid')).toBe(false);
  });
});

describe('safeUrl', () => {
  it('should accept http and https URLs', () => {
    expect(safeUrl('https://example.com')).toBe('https://example.com');
    expect(safeUrl('http://example.com')).toBe('http://example.com');
  });

  it('should reject javascript: protocol', () => {
    expect(safeUrl('javascript:alert("xss")')).toBeUndefined();
  });

  it('should handle null/undefined/empty', () => {
    expect(safeUrl(null)).toBeUndefined();
    expect(safeUrl(undefined)).toBeUndefined();
    expect(safeUrl('')).toBeUndefined();
  });
});
```

## Testing Patterns for Astro Components

If component testing were added:

```typescript
// Component snapshot test
import { render } from 'astro-test-utils';
import WorkCard from './WorkCard.astro';

describe('WorkCard', () => {
  it('should render project card with all metadata', async () => {
    const project = {
      slug: 'test-project',
      data: {
        title: 'Test Project',
        description: 'A test project',
        status: 'active',
        tags: ['web-dev'],
        repo: 'https://github.com/example/test',
        url: 'https://example.com',
      },
    };

    const { html } = await render(WorkCard, { props: { project } });
    expect(html).toContain('Test Project');
    expect(html).toContain('active');
  });
});
```

## Testing Patterns for Svelte Components

If Svelte component testing were added:

```typescript
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import ThemeToggle from './ThemeToggle.svelte';

describe('ThemeToggle', () => {
  it('should toggle theme on click', async () => {
    render(ThemeToggle);

    const button = screen.getByRole('button');
    const user = userEvent.setup();

    await user.click(button);
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    await user.click(button);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('should persist theme to localStorage', async () => {
    render(ThemeToggle);

    const button = screen.getByRole('button');
    await userEvent.click(button);

    expect(localStorage.getItem('theme')).toBe('light');
  });
});
```

## Run Commands (If Testing Were Configured)

```bash
vitest                  # Run tests in watch mode
vitest run              # Run tests once
vitest run --coverage   # Generate coverage report
npm run test:ui         # Open Vitest UI dashboard
```

## Coverage Goals (If Testing Were Implemented)

Based on application type, recommended targets:

| Category | Target |
|----------|--------|
| Utility functions (format, validate, parse) | 85%+ |
| Component markup logic | 70%+ |
| Interactive handlers (Svelte) | 80%+ |
| Overall statements | 70%+ |

Prioritize coverage for:
- External data validation (`github.ts`, `format.ts`)
- Date/time handling (`date.ts`, `format.ts`, `reading-time.ts`)
- String transformations (`reading-time.ts`, `cli-utils.mjs`)

Accept lower coverage for:
- Component markup (snapshot tests sufficient)
- Styling (no JS coverage needed)
- CLI scripts (manual testing acceptable)

## Current Quality Assurance

Without automated tests, quality is maintained through:

1. **Type Safety:** TypeScript strict mode via `tsconfig.json` extends `astro/tsconfigs/strict`
2. **Git Review:** GitHub likely uses PR reviews (note commit messages reference `#23-#31` issue numbers)
3. **Static Analysis:** No linter configured, but TypeScript provides some checking
4. **Build Checks:** CI via GitHub Actions runs build checks on PRs (`ci.yml` referenced in CLAUDE.md)
5. **Content Validation:** Zod schemas validate frontmatter during build time

---

*Testing analysis: 2026-02-19*
