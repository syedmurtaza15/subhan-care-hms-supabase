/**
 * Application route paths - central source of truth.
 */

export const ROUTES = Object.freeze({
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  OTP_VERIFICATION: '/otp-verification',
  RESET_PASSWORD: '/reset-password',

  DASHBOARD: '/dashboard',
  PATIENTS: '/dashboard/patients',
  DOCTORS: '/dashboard/doctors',
  APPOINTMENTS: '/dashboard/appointments',
  PRESCRIPTIONS: '/dashboard/prescriptions',
  INVENTORY: '/dashboard/inventory',
  BILLING: '/dashboard/billing',
  REPORTS: '/dashboard/reports',
  SETTINGS: '/dashboard/settings',
  PROFILE: '/dashboard/profile',
});

export const ROLE_LANDING = Object.freeze({
  ADMIN: ROUTES.DASHBOARD,
  DOCTOR: ROUTES.DASHBOARD,
  RECEPTIONIST: ROUTES.APPOINTMENTS,
  PHARMACIST: ROUTES.INVENTORY,
  BILLING_STAFF: ROUTES.BILLING,
});