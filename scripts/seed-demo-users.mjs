/**
 * scripts/seed-demo-users.mjs
 *
 * Creates the 5 demo accounts (one per role) directly in Supabase Auth so
 * the login page's demo pills actually work.
 *
 * WHY THIS IS A SEPARATE SCRIPT, NOT APP CODE:
 * Creating users with the Admin API requires the Supabase SERVICE ROLE key,
 * which bypasses Row Level Security entirely. That key must never ship to
 * the browser, so this script runs locally, once, on your own machine -
 * it is never imported by anything under src/ and is never part of the
 * Vite build.
 *
 * USAGE:
 *   1. In Supabase Dashboard -> Project Settings -> API, copy the
 *      "service_role" secret key.
 *   2. Put it in your local .env as SUPABASE_SERVICE_ROLE_KEY=... (already
 *      has an empty slot there - do NOT use a VITE_ prefix).
 *   3. Run:  node --env-file=.env scripts/seed-demo-users.mjs
 *      (Node 20.6+. On older Node, `export $(grep -v '^#' .env | xargs)`
 *      first, or use the `dotenv-cli` package instead.)
 *   4. Once it prints "done", you can blank SUPABASE_SERVICE_ROLE_KEY back
 *      out of your .env again - it isn't needed for normal dev/build/deploy.
 *
 * This script is idempotent: re-running it skips any email that already
 * exists in Supabase Auth instead of erroring out.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    '\nMissing config. This script needs, in your local .env:\n' +
      '  VITE_SUPABASE_URL=<your project url>\n' +
      '  SUPABASE_SERVICE_ROLE_KEY=<your service_role secret, from Supabase ' +
      'Dashboard -> Project Settings -> API>\n\n' +
      'Then run:  node --env-file=.env scripts/seed-demo-users.mjs\n',
  );
  process.exit(1);
}

// Admin client - service role key, local script only, never exported.
const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DEMO_USERS = [
  {
    role: 'ADMIN',
    name: 'Ayesha Khan',
    email: process.env.VITE_DEMO_ADMIN_EMAIL,
    password: process.env.VITE_DEMO_ADMIN_PASSWORD,
  },
  {
    role: 'DOCTOR',
    name: 'Dr. Hamza Iqbal',
    email: process.env.VITE_DEMO_DOCTOR_EMAIL,
    password: process.env.VITE_DEMO_DOCTOR_PASSWORD,
  },
  {
    role: 'RECEPTIONIST',
    name: 'Fatima Riaz',
    email: process.env.VITE_DEMO_RECEPTION_EMAIL,
    password: process.env.VITE_DEMO_RECEPTION_PASSWORD,
  },
  {
    role: 'PHARMACIST',
    name: 'Bilal Ahmed',
    email: process.env.VITE_DEMO_PHARMACY_EMAIL,
    password: process.env.VITE_DEMO_PHARMACY_PASSWORD,
  },
  {
    role: 'BILLING_STAFF',
    name: 'Hina Tariq',
    email: process.env.VITE_DEMO_BILLING_EMAIL,
    password: process.env.VITE_DEMO_BILLING_PASSWORD,
  },
  {
    role: 'PATIENT',
    name: 'Aisha Mehmood',
    email: process.env.VITE_DEMO_PATIENT_EMAIL,
    password: process.env.VITE_DEMO_PATIENT_PASSWORD,
  },
];

const missingCreds = DEMO_USERS.filter((u) => !u.email || !u.password);
if (missingCreds.length > 0) {
  console.error(
    '\nMissing VITE_DEMO_* email/password values in .env for: ' +
      missingCreds.map((u) => u.role).join(', ') +
      '\nSee .env.example for the full list of VITE_DEMO_* variables.\n',
  );
  process.exit(1);
}

const run = async () => {
  console.log(`Seeding ${DEMO_USERS.length} demo users into ${SUPABASE_URL} ...\n`);

  for (const demoUser of DEMO_USERS) {
    // Fetch ALL users (not just the first page) to check for existing accounts
    const { data: existing } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const alreadyExists = existing?.users?.some((u) => u.email === demoUser.email);

    if (alreadyExists) {
      console.log(`  skip   ${demoUser.role.padEnd(14)} ${demoUser.email} (already exists)`);
      continue;
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: demoUser.email,
      password: demoUser.password,
      email_confirm: true, // demo accounts can sign in immediately, no email step
      user_metadata: {
        name: demoUser.name,
        role: demoUser.role,
      },
    });

    if (error) {
      // If the user already exists (race condition or pagination miss), treat as success
      if (error.message?.includes('already been registered') || error.message?.includes('already exists')) {
        console.log(`  skip   ${demoUser.role.padEnd(14)} ${demoUser.email} (already exists)`);
        continue;
      }
      console.error(`  FAILED ${demoUser.role.padEnd(14)} ${demoUser.email} - ${error.message || JSON.stringify(error)}`);
      continue;
    }

    console.log(`  created ${demoUser.role.padEnd(14)} ${demoUser.email}`);
  }

  console.log(
    '\ndone. The handle_new_user trigger (supabase/schema.sql) auto-created a ' +
      'matching row in public.profiles for each new user.\n' +
      'You can now sign in with the demo pills on the login page.\n',
  );
};

run().catch((error) => {
  console.error('\nSeed script crashed:', error);
  process.exit(1);
});
