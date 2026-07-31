# Subhan Care — Hospital Management System

A comprehensive, role-based Hospital Management System (HMS) built with React and Supabase. Manage patients, doctors, appointments, prescriptions, inventory, and billing — all within a secure, role-aware dashboard.

## Features

- **Role-Based Access Control** — Five roles with distinct permissions: Admin, Doctor, Receptionist, Pharmacist, Billing Staff
- **Patient Management** — Register, update, and manage patient records with medical history tracking
- **Appointment Scheduling** — Calendar-based appointment management with status tracking
- **Prescription Management** — Digital prescriptions with medication details and dosage instructions
- **Inventory Management** — Track medication stock, reorder levels, and expiry dates
- **Billing & Invoicing** — Generate invoices, track payments, and manage outstanding balances
- **Reporting** — Dashboard analytics and visual reports for data-driven decisions
- **Staff Management** — Admin-only staff directory and role management
- **Secure Authentication** — Supabase Auth with email/password login and session management
- **Row Level Security** — Database-level security policies that enforce role permissions

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite 8, React Router 7 |
| **UI** | Custom CSS modules, Lucide React icons, Poppins font |
| **Backend** | Supabase (PostgreSQL, Auth, RLS, Realtime) |
| **Auth** | Supabase Auth with email/password |
| **Database** | PostgreSQL with Row Level Security |
| **Deployment** | Vercel (SPA) |

## Role Permissions

| Module | Admin | Doctor | Receptionist | Pharmacist | Billing Staff |
|--------|-------|--------|-------------|------------|---------------|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| Patients | ✅ | ✅ | ✅ | ❌ | ✅ |
| Doctors | ✅ | ❌ | ❌ | ❌ | ❌ |
| Appointments | ✅ | ✅ | ✅ | ❌ | View Only |
| Prescriptions | ✅ | ✅ | ❌ | ❌ | ❌ |
| Inventory | ✅ | ❌ | ❌ | ✅ | ❌ |
| Billing | ✅ | ❌ | ❌ | ❌ | ✅ |
| Reports | ✅ | ❌ | ❌ | ❌ | ❌ |
| Staff | ✅ | ❌ | ❌ | ❌ | ❌ |

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- A Supabase project (free tier works)

### Installation

```bash
# Clone the repository
git clone https://github.com/syedmurtaza15/subhan-care-hms-supabase.git
cd subhan-care-hms-supabase/subhan-care-hms

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in your Supabase URL and anon key in .env

# Start development server
npm run dev
```

### Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL migrations in order:
   - `supabase/trigger_profile.sql` — Creates the auto-profile trigger for new users
   - `supabase/rls_policies.sql` — Enables Row Level Security with role-based policies
3. Get your API keys from Project Settings → API
4. Add them to your `.env` file

### Environment Variables

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Deployment

### Deploy to Vercel

1. Push the repository to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Set the following environment variables in Vercel:
   - `VITE_SUPABASE_URL` — Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` — Your Supabase anon public key
4. Deploy! Vercel will auto-detect the Vite configuration.

The `vercel.json` file is already configured with SPA rewrites for React Router support.

## Project Structure

```
subhan-care-hms/
├── src/
│   ├── assets/          # Images, icons, fonts
│   ├── components/      # Reusable components
│   │   ├── ui/          # Button, Input, Card, Logo, etc.
│   │   ├── auth/        # AuthHero, OtpInput
│   │   └── layout/      # Navbar, Sidebar
│   ├── context/         # AuthContext, DataContext, ToastContext
│   ├── hooks/           # useAuthForm, useMediaQuery
│   ├── layouts/         # AuthLayout, DashboardLayout
│   ├── lib/             # Supabase client configuration
│   ├── pages/           # All page components
│   │   ├── auth/        # Login, SignUp, ForgotPassword, etc.
│   │   └── dashboard/   # All dashboard modules
│   ├── routes/          # AppRoutes, ProtectedRoute
│   ├── services/        # authService, dataService
│   ├── constants/       # roles, routes, ui constants
│   ├── utils/           # helpers, storage, validators
│   └── styles/          # Global CSS and variables
├── supabase/            # SQL migration files
├── scripts/             # Utility scripts
└── public/              # Static assets
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 5173 |
| `npm run build` | Build for production (runs secret scan) |
| `npm run preview` | Preview production build locally |
| `npm run scan:secrets` | Check for hardcoded credentials |

## Security

- **Row Level Security** — All database operations are protected by RLS policies that enforce role-based permissions at the database level
- **Environment Variables** — All sensitive credentials are stored in environment variables, never in source code
- **Secret Scanning** — The build process automatically scans for hardcoded secrets
- **Password Validation** — Strong password requirements enforced on sign-up
- **Rate Limiting** — Login and password reset attempts are rate-limited

## License

© 2026 Subhan Care Hospital Network. All rights reserved.