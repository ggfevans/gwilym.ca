# External Integrations

**Analysis Date:** 2026-02-19

## APIs & External Services

**GitHub:**
- Service: GitHub API (GraphQL + REST endpoints)
- What it's used for: Fetch contribution activity, commit history, PR/issue activities, repository metadata
- Frequency: Daily scheduled via `fetch-github.yml` (3:17 AM UTC)
- Auth: `GH_PAT` (Personal Access Token) via `secrets.GH_PAT`, falls back to `secrets.GITHUB_TOKEN`
- Endpoints:
  - GraphQL: `https://api.github.com/graphql` - Contributions and calendar data
  - REST: `https://api.github.com/users/{username}/events` - Activity stream
  - REST: `https://api.github.com/repos/{owner}/{repo}/compare/{before}...{head}` - Commit details
  - REST: `https://api.github.com/users/{username}/repos` - Repository metadata
- Output: `src/data/github.json` (committed to git after fetch)
- Component integration: `src/components/ContributionHeatmap.tsx` visualizes calendar data

**Hardcover (Book Reading Tracking):**
- Service: Hardcover.app (third-party book tracking platform)
- What it's used for: Fetch reading list (currently reading, finished books)
- Frequency: Daily scheduled via `fetch-reading.yml` (00:00 UTC)
- Auth: `HARDCOVER_TOKEN` and `HARDCOVER_USER_ID` via GitHub Actions secrets
- Implementation: GitHub Action `ggfevans/hardcover-github-action@f68d44fb791e471a33a52f04f61052faa8654cb4` (v1)
- Output: `src/data/reading.json` (committed to git after fetch)
- Data structure: `currentlyReading` array, `finished` array with title, author, cover URL, hardcover link

**ListenBrainz (Music Listening History):**
- Service: ListenBrainz (open-source music database and listening tracker)
- What it's used for: Fetch music listening activity and top artists/albums
- Frequency: Daily scheduled via `fetch-listening.yml` (2:17 AM UTC)
- Auth: `LISTENBRAINZ_USERNAME` via GitHub Actions secrets
- Implementation: GitHub Action `ggfevans/listenbrainz-json-bourne@92fefbb946f1be36055443eac666c9cda3ae7cf0` (v2)
- Config: `stats_range: this_month`, `top_count: 10`, `recent_count: 10`
- Output: `src/data/listening.json` (committed to git after fetch, conditional on `changes_detected`)

**Trakt + TMDB (Movie/Show Watching):**
- Services: Trakt (entertainment tracking), TMDB (The Movie Database - metadata provider)
- What it's used for: Fetch movie/TV show watch history and metadata
- Frequency: Daily scheduled via `fetch-watching.yml` (00:00 UTC)
- Auth: `TRAKT_CLIENT_ID` and `TMDB_API_KEY` via GitHub Actions secrets
- Trakt username: hardcoded as 'gvns'
- Implementation: GitHub Action `ggfevans/trakt-github-action@2afb54d241c5212ee3c35c0cd2400fd35db0ca72` (main branch)
- Output: `src/data/watching.json` (committed to git after fetch)

## Data Storage

**Databases:**
- Not used - Static site with no backend database

**File Storage:**
- Local filesystem (committed to git):
  - `src/data/github.json` - GitHub activity and contributions
  - `src/data/listening.json` - Music listening history
  - `src/data/reading.json` - Book reading list
  - `src/data/watching.json` - Movie/TV watch history
  - `src/data/timeline.yaml` - Static timeline data
  - `src/content/writing/` - Blog post markdown files (organized by date YYYY/MM/)
  - `src/content/work/` - Project showcase markdown files

**Caching:**
- None - Static site generation at build time

## Authentication & Identity

**Auth Provider:**
- Custom/None for site visitors - No authentication system
- Site identity: JSON-LD structured data in `src/utils/json-ld.ts` with sameAs: https://github.com/ggfevans
- GitHub Actions: Uses GitHub-provided `GITHUB_TOKEN` and optional `GH_PAT` for increased API quota

## Monitoring & Observability

**Error Tracking:**
- Not detected - No Sentry, Rollbar, or similar integration

**Logs:**
- GitHub Actions job logs (visible via GitHub UI)
- Build logs via Cloudflare Pages dashboard

**Analytics:**
- Not detected - Umami was previously removed (per CLAUDE.md notes)

## Hosting & Deployment

**Hosting:**
- Cloudflare Pages (free tier)
- Domain: `gvns.ca` (DNS via Cloudflare)
- CDN: Cloudflare's global edge network
- Auto-deploy: On push to `main` branch via native GitHub integration (no Actions needed)
- Preview deploys: Automatic on all PRs with unique URLs

**CI Pipeline:**
- GitHub Actions - Minimal CI
  - Trigger: Pull requests to `main`
  - Steps: Checkout → Setup Node 20 → npm ci → npm run build
  - Workflow file: `.github/workflows/ci.yml`
- No custom deploy action - Cloudflare Pages handles deployments directly

## Environment Configuration

**Required env vars (GitHub Actions Secrets):**
- `GH_PAT` (optional) - GitHub Personal Access Token for increased API rate limits; falls back to auto-provided `GITHUB_TOKEN`
- `HARDCOVER_TOKEN` - Hardcover API authentication (currently unused but configured)
- `HARDCOVER_USER_ID` - Hardcover user ID (currently unused but configured)
- `LISTENBRAINZ_USERNAME` - ListenBrainz username for fetch-listening workflow
- `TRAKT_CLIENT_ID` - Trakt API client ID for fetch-watching workflow
- `TMDB_API_KEY` - The Movie Database API key for fetch-watching workflow

**Non-secret environment variables:**
- `GH_USER`: Derived from `github.repository_owner` in fetch-github.yml
- `NODE_VERSION`: Set to 20 in `.nvmrc`
- Cloudflare Pages: Auto-reads `.nvmrc` for Node version selection

**Secrets location:**
- GitHub repository Settings → Secrets and variables → Actions
- Not stored in `.env` files (which are git-ignored)
- Cloudflare Pages has NO direct access to GitHub secrets; data flows through Actions → commit → push

## Webhooks & Callbacks

**Incoming:**
- None detected - This is a static site with no API endpoints

**Outgoing:**
- GitHub Actions workflow triggers on: schedule (cron), workflow_dispatch (manual)
- Data fetch workflows commit results and push to GitHub (creating a new commit event)
- Cloudflare Pages listens to GitHub pushes via native integration

## Build & Post-Build Processing

**Build Pipeline:**
1. `npm ci` - Clean install dependencies
2. `npm run prebuild` - Run `scripts/prebuild-clean.js` (cleanup task)
3. `astro build` - Build static site to `dist/`
4. `npx pagefind --site dist` - Generate search index from built HTML
5. Cloudflare Pages serves `dist/` contents

**Content Processing:**
- Markdown → HTML: Astro's built-in processor with Shiki syntax highlighting
- Frontmatter parsing: Zod schema validation (see `src/content/config.ts`)
- RSS generation: `src/pages/rss.xml.ts` uses @astrojs/rss
- Sitemap generation: @astrojs/sitemap generates XML

## External GitHub Actions Used

Custom GitHub Actions by repository owner (ggfevans):
- `ggfevans/hardcover-github-action@f68d44fb791e471a33a52f04f61052faa8654cb4`
- `ggfevans/listenbrainz-json-bourne@92fefbb946f1be36055443eac666c9cda3ae7cf0`
- `ggfevans/trakt-github-action@2afb54d241c5212ee3c35c0cd2400fd35db0ca72`

Standard GitHub Actions:
- `actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd` (v6)
- `actions/setup-node@6044e13b5dc448c55e2357c09f80417699197238` (v6)

---

*Integration audit: 2026-02-19*
