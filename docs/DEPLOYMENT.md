# Deployment guide

Maharashtra Fort Explorer is a standard Next.js 16 application. The catalogue is
a prebuilt static dataset, so the site runs without a backend; Supabase is
optional and only needed for accounts and synced favorites.

- **Recommended host:** Vercel (same platform as the project's portfolio).
  Any Node 20+ host that supports `next build` / `next start` also works.
- **Database:** Supabase/PostgreSQL, optional.
- **Domain:** a Vercel `*.vercel.app` URL is issued automatically with HTTPS.
  A custom domain is optional and must be added by the account owner.

## 1. Environment variables

Copy `.env.example` to `.env.local` for local runs. Production values are set in
the hosting dashboard (Vercel → Project → Settings → Environment Variables), not
committed to Git.

| Variable | Scope | Required | Notes |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | browser + server | Production | Canonical origin, e.g. `https://your-project.vercel.app`. Used by metadata, `robots.txt` and `sitemap.xml`. |
| `NEXT_PUBLIC_SUPABASE_URL` | browser | Optional | Project URL. Leave blank to run local-only favorites. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | browser | Optional | Only the anon key may reach the client. RLS enforces access. |
| `SUPABASE_SERVICE_ROLE_KEY` | scripts only | Seed only | Used by `npm run db:seed`. Never add it to the site's runtime environment. |

Rules:

- Anything prefixed `NEXT_PUBLIC_` is embedded in the browser bundle.
- The service-role key bypasses RLS. Keep it local or in a CI secret used only by
  the seed job.
- If a service-role key is ever exposed, rotate it in Supabase immediately.

## 2. Verify locally before deploying

```bash
npm ci
npm run verify        # typecheck + lint + production build
npm start             # serves the production build on :3000
```

`npm run verify` must pass with no TypeScript or ESLint errors before a deploy.

## 3. GitHub

The repository is published from the project root:

```bash
git add -A
git commit -m "Prepare production deployment"
git push origin main
```

No secrets belong in the repository. `.env*.local`, `node_modules`, `.next` and
build metadata are ignored by `.gitignore`.

## 4. Deploy to Vercel

1. Import the GitHub repository at <https://vercel.com/new>.
2. Framework preset: **Next.js** (auto-detected).
3. Build command `npm run build`, install command `npm ci`, output handled by
   Next.js automatically.
4. Add `NEXT_PUBLIC_SITE_URL` for Production (and Preview if desired) with the
   final origin.
5. Deploy. Every push to `main` produces a production deployment; pull requests
   produce preview URLs.

CLI alternative (requires an authenticated Vercel CLI):

```bash
npm i -g vercel        # once
vercel link            # link the local folder to the project
vercel --prod          # deploy
```

The repository also exposes `npm run deploy:preview` and `npm run deploy:prod`.

## 5. Domain and HTTPS

- Vercel provisions `https://<project>.vercel.app` with a managed certificate.
- Custom domain: Project → Settings → Domains → Add. Point the DNS records Vercel
  shows (apex `A` record or `CNAME` for `www`), then wait for the certificate to
  issue. HTTPS redirects are automatic.
- After changing the domain, update `NEXT_PUBLIC_SITE_URL` and redeploy so
  canonical links, Open Graph URLs and `sitemap.xml` match.

## 6. Supabase (optional)

1. Create a project, then apply `supabase/migrations/0001_init.sql` in the SQL
   editor (or `supabase db push`).
2. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel.
3. Seed the catalogue from a trusted machine:

   ```bash
   # .env.local with the service-role key (never in Vercel runtime)
   npm run db:seed
   ```

4. Auth → URL Configuration: set the site URL and add
   `https://<your-domain>/` to the redirect allow-list for magic links.
5. Security checks (read-only): confirm RLS is enabled on every table and that
   `favorites` policies are scoped to `auth.uid()`. The migration enables RLS and
   grants catalogue tables `select` only.

Without these variables the app still works: favorites stay in `localStorage`,
the account button is hidden, and no request leaves the browser.

## 7. Error monitoring

- `src/instrumentation.ts` exports `onRequestError`, which writes one structured
  JSON line per server error to stdout/stderr. Vercel captures these in
  **Deployments → Logs** and can forward them to a log drain.
- React render errors are caught by `src/app/error.tsx` (route level) and
  `src/app/global-error.tsx` (root layout), both of which log to the browser
  console and show a recovery action.
- Vercel's own deployment and function dashboards cover availability and latency.
  For alerting, add a log drain or an error-tracking integration in the Vercel
  dashboard; no client-side DSN is committed to this repository.
- Uptime: point an external monitor at `/` and `/forts/rajgad-fort`.

## 8. Rollback

- Vercel keeps every deployment: **Deployments → … → Promote** an earlier
  production build, or use "Instant Rollback".
- Code rollback: `git revert <commit>` and push; Vercel redeploys `main`.
- Database changes are not part of the site deploy. The seed script is
  idempotent (upserts, never deletes); review any schema migration before
  applying it to a production project.

## 9. Post-deploy checklist

```bash
curl -I https://<domain>/                      # 200, security headers, HTTPS
curl -s https://<domain>/robots.txt            # sitemap URL uses the domain
curl -s https://<domain>/sitemap.xml | head    # canonical URLs
curl -sI https://<domain>/sw.js                # no-cache service worker
```

Then verify in a browser: map loads tiles, search and filters work, a fort
profile deep link opens, favorites persist after reload, language switch works,
and `/about` shows the developer section and portfolio link.

## 10. Known limitations

- Catalogue-only forts have no reviewed history or photographs yet.
- Five coordinates are flagged as disputed and excluded from routing guidance.
- Cloud favorites require a configured Supabase project; this repository ships
  without credentials, so that path is unverified until Supabase is set up.
