# Maharashtra Fort Explorer

A map-first field guide to 237 forts across Maharashtra, with 37 source-checked
profiles, bilingual English/Marathi content, trek circuits, a sourced timeline
and offline browsing. It grew out of the original Folium notebook map, which is
still shipped as a static comparison page at `/legacy/folium-map.html`.

## Stack

- Next.js 16 (App Router, Cache Components/PPR) and React 19
- TypeScript, Tailwind CSS v4, shadcn-style Radix primitives
- Leaflet + React Leaflet with OpenStreetMap tiles, marker clustering and
  optional topographic/satellite layers
- Optional Supabase/PostgreSQL for accounts and synced favorites
- Static dataset generated from the original community fort list, district
  boundary geometry and Wikimedia/Wikipedia sources

The app works without any backend: the catalogue is prebuilt, favorites live in
localStorage, and pages are prerendered.

## Source layout

```
src/app/            App Router pages, layout, metadata routes, global styles
src/components/     auth, common, explorer, favorites, fort, layout, providers, pwa, ui
src/content/        editorial trek circuits and timeline events
src/data/           generated dataset consumed by the app
src/lib/            fort accessors, geo helpers, formatting, i18n
src/services/       browser Supabase client
src/types/          fort, district, circuit and timeline types
scripts/data/       dataset build, Wikipedia fetch and image download scripts
scripts/db/         idempotent Supabase seed
supabase/           database migration and RLS policies
data/               raw, curated and geographic pipeline inputs
public/             runtime assets, PWA worker and the served Folium page
docs/legacy/        original Folium notebook and source CSV
```

The original notebook still reads `forts.csv` from its own directory, so it can
be run from `docs/legacy/` without changes.

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
```

Production:

```bash
npm run build
npm start
```

Useful scripts:

| Script | Purpose |
| --- | --- |
| `npm run lint` | ESLint (React hooks + Next rules) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run data:build` | Rebuild `src/data/*.generated.json` from `data/` inputs |
| `npm run data:wiki` | Refresh Wikipedia summaries for curated forts |
| `npm run data:images` | Download licensed Commons images into `public/images/forts` |
| `npm run db:seed` | Seed Supabase with the generated dataset (server-only key) |

## Environment

Copy `.env.example` to `.env.local`. Everything is optional; without Supabase
the app runs in local-only mode.

| Variable | Scope | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | browser + server | Canonical origin used by metadata, sitemap and robots. Set this in production. |
| `NEXT_PUBLIC_SUPABASE_URL` | browser | Project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | browser | Only the anon key may be exposed to the client. RLS enforces access. |
| `SUPABASE_SERVICE_ROLE_KEY` | scripts only | Used by `npm run db:seed`. Never prefix with `NEXT_PUBLIC_` and never import it into app code. |

## Data and verification

`data/` holds the inputs: the original fort catalogue, curated profile JSON with
sources and review dates, and district GeoJSON. `npm run data:build` cleans the
records, assigns each fort to a district using point-in-polygon with a
nearest-boundary fallback, and writes `src/data/*.generated.json`.

Each record is labelled in the UI:

- **Reviewed profile** (`profileStatus: curated`) — bilingual history, access,
  trek difficulty, season, photograph, sources and a review date.
- **Catalogue record** — only a verified name, coordinate and district are
  claimed. Everything else shows as "Not recorded".
- **Location status** — `inside`, `nearest-boundary`, or `flagged` for disputed
  coordinates. Flagged forts are drawn with a dashed ring, excluded from routing
  guidance and can be hidden with a filter.

Coordinates and historical text come from the linked sources; nothing is
generated at request time.

## Supabase (optional)

1. Create a project and apply `supabase/migrations/0001_init.sql` (SQL editor or
   `supabase db push`).
2. Set the three Supabase variables in `.env.local`.
3. Run `npm run db:seed` with the service-role key present. The seed is
   idempotent: it upserts on natural slugs and never deletes rows.

Schema: `districts`, `categories`, `forts`, `fort_images`, `fort_sources`,
`profiles`, `favorites`, `circuits`, `circuit_forts`, `timeline_events`.

RLS is enabled on every table. The catalogue tables are publicly readable;
`profiles` and `favorites` are restricted to their owner (`auth.uid()`), and
writes require an authenticated user. Bounds/status checks validate coordinates,
elevation and enums at the database level.

Auth uses Supabase magic links. The UI degrades cleanly when Supabase is not
configured: favorites stay on the device and the account button is hidden.

## Deployment

The app is a standard Next.js deployment (Vercel recommended). The full
runbook — environment matrix, GitHub/Vercel setup, custom domains and HTTPS,
Supabase, error monitoring, rollback and a post-deploy checklist — lives in
[`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

- Set `NEXT_PUBLIC_SITE_URL` to the public origin so `sitemap.xml`, `robots.txt`
  and Open Graph URLs are correct.
- Add the Supabase variables if using accounts; the anon key is the only one
  that belongs in the hosting dashboard.
- If you use auth, add the deployment URL to Supabase Auth redirect URLs.
- `sitemap.xml` is generated on demand; all fort pages are prerendered at build.
- `npm run verify` runs typecheck, lint and a production build before deploying.

## Developer

Designed and built by **Darshan** — [portfolio](https://darshan-gaikwad-portfolio.vercel.app/).
Project details, the technology stack and developer information are available in
the app at `/about`.

© Maharashtra Fort Explorer. All rights reserved. Fort data and photographs are
credited on each profile; map data © OpenStreetMap contributors.

## Offline and PWA

`public/sw.js` registers from `src/components/pwa/pwa-register.tsx`. Navigations
are network-first with a cached-shell fallback, static assets are cache-first,
and `/offline` is served when a page has never been cached. Favorites remain
available offline because they are stored locally.

## Known limitations

- The 200 catalogue-only forts do not have reviewed history, difficulty, season
  or photographs yet.
- Five disputed coordinates need field or archival verification.
- Cloud favorites require a configured Supabase project; this repository ships
  without credentials so that path is untested here.
- There is no multi-fort itinerary builder yet; circuits and per-fort nearby
  lists cover the current planning needs.
