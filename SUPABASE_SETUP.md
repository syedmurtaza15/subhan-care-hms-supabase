# Subhan Care HMS — Supabase Setup

The Subhan Care HMS frontend supports two modes out of the box:

| Mode | When | What it does |
|------|------|--------------|
| **Local demo** | No env vars set | Persists to `localStorage`, accepts any email + 6+ char password |
| **Supabase** | `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` set | Real Postgres + Auth + RLS |

This guide walks you through going live with Supabase.

---

## 1. Create the Supabase project

1. Go to [supabase.com](https://supabase.com/dashboard) and sign in.
2. **New project** → pick a name (e.g. `subhan-care-hms`), a region close to your users, and a strong database password.
3. Wait for the project to provision (~2 minutes).

## 2. Run the SQL migrations

Open **SQL Editor** in the Supabase dashboard and run these files **in order**:

1. `supabase/schema.sql` — creates the 9 tables, indexes, the `updated_at` trigger, and the `handle_new_user` trigger that auto-creates a profile row when someone signs up.
2. `supabase/rls.sql` — enables Row Level Security on every table and installs the role-permission policies.
3. `supabase/seed.sql` — seeds **app data only**: 6 patients, 4 doctors, 7 appointments, 4 prescriptions, 10 inventory items, 4 invoices, 3 staff, 6 medical-history entries. It does **not** create login accounts (see step 5).

You can paste each file's contents into the SQL editor and click **Run**. They are idempotent — re-running won't break anything.

## 3. Get the API keys

In the Supabase dashboard:

- **Project Settings** → **API**
- Copy:
  - **Project URL** — looks like `https://abcdefghijk.supabase.co`
  - **Project API keys → `anon` `public`** — starts with `eyJhbGciOi...`

## 4. Wire them into the frontend

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Fill in the two Supabase values:

```env
VITE_SUPABASE_URL=https://abcdefghijk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

The `.env` file is already in `.gitignore` — it will never be committed.

## 5. Create the demo accounts

Real login accounts live in Supabase Auth, not in `seed.sql` (see why in that
file's header comment). Create the 5 demo accounts with the included script:

```bash
# In your .env, temporarily set SUPABASE_SERVICE_ROLE_KEY (from
# Project Settings -> API -> service_role secret), then:
npm run seed:demo
```

This creates one Auth user per role using the `VITE_DEMO_*` email/password
pairs already in your `.env`, and the `handle_new_user` trigger automatically
creates the matching `profiles` row for each one. You can blank
`SUPABASE_SERVICE_ROLE_KEY` back out afterwards — it's only needed for this
one-time step, never for `npm run dev` / `npm run build`.

## 6. Run the app

```bash
npm install
npm run dev
```

Open http://localhost:5173 and sign in with any of the seeded accounts (these
are the defaults in `.env.example` — check your own `.env` if you changed them):

| Email | Password | Role |
|-------|----------|------|
| `admin@subancare.com`     | `Subhan@2026` | ADMIN |
| `doctor@subancare.com`    | `Subhan@2026` | DOCTOR |
| `reception@subancare.com` | `Subhan@2026` | RECEPTIONIST |
| `pharmacy@subancare.com`  | `Subhan@2026` | PHARMACIST |
| `billing@subancare.com`   | `Subhan@2026` | BILLING_STAFF |

Don't want to use the demo accounts? Click **Create an account** on the login
page to self-register with your own email — it calls the same `signUpUser()`
flow and picks up whatever role you choose there.

## 7. Verify RLS is doing its job

Open **Table Editor** and confirm every table shows "RLS enabled" in the side panel.

Try this in the Supabase SQL editor while signed out:

```sql
select count(*) from patients;
-- should return 0 (anon key can't read without a session)
```

After signing in as a doctor, repeat — you should see the patients list. The same query as a signed-out anon user returns 0. **This is how you know RLS is working.**

## 8. Add new users

Option A — through the app: click **Create an account** on the login page. It
calls `signUpUser()` (`authService.js`), which passes your chosen name/role
as `user_metadata`, so `handle_new_user` creates the matching `profiles` row
with the exact role you picked - no email-prefix guessing needed.

Option B — through the dashboard: **Authentication → Users → Add user**. If
you don't set custom user metadata this way, the trigger falls back to
guessing the role from the email prefix (`dr.*`/`doctor*` → DOCTOR,
`pharma*` → PHARMACIST, `billing*` → BILLING_STAFF, `reception*`/`recep*` →
RECEPTIONIST, `admin*` → ADMIN, anything else → DOCTOR). To force a specific
role afterwards, edit **SQL Editor**:

```sql
update public.profiles
set role = 'ADMIN'
where email = 'newadmin@yourdomain.com';
```

## 9. Security checklist before going live

- [ ] **Rotate the seeded passwords.** Change `Subhan@2026` in `seed.sql` before any non-demo deployment.
- [ ] **Confirm RLS is enabled on all 9 tables.** Run `\d+ patients` in SQL editor — you should see `Row security: enabled`.
- [ ] **Restrict CORS.** In **Project Settings → API**, set the Site URL to your production domain (no `http://localhost:5173`).
- [ ] **Set strong JWT expiry defaults** in **Project Settings → Auth** (60 min access token, refresh-token rotation enabled).
- [ ] **Never expose the service-role key.** It's `SUPABASE_SERVICE_ROLE_KEY` in your dashboard, and you must NEVER put it in a `VITE_*` env var.
- [ ] **Rotate any previously hardcoded secrets.** If you had demo passwords in git history, assume they're burned and reset them.
- [ ] **Enable email-confirmation** in **Auth → Providers → Email** if you want stricter sign-up flow.

## 10. Architecture notes

- **RLS policies are role-based.** The `current_role()` function reads the role from `profiles` for the authenticated user, and policies key off it. No permission bugs in the React layer.
- **The frontend is API-shape-agnostic.** `dataService` exposes the same `list / find / create / update / remove / replaceAll / reset` surface whether the backend is Supabase or localStorage. Switching backends is just a matter of removing the env vars.
- **Reports join across tables.** The Reports module's 6 charts run client-side aggregations over the data the frontend already has. For very large datasets (>10K rows per table) you'd push these to Postgres views or materialized views — out of scope for the demo.
- **Auth is JWT-based.** Supabase issues JWTs; `AuthContext` stores them in `localStorage` under `subhan_care.auth`. The `onAuthStateChange` listener keeps the user object in sync.

## Troubleshooting

**Demo pill row shows dots (••••••••) instead of an email/password**
→ Your `.env` is missing the `VITE_DEMO_*` variables (or they're commented
out). Copy the block from `.env.example`, fill in real values, restart
`npm run dev`. Dots are the intentional fallback for "this var isn't set" -
not a display bug.

**"Sign-in failed: Invalid login credentials" for demo accounts**
→ The account doesn't exist in Supabase Auth yet - `seed.sql` seeds app data
only, it does not create login accounts. Run `npm run seed:demo` (step 5
above) once, then try again.

**"Sign-in failed: Invalid login credentials" for your own email**
→ You haven't registered that email yet. Either use a seeded demo account,
or click **Create an account** on the login page to sign up with it first.

**"Invalid API key" on sign-in**
→ You pasted the `service_role` key by accident. Use the `anon public` key.

**RLS error: "new row violates row-level security policy"**
→ The current user's role doesn't have write permission for that table. Either update the policy in `rls.sql` or assign the right role in `profiles`.

**App still shows localStorage data after wiring Supabase**
→ Clear `localStorage` in DevTools (`Application → Storage → Clear site data`) so the old local cache is wiped. Then refresh.

**"fetch failed" in the console**
→ The Supabase project might be paused (free tier pauses after 7 days of inactivity). Open it in the dashboard to wake it up.

**"permission denied for table users"**
→ That's a sign you ran a query as the `postgres` role with a service-role key. Always use the `anon` key from the client.
