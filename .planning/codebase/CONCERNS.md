# Codebase Concerns

**Analysis Date:** 2026-02-19

## Synchronisation Burden

**Tag Taxonomy Duplication:**
- Issue: Tag definitions are duplicated across three files for compatibility with .mjs scripts
- Files: `src/utils/tags.ts` (source of truth), `scripts/lib/cli-utils.mjs` (TAG_CATEGORIES, VALID_TAGS), `scripts/ingest.mjs` (TAG_KEYWORDS)
- Impact: Risk of drift when modifying tags. Adding/removing tags requires changes in three locations. Easy to miss updates during refactoring.
- Fix approach: Create a shared tag configuration file (e.g., `config/tags.json`) that both TypeScript and Node.js scripts can import, eliminating the need for manual sync.

## Fragile Data Synchronisation

**GitHub Activity Workflow Robustness:**
- Issue: Complex shell/jq-based GitHub data fetch in `.github/workflows/fetch-github.yml` (370 lines) has multiple failure points with limited recovery
- Files: `.github/workflows/fetch-github.yml`
- Why fragile:
  - Multiple curl requests without complete retry logic on all endpoints (only push commit has full comparison retry)
  - jq transformation chains that fail silently if intermediate API responses change
  - Date calculation fallback uses `1970-01-01` as silent fallback (line 255, 259)
  - GraphQL query returns sparse data on network failure with warning but continues anyway (line 60)
  - Events pagination stops early if a single page fails, losing recent activity
- Safe modification: Add structured logging before each API call, implement circuit breaker for cascading failures, validate response schemas before transformation

**Data Import Failures:**
- Issue: If GitHub data JSON is corrupted or missing, page silently falls back to empty state
- Files: `src/pages/code/index.astro` (lines 15-21)
- Risk: Users see "Coming soon" message when data _should_ be present but fetch failed. No visibility into why data is missing.
- Workaround: Check dev console for error logging

**Race Condition in Slug Generation:**
- Issue: `scripts/lib/cli-utils.mjs:34` notes race condition is acceptable but not mitigated
- Files: `scripts/lib/cli-utils.mjs`, `scripts/ingest.mjs`
- Risk: If multiple concurrent ingest commands run, slug collision possible. Interactive CLI mitigates, but not guaranteed.
- Fix approach: File lock or atomic write with conflict detection

## Timezone Handling

**Date Calculations Use System Timezone Inconsistently:**
- Issue: GitHub workflow uses UTC via `date -u` flags but JavaScript `new Date()` uses local timezone
- Files: `.github/workflows/fetch-github.yml` (lines 235-251), `src/components/Timeline.astro` (line 19), multiple date comparisons
- Impact: Streak calculation may be off by a day at timezone boundaries. Contribution counts in "this week" may vary by ±1 depending on server TZ.
- Fix approach: Standardize all date calculations to UTC. Pass ISO strings (already done) but ensure all comparisons use `Date.UTC()` or explicit timezone handling.

## Missing Error Recovery

**Wikilink Conversion Warnings Only:**
- Issue: Unresolved wikilinks during ingest log warnings but continue (line 113 in cli-utils.mjs)
- Files: `scripts/lib/cli-utils.mjs`
- Risk: Silent failures. User may not notice malformed links in published post until viewing.
- Fix approach: Collect warnings and display summary before writing. Let user fix and retry.

**HTML/Markdown Stripping Uses Regex:**
- Issue: Reading time calculation strips HTML via regex loop (src/utils/reading-time.ts:9-15), not HTML parser
- Files: `src/utils/reading-time.ts`
- Risk: Pathological inputs (nested tags, broken markup) could cause infinite loops or inaccurate counts. Crafted HTML like `<scr<script>ipt>` is handled but complex real-world markup may not be.
- Fix approach: Switch to an HTML parser library (cheerio, jsdom) instead of regex.

## Test Coverage

**No Automated Tests:**
- Issue: No test files found in project
- Files: None (testing directory absent)
- Risk: Regressions in critical paths (date formatting, tag validation, GitHub data parsing) go undetected. Data workflow failures not caught before production.
- Priority: High
- Recommendation: Add tests for:
  - Tag validation and slug collision detection (`scripts/lib/cli-utils.mjs`)
  - GitHub data parsing and fallback behavior (`src/utils/github.ts`)
  - Date calculations across timezones (`src/utils/format.ts`, `src/components/Timeline.astro`)
  - Reading time calculation edge cases (`src/utils/reading-time.ts`)

## External Dependency Risk

**React Activity Calendar Dependency:**
- Issue: Heatmap visualization depends on `react-activity-calendar@3.1.1` (in package.json)
- Files: `src/components/ContributionHeatmap.tsx`, `src/components/ContributionHeatmap.astro`
- Risk: Component has inline hardcoded colours that must match design system. If library changes API or styling, visual regression likely.
- Mitigation: Colours duplicated in theme object (line 13-15 in ContributionHeatmap.tsx). Update process unclear when upgrading.
- Recommendation: Lock to exact version or create colour sync check in CI.

**Astro 5.x Bleeding Edge:**
- Issue: Using Astro 5.17.1 (very recent major version)
- Impact: May have undiscovered bugs. Breaking changes possible in patch releases.
- Recommendation: Monitor Astro releases monthly, test before upgrading.

## Build Pipeline Gaps

**Pagefind Integration Brittle:**
- Issue: `npm run build` includes pagefind (line 8 in package.json: `astro build && npx pagefind --site dist`)
- Files: `package.json`
- Risk: If Astro build succeeds but pagefind fails, site deploys without search (silent failure). No verification that search indices are generated.
- Fix approach: Add check that pagefind generates expected index files before marking build as success.

**Prebuild Script Cleanup:**
- Issue: `scripts/prebuild-clean.js` removes CLAUDE.md files from subdirectories to work around upstream bug
- Files: `scripts/prebuild-clean.js` (references https://github.com/thedotmack/claude-mem/issues/760)
- Risk: Upstream fix could make this script redundant, or plugin could break in unexpected ways. Script runs on every build.
- Fix approach: Monitor upstream issue. Once fixed, remove script and update node version if needed.

## Data Stale State

**GitHub Data Update Interval:**
- Issue: Daily fetch scheduled at 3:17 AM UTC (line 5 in fetch-github.yml) but site shows `lastUpdated` timestamp
- Impact: Data can be up to 24 hours stale. Users in different timezones may see "last updated X hours ago" even if data is actually 23 hours old.
- Recommendation: Consider more frequent fetches (hourly or on workflow_dispatch) or clarify update SLA in UI.

**Listening/Reading/Watching Data:**
- Issue: Similar scheduled updates for `reading.json`, `listening.json`, `watching.json`
- Files: `.github/workflows/fetch-*.yml`
- Risk: If external APIs (Goodreads, ListenBrainz, etc.) go down during scheduled fetch, stale data silently used. No alerting mechanism.
- Recommendation: Add timestamp check in components to warn if data is >48h old.

## Performance Concerns

**Contribution Heatmap Client-Side Render:**
- Issue: React component `ContributionHeatmap.tsx` uses `client:visible` directive
- Files: `src/components/ContributionHeatmap.astro`
- Risk: React bundle included for every page with `code` route. Heatmap is visualisation-only, could be pure HTML/CSS.
- Impact: Extra JavaScript payload when heatmap not in viewport.
- Recommendation: Evaluate pure SVG/HTML alternative or lazy-load React only if needed.

**Date Parsing on Every Render:**
- Issue: Format utilities call `new Date()` for every rendered item without caching
- Files: `src/utils/format.ts`, `src/components/Timeline.astro`
- Risk: Relative time strings update dynamically. On high-traffic pages, repeated date parsing adds up. Not a bottleneck yet but poor pattern.
- Recommendation: Consider server-side date calculation or static time strings with caveat "as of [date]".

## Operational Risk

**GitHub PAT Rotation:**
- Issue: Workflow uses `secrets.GH_PAT || secrets.GITHUB_TOKEN` fallback
- Files: `.github/workflows/fetch-github.yml` (line 24)
- Risk: If GH_PAT expires or is revoked, workflow silently falls back to GITHUB_TOKEN (limited permissions). Contributor activity may become sparse.
- Fix approach: Add warning to workflow if both secrets missing. Document PAT setup in README.

**No Deployment Rollback Plan:**
- Issue: Scheduled workflows commit data directly to main branch
- Files: `.github/workflows/fetch-*.yml` (lines 345-369 in fetch-github.yml)
- Risk: If corrupted data is fetched, it's committed immediately. Manual rollback needed.
- Recommendation: Validate data schema before commit. Consider merge to `data/` branch for review before auto-merge.

## Content Slug Collisions

**Slug Generation Logic:**
- Issue: `slugify()` function in cli-utils.mjs (lines 8-13) lowercases and removes special chars
- Files: `scripts/lib/cli-utils.mjs`
- Risk: Different titles can produce same slug. Example: "Hello World" and "hello-world" both → "hello-world".
- Safeguard: Collision detection exists (line 290 in ingest.mjs) but user must manually fix. Easy to miss if user is rushed.
- Recommendation: Automatically append suffix during ingest for true conflicts (not just "use manual slug").

## Documentation Gaps

**Ingest Script Assumptions:**
- Issue: Ingest script assumes Obsidian vault exists at `~/notes/gVault/02-AREAS/writing/drafts/`
- Files: `scripts/ingest.mjs` (lines 29-36)
- Risk: Users without this vault structure get cryptic error. Not well documented in README or script help text.
- Fix approach: Add error message explaining expected vault structure if path missing.

**Schema Validation vs Enforcement:**
- Issue: Content schema in `src/content/config.ts` defines constraints (max 100 chars for title, 1-4 tags) but ingest script has its own validation
- Files: `src/content/config.ts`, `scripts/ingest.mjs`
- Risk: Validation logic duplicated. If schema changes, script may allow invalid content.
- Fix approach: Generate script validation from schema via shared config or build-time validation.

---

*Concerns audit: 2026-02-19*
