/**
 * User roles defined per SRS Section 9 - Role-Permission Matrix.
 * Keep role strings in UPPER_CASE to match API contract.
 *
 * SECURITY: Demo credentials are intentionally NOT stored in source code.
 * They are loaded at runtime from Vite environment variables
 * (VITE_DEMO_ADMIN_EMAIL, VITE_DEMO_ADMIN_PASSWORD, ...). See `.env.example`
 * for the full list. If env vars are missing, the UI falls back to a
 * placeholder string ("••••••••") so the demo pill row never shows real
 * credentials in production.
 */

export const ROLES = Object.freeze({
  ADMIN: 'ADMIN',
  DOCTOR: 'DOCTOR',
  RECEPTIONIST: 'RECEPTIONIST',
  PHARMACIST: 'PHARMACIST',
  BILLING_STAFF: 'BILLING_STAFF',
});

export const ROLE_LABEL = Object.freeze({
  [ROLES.ADMIN]: 'Administrator',
  [ROLES.DOCTOR]: 'Doctor',
  [ROLES.RECEPTIONIST]: 'Receptionist',
  [ROLES.PHARMACIST]: 'Pharmacist',
  [ROLES.BILLING_STAFF]: 'Billing Staff',
});

/**
 * Read a string from Vite env, with a hard fail-safe that never reveals
 * a real credential. If the env var is unset, we return a redacted
 * placeholder so the UI still renders without leaking the demo values.
 */
const env = (key) => {
  // Vite injects only variables prefixed with VITE_ into the client bundle.
  // Anything else is undefined here.
  return import.meta?.env?.[key];
};

const safe = (key) => env(key) || '••••••••';

/**
 * Demo accounts pre-seeded for the Authentication module preview.
 * Backed by environment variables — never hardcoded.
 *
 * In a real deployment, set the env vars in your hosting platform
 * (Vercel, Netlify, etc.) and keep them out of source control.
 */
export const DEMO_CREDENTIALS = Object.freeze({
  [ROLES.ADMIN]: {
    email: safe('VITE_DEMO_ADMIN_EMAIL'),
    password: safe('VITE_DEMO_ADMIN_PASSWORD'),
    name: 'Ayesha Khan',
  },
  [ROLES.DOCTOR]: {
    email: safe('VITE_DEMO_DOCTOR_EMAIL'),
    password: safe('VITE_DEMO_DOCTOR_PASSWORD'),
    name: 'Dr. Hamza Iqbal',
  },
  [ROLES.RECEPTIONIST]: {
    email: safe('VITE_DEMO_RECEPTION_EMAIL'),
    password: safe('VITE_DEMO_RECEPTION_PASSWORD'),
    name: 'Fatima Riaz',
  },
  [ROLES.PHARMACIST]: {
    email: safe('VITE_DEMO_PHARMACY_EMAIL'),
    password: safe('VITE_DEMO_PHARMACY_PASSWORD'),
    name: 'Bilal Ahmed',
  },
  [ROLES.BILLING_STAFF]: {
    email: safe('VITE_DEMO_BILLING_EMAIL'),
    password: safe('VITE_DEMO_BILLING_PASSWORD'),
    name: 'Hina Tariq',
  },
});

/**
 * Mask passwords when displayed in the demo pill row. We never want to
 * render real password values, even in dev — show dots instead.
 */
export const maskPassword = (value) => {
  if (!value || value === '••••••••') return '••••••••';
  const visible = value.length > 4 ? 2 : 1;
  return value.slice(0, visible) + '••••••';
};
