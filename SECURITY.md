# Subhan Care HMS — Security Audit

This document records the full secret-safety pass, the threats considered, and the mitigations applied.

## 1. Scope

Every file under `src/`, `supabase/`, `scripts/`, and the build config (Vite, package.json) was scanned for:

- Hardcoded API keys, tokens, passwords, JWT signing secrets, OAuth client secrets
- Database connection strings (Postgres, MongoDB, MySQL, Redis)
- Third-party service keys (Stripe, OpenAI, SendGrid, Twilio, AWS, Firebase, Supabase, Slack)
- Server-only secrets accidentally prefixed with `VITE_`, `NEXT_PUBLIC_`, or `REACT_APP_`
- `console.log` / error responses that print or return secrets
- `.env` exposure in git

## 2. Findings

| # | Severity | Finding | Resolution |
|---|----------|---------|------------|
| 1 | Low | `src/constants/roles.js` had 5 hardcoded demo accounts (email + password) used for the login-page role-pill shortcuts. | Removed. Demo credentials are now read from `VITE_DEMO_*` env vars (with a redacted `••••••••` placeholder if unset). The login page also masks the password (`maskPassword()`) so the rendered UI never reveals the value. |
| 2 | Info | `src/services/authService.js` had a `generateToken()` function returning a fake `subhan.<rand>.<time>` token. | Replaced with a real Supabase JWT when Supabase is configured; the local fallback still returns a fake token for the demo. |
| 3 | Info | `src/services/authService.js` returned a hardcoded `devCode: '147293'` in the password-reset flow. | Kept for the local-only fallback; not returned when Supabase is configured (it uses `resetPasswordForEmail` instead). |
| 4 | Info | `src/services/dataService.js` had an in-source comment promising "replace with real fetch() calls when the backend is ready". | Done — the data service now uses Supabase when `VITE_SUPABASE_URL` is set, otherwise falls back to localStorage. Public surface unchanged. |
| 5 | Low | No `.env.example` existed. | Added at repo root, documenting every variable the app reads, with comments explaining the Vite prefix rule. |
| 6 | Info | No automated secret scanner. | Added `scripts/check-secrets.sh` and wired it as a `prebuild` npm hook so every production build runs the scan. |

## 3. What was found but required no action

- **No `console.log` of sensitive data.** The original codebase never logged tokens, passwords, or connection strings.
- **No external API calls.** The frontend was already 100% local; no third-party service had been wired in.
- **No `NEXT_PUBLIC_*` or `REACT_APP_*` exposure.** We're on Vite, so the equivalent risk is the `VITE_` prefix. Only `VITE_DEMO_*` and `VITE_SUPABASE_*` exist, all public-safe.
- **No service-role keys anywhere.** The Supabase service-role key is mentioned in `.env.example` only as a server-side example (`SUPABASE_SERVICE_ROLE_KEY=...`), explicitly documented as never to be prefixed with `VITE_`.

## 4. Mitigations applied

1. **`isSupabaseConfigured()` gate** — `src/lib/supabase.js` only creates a real client when both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are present. Without them, the rest of the app silently uses localStorage.
2. **No `VITE_` prefix on server-side secrets** — every server-only variable in `.env.example` is unprefixed (`SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `OPENAI_API_KEY`, `JWT_SIGNING_SECRET`, etc.). Vite will not expose them to the bundle.
3. **Login-page credential masking** — even if `VITE_DEMO_*` env vars are set, the rendered UI shows `maskPassword()`, not the real value. The real values are only used internally when the user clicks a demo pill (to populate the form).
4. **`handle_new_user` trigger** — when a user signs up via Supabase, the database trigger auto-creates their `profiles` row with the right role. No role-injection bug possible from the client.
5. **Role-based RLS policies** — `supabase/rls.sql` enforces the role-permission matrix at the database level. Even a leaked anon key cannot read other roles' data.
6. **Service-role key isolation** — only the `anon` key is exposed to the client. Admin operations must run on a server (Supabase Edge Function, Next.js API route, etc.) using the `service_role` key from a non-`VITE_` env var.

## 5. Verified behavior

| Attack | Defense | How to verify |
|--------|---------|---------------|
| Attacker reads the JS bundle | Service-role key, DB URL, JWT secret all unprefixed → not in bundle | `grep -r "service_role" dist/` → 0 hits |
| Attacker signs in with a stolen anon key | RLS policies require `auth.uid()` and a matching `profiles.role` | Open Supabase SQL editor while signed out: `select * from patients` → 0 rows |
| Attacker injects a forged role via the meta-data | `handle_new_user` trigger validates the role against a whitelist | `update auth.users set raw_user_meta_data = jsonb_set(...)` → ignored, role inferred from email or default |
| Attacker walks past the login form via the dashboard URL | `AuthContext` checks for a Supabase session, not just a `localStorage` flag | Open `/dashboard` while signed out → redirected to login |
| Demo creds leak via screenshot | `maskPassword()` renders `••••••` in the pill row | View login page on staging → only masked values shown |

## 5a. Dependency vulnerability audit

`npm audit` history and resolution, most recent first:

- **react-router — GHSA-qwww-vcr4-c8h2 / CVE-2026-22030 family** ("RSC Mode CSRF Bypass" and related Framework-Mode CSRF advisories). Flagged against `react-router-dom@7.18.1` (the latest published version at time of writing — there is currently no patched release outside this range).
  **Assessed as not applicable to this app.** The advisory text is explicit: *"This does not impact applications that use Declarative Mode (`<BrowserRouter>`) or Data Mode (`createBrowserRouter`/`<RouterProvider>`)."* The vulnerable code path only exists in Framework Mode route `action`/`loader` handlers and the unstable RSC/Server Actions APIs. This app uses only `<BrowserRouter>` + `<Routes>`/`<Route>` (confirmed: `grep -rn "createBrowserRouter\|RouterProvider\|action:\|loader:" src/` → 0 matches). No server-side route actions exist anywhere in this codebase — every write goes through `dataService.js` calling Supabase directly from client components.
  Downgrading to dodge this npm-audit flag would reintroduce the previously-fixed open-redirect/deserialization CVEs from the 6.x/early-7.x line, which is a strictly worse trade. **Decision: stay on 7.18.1, re-run `npm audit` after each dependency bump, revisit if this app ever adopts Framework Mode, `createBrowserRouter`, or route actions.**
- **esbuild (via Vite 5) — moderate, dev-server-only.** Fixed by upgrading to Vite 8 (`@vitejs/plugin-react` bumped to 6.x for compatibility). `vite.config.js`'s `manualChunks` was converted from an object to a function for compatibility with Vite 8's Rolldown-based build engine; the old `esbuild.drop` console-stripping option (no longer supported under Vite 8) was replaced with explicit `import.meta.env.DEV` guards around every `console.*` call in the app instead — bundler-independent by design.
- **react-router-dom 6.x — moderate, open redirect + SSR deserialization.** Fixed by upgrading to 7.18.1, the first version with both CVEs patched (no fix exists anywhere in the 6.x line).

Run `npm audit` yourself before every deploy — this table will go stale as new advisories are published.

## 6. Rotation checklist (before going live)

If you ever had hardcoded credentials in git history (or suspect you did), treat them as compromised. Rotate in this order:

- [ ] **Supabase `service_role` key** — Supabase dashboard → Project Settings → API → **Roll anon/service keys**.
- [ ] **Supabase `anon` key** — rolled in the same step.
- [ ] **Database password** — Supabase dashboard → Project Settings → Database → **Reset password**.
- [ ] **JWT signing secret** — Supabase dashboard → Project Settings → API → **JWT Secret** → Generate new.
- [ ] **All 5 demo user passwords** — either re-run `seed.sql` with new values, or rotate them via the dashboard.
- [ ] **Any Stripe / OpenAI / SendGrid / Twilio / AWS keys** — roll in the respective dashboards.
- [ ] **Update `.env`** locally and in your hosting platform (Vercel, Netlify, etc.).
- [ ] **Rebuild and redeploy** so the new env vars are baked into the bundle.
- [ ] **Re-run `npm run scan:secrets`** to confirm no old values leaked into a previous build artifact.

## 7. Continuous protection

- `npm run build` always runs `scan:secrets` first (via the `prebuild` hook).
- The scanner is regex-based and covers 8 common secret patterns. Add new patterns to `scripts/check-secrets.sh` as needed.
- CI can run `npm run lint && npm run scan:secrets && npm run build` as a single step.

## 8. Limitations

- The scanner is regex-based and **can be defeated by an attacker who splits the pattern across lines or uses string concatenation**. For higher assurance, integrate a tool like [`gitleaks`](https://github.com/gitleaks/gitleaks) or [`trufflehog`](https://github.com/trufflesecurity/trufflehog) in CI.
- The scanner only checks the working tree, not git history. A committed secret stays in `.git/objects/` until the history is rewritten with `git filter-repo`.
- RLS policies in `supabase/rls.sql` are role-based, not row-based. A doctor can see *all* patients, not just their own. Tighten with `(patient_id in (select id from patients where assigned_doctor = auth.uid()))` if that's a requirement.
