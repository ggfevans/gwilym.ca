# github-json-bourne

## What This Is

A standalone, reusable GitHub Action that fetches GitHub profile data (contributions, heatmap calendar, streak, recent activity, repositories) and outputs clean, validated JSON. Extracted from gwilym.ca's inline workflow, published to GitHub Marketplace for anyone to use. The gwilym.ca site consumes the Action's output to render its `/code` page.

## Core Value

The Action reliably produces clean, schema-validated GitHub activity JSON on every run — no silent failures, no platform-specific fragility.

## Requirements

### Validated

<!-- Existing capabilities in gwilym.ca that work today -->

- ✓ Contribution stats (total, commits, PRs, reviews, issues) — existing workflow
- ✓ 52-week contribution calendar with level mapping (NONE→0, FOURTH_QUARTILE→4) — existing workflow
- ✓ Streak tracking (current, longest, today) — existing workflow
- ✓ Recent activity feed (commits, PRs, issues — up to 30) — existing workflow
- ✓ Top repositories with language metadata and colours — existing workflow
- ✓ Weekly/monthly stats (commits, contributions, active repos) — existing workflow
- ✓ JSON output to `src/data/github.json` — existing workflow
- ✓ Graceful fallback to empty data on failure — `src/utils/github.ts`
- ✓ TypeScript type definitions for all data shapes — `src/utils/github.ts`
- ✓ ActivityTimeline component renders recent activity — `src/components/ActivityTimeline.astro`
- ✓ ContributionHeatmap renders calendar data — `src/components/ContributionHeatmap.astro/.tsx`
- ✓ CodeWidget dashboard on `/code` page — `src/pages/code/index.astro`

### Active

<!-- New work for this project -->

- [ ] Extract fetch logic into standalone GitHub Action (`github-json-bourne`)
- [ ] Rewrite in Node.js using `@octokit/graphql` and `@actions/core`
- [ ] Replace platform-specific `date` commands with native JS Date
- [ ] Eliminate N+1 API calls for commit details (batch or use GraphQL)
- [ ] Add JSON schema validation before output
- [ ] Configurable inputs (username, output path, max repos, max activities)
- [ ] Update gwilym.ca workflow to consume the Action
- [ ] Enhance ActivityTimeline visual polish
- [ ] Enhance ContributionHeatmap integration
- [ ] Publish to GitHub Marketplace with README and example workflow
- [ ] Add comprehensive docs (README, CONTRIBUTING, example workflow)

### Out of Scope

- Private repository data — Action uses public events API, keep it simple
- Historical data beyond GitHub's 1-year contribution window — API limitation
- Real-time/webhook-based updates — static site, daily cron is fine
- Authentication providers beyond GitHub PAT — unnecessary complexity
- Web UI or dashboard for the Action itself — it's a CLI/CI tool

## Context

- gwilym.ca is an Astro 5.x static site deployed on Cloudflare Pages
- The current fetch logic is a ~350-line bash script inline in `.github/workflows/fetch-github.yml`
- It uses `curl` + `jq` for GraphQL and REST calls, platform-specific `date -d` / `date -v` fallbacks
- The N+1 problem: for each PushEvent, it calls the compare API to get individual commits
- The user already has experience publishing GitHub Actions (listenbrainz-github-action, trakt-github-action, hardcover-github-action) — all currently shell-based
- The `src/utils/github.ts` file already has TypeScript interfaces and a `parseGitHubData()` validator
- Components: `ActivityTimeline.astro`, `ContributionHeatmap.astro` (wrapper), `ContributionHeatmap.tsx` (React island using `react-activity-calendar`)

## Constraints

- **Separate repo**: Action lives in its own repo (`github-json-bourne`), not inside gwilym.ca
- **Node.js**: Action written in JavaScript/Node using `@actions/core`, `@actions/github`, `@octokit/graphql`
- **Backward compatible output**: JSON schema must match current `src/utils/github.ts` interfaces exactly — no breaking changes to consuming components
- **GitHub Actions runtime**: Must work on `ubuntu-latest` runners with Node 20
- **Token permissions**: Works with default `GITHUB_TOKEN` (public data) and optionally `GH_PAT` (private contributions)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Separate repo for Action | Enables Marketplace publishing, independent versioning, reuse | — Pending |
| Node.js over shell | Fixes date portability, enables proper error handling, standard for Actions | — Pending |
| Maintain JSON schema compatibility | Existing components depend on current data shape | — Pending |
| GraphQL for contributions + REST for events | GraphQL handles contributions efficiently; events API is REST-only | — Pending |

---
*Last updated: 2026-02-20 after initialization*
