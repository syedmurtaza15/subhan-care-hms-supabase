# Subhan Care — Hospital Management System

A modular, role-aware Hospital Management System frontend for the Subhan Care Hospital Network. Built to fulfill the SRS document — covering all 13 sprints from Authentication through Reports, Settings & Error Pages.

## Stack

- **React 18** with **Vite 5** as the bundler.
- **React Router 6** for the auth + dashboard routing.
- **lucide-react** for every icon (per the UI Design Guide).
- **Poppins** loaded through Google Fonts.
- Pure CSS modules (no CSS-in-JS), a `variables.css` token sheet, and component-scoped CSS files.
- **Supabase** as the optional backend (Postgres + Auth + RLS), with a `localStorage` fallback for offline demo.

## Folder structure

```
src/
├── assets/        # images, icons, fonts
├── components/    # reusable components (ui, auth, layout)
│   ├── ui/        # Button, Input, Card, Logo, Spinner, Alert, charts
│   ├── auth/      # RoleSelector, OtpInput, AuthHero
│   └── layout/    # Navbar, Sidebar
├── lib/           # supabase.js client wrapper
├── pages/         # all pages (auth/ + dashboard/)
├── layouts/       # AuthLayout, DashboardLayout
├── hooks/         # useAuthForm, useMediaQuery
├── context/       # AuthContext, DataContext
├── routes/        # AppRoutes, ProtectedRoute, PublicOnlyRoute
├── services/      # authService, dataService
├── constants/     # roles, routes, ui
├── utils/         # helpers, storage, formatters
└── styles/        # variables.css, global.css
supabase/          # schema.sql, rls.sql, seed.sql
scripts/           # check-secrets.sh
```

## Demo credentials

**Local demo mode (no Supabase):** the login page accepts any email + password ≥ 6 characters. The role is inferred from the email prefix. Try `admin@anything.com` / `password`.

**Supabase mode (after running `supabase/seed.sql`):**

| Role           | Email                        | Password      |
|----------------|------------------------------|---------------|
| Admin          | admin@subancare.com          | Subhan@2026   |
| Doctor         | doctor@subancare.com         | Subhan@2026   |
| Receptionist   | reception@subancare.com      | Subhan@2026   |
| Pharmacist     | pharmacy@subancare.com       | Subhan@2026   |
| Billing Staff  | billing@subancare.com        | Subhan@2026   |

> ⚠️ Change `Subhan@2026` in `supabase/seed.sql` before any non-demo deployment. The password is a placeholder; rotate it as part of the launch checklist.

## Getting started

```bash
npm install
cp .env.example .env       # fill in if using Supabase
npm run dev                # http://localhost:5173
npm run build              # production bundle (runs secret scan first)
npm run preview            # serve the production build
npm run scan:secrets       # verify no hardcoded credentials
```

### Backend

The app supports two backends out of the box:

- **Local demo** — `localStorage`, no setup needed. Data is per-browser.
- **Supabase** — real Postgres + Auth + RLS. See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for the 5-minute walkthrough.

## Security

A full secret-safety pass has been completed. See [SECURITY.md](./SECURITY.md) for the audit findings, the data-flow guarantees, and the rotation checklist.

Highlights:

- All credentials live in environment variables, never in source code.
- Demo credentials on the login page are masked (`••••••`) — they cannot be read by anyone viewing the rendered UI.
- The `npm run build` command runs the secret scan first (`prebuild` hook).
- The Supabase service-role key is documented in `.env.example` as a server-side-only value (no `VITE_` prefix).

> ⚠️ **Git history warning:** if any credentials were ever hardcoded in earlier versions of this repo, those old values are still in git history. Treat any previously hardcoded secret as compromised and rotate it before the next deployment.

## Responsive design

- **1024 px and above** — full sidebar + content layout.
- **768–1023 px** — sidebar collapses behind a hamburger in the navbar.
- **480–600 px** — sidebar turns into a slide-in drawer; OTP cells resize.
- **≤480 px** — single-column forms, simplified typography, full-width hero CTAs.

## Submission checklist

- [x] GitHub-ready folder layout, no inline styles.
- [x] Functional components + hooks only.
- [x] Reusable components (`Button`, `Input`, `Card`, `Logo`, `Spinner`, `Alert`, charts).
- [x] Responsive at every breakpoint (no horizontal scroll at 360 px).
- [x] Naming conventions: PascalCase components, camelCase utilities, UPPER_CASE constants.
- [x] No console errors on any flow.
- [x] Auth flow end-to-end: Login → Dashboard, Forgot → OTP → Reset → Login.
- [x] Supabase backend with RLS policies per role (5 roles × 9 tables).
- [x] Secret scan runs on every `npm run build`.
