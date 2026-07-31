/**
 * Auth service — Supabase Auth when configured, demo fallback otherwise.
 *
 * Public surface (loginUser, requestPasswordReset, verifyOtp, resetPassword,
 * fetchCurrentUser, signOut) is preserved so the AuthContext and pages don't
 * change. When Supabase env vars are missing, we fall back to the previous
 * demo behaviour (any email + 6+ char password) so reviewers can still run
 * the app without a backend.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ROLES } from '../constants/roles';
import { ROLE_LANDING } from '../constants/routes';
import { sleep } from '../utils/helpers';
import { storage } from '../utils/storage';
import { checkAuthRateLimit, checkPasswordResetRateLimit } from '../utils/rateLimiter';

// ---------- helpers ----------

const generateToken = () => {
  const array = new Uint32Array(3);
  crypto.getRandomValues(array);
  const random = Array.from(array, x => x.toString(36)).join('');
  const timestamp = Date.now();
  const expiry = timestamp + (60 * 60 * 1000); // 1 hour expiry
  return JSON.stringify({ token: `subhan.${random}`, expiresAt: expiry });
};

const isTokenValid = (tokenData) => {
  if (!tokenData) return false;
  try {
    const parsed = typeof tokenData === 'string' ? JSON.parse(tokenData) : tokenData;
    return Date.now() < parsed.expiresAt;
  } catch {
    return false;
  }
};

const generateOtp = () => {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return (array[0] % 900000 + 100000).toString();
};

const departmentForRole = (role) => {
  switch (role) {
    case ROLES.DOCTOR:
      return 'General Medicine';
    case ROLES.PHARMACIST:
      return 'Pharmacy';
    case ROLES.BILLING_STAFF:
      return 'Finance';
    case ROLES.RECEPTIONIST:
      return 'Front Desk';
    default:
      return 'Operations';
  }
};

const inferRoleFromEmail = (email) => {
  const local = String(email || '').split('@')[0].toLowerCase();
  if (local.includes('doctor') || local.includes('dr')) return ROLES.DOCTOR;
  if (local.includes('pharma') || local.includes('pharm')) return ROLES.PHARMACIST;
  if (local.includes('billing') || local.includes('cashier')) return ROLES.BILLING_STAFF;
  if (local.includes('recep') || local.includes('front')) return ROLES.RECEPTIONIST;
  if (local.includes('admin')) return ROLES.ADMIN;
  return ROLES.DOCTOR;
};

const buildUser = ({ email, name, role }) => {
  const local = String(email).split('@')[0] || 'user';
  const fallbackName = local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ') || 'Subhan Care User';
  return {
    id: `usr_${local.replace(/[^a-z0-9]/g, '').slice(0, 12)}`,
    name: name || fallbackName,
    email,
    role: role || ROLES.DOCTOR,
    department: departmentForRole(role || ROLES.DOCTOR),
  };
};

const normalizeRole = (raw) => {
  if (!raw) return ROLES.DOCTOR;
  const upper = String(raw).toUpperCase();
  if (Object.values(ROLES).includes(upper)) return upper;
  return ROLES.DOCTOR;
};

const profileFromAuthUser = (authUser, profileRow) => {
  if (!authUser) return null;
  const role = normalizeRole(profileRow?.role);
  return buildUser({
    email: authUser.email,
    name: profileRow?.full_name || authUser.user_metadata?.name,
    role,
  });
};

const fetchProfile = async (userId) => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.warn('[authService] profile fetch failed', error.message);
    }
    return null;
  }
  return data;
};

// ---------- public API ----------

export const loginUser = async ({ email, password }) => {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const pwd = String(password || '');

  if (!normalizedEmail || !pwd) {
    const error = new Error('Please enter both your email and password.');
    error.code = 'MISSING_CREDENTIALS';
    throw error;
  }
  if (pwd.length < 6) {
    const error = new Error('Password must be at least 6 characters long.');
    error.code = 'WEAK_PASSWORD';
    throw error;
  }

  // Rate limiting check
  if (!checkAuthRateLimit()) {
    const error = new Error('Too many login attempts. Please try again later.');
    error.code = 'RATE_LIMIT_EXCEEDED';
    throw error;
  }

  // ---- Supabase branch ----
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: pwd,
    });
    if (error || !data?.user) {
      const wrapped = new Error(error?.message || 'Invalid email or password.');
      wrapped.code = error?.status ? `SB_${error.status}` : 'INVALID_CREDENTIALS';
      throw wrapped;
    }
    const profile = await fetchProfile(data.user.id);
    const user = profileFromAuthUser(data.user, profile);
    return {
      token: data.session?.access_token || generateToken(),
      user,
      redirectTo: ROLE_LANDING[user.role] || '/dashboard',
      expiresIn: (data.session?.expires_in || 3600) * 1000,
      isDemoAccount: false,
    };
  }

  // ---- Local fallback ----
  await sleep(650);
  const role = inferRoleFromEmail(normalizedEmail);
  const user = buildUser({ email: normalizedEmail, role });
  return {
    token: generateToken(),
    user,
    redirectTo: ROLE_LANDING[role] || '/dashboard',
    expiresIn: 60 * 60 * 1000,
    isDemoAccount: false,
  };
};

export const signUpUser = async ({ email, password, name, role }) => {
  if (!isSupabaseConfigured || !supabase) {
    const error = new Error('Sign-up requires a Supabase backend.');
    error.code = 'BACKEND_REQUIRED';
    throw error;
  }
  
  // Log the request details for debugging
  if (import.meta.env.DEV) {
    console.log('[authService] signUpUser called with:', { email, name, role });
  }
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name, role } },
  });
  
  if (error) {
    // Log the full error for debugging
    if (import.meta.env.DEV) {
      console.error('[authService] signUp error:', error);
    }
    // Create a more descriptive error message
    const wrapped = new Error(error.message || 'Sign-up failed. Please check your email and password and try again.');
    wrapped.code = error.code || error.status || 'SIGNUP_FAILED';
    wrapped.details = error.details || '';
    throw wrapped;
  }

  // The handle_new_user trigger creates the profile row.
  // If email confirmation is disabled, a session is returned immediately.
  if (data?.session) {
    // Fetch the profile that the trigger just created.
    // Wait briefly to ensure the trigger has completed.
    await sleep(500);
    const profile = await fetchProfile(data.user.id);
    const user = profileFromAuthUser(data.user, profile);
    return {
      user,
      token: data.session.access_token,
      session: data.session,
      redirectTo: ROLE_LANDING[user.role] || '/dashboard',
    };
  }

  return data;
};

export const requestPasswordReset = async ({ email }) => {
  const normalized = String(email || '').trim().toLowerCase();
  if (!normalized || !normalized.includes('@')) {
    const error = new Error('Enter a valid email address.');
    error.code = 'INVALID_EMAIL';
    throw error;
  }

  // Rate limiting check
  if (!checkPasswordResetRateLimit()) {
    const error = new Error('Too many password reset attempts. Please try again later.');
    error.code = 'RATE_LIMIT_EXCEEDED';
    throw error;
  }

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.auth.resetPasswordForEmail(normalized, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
    return {
      success: true,
      message: `A reset link has been sent to ${normalized}.`,
      email: normalized,
    };
  }

  await sleep(700);
  const otp = generateOtp();
  const expiry = Date.now() + (15 * 60 * 1000); // 15 minutes expiry
  storage.set(`reset_otp_${normalized}`, { otp, expiry });
  
  return {
    success: true,
    message: `A 6-digit code has been sent to ${normalized}.`,
    email: normalized,
    devCode: import.meta.env.DEV ? otp : undefined, // Only show in development
  };
};

export const verifyOtp = async ({ email, code }) => {
  const normalized = String(email || '').trim().toLowerCase();
  
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.verifyOtp({
      email: normalized,
      token: code,
      type: 'email',
    });
    if (error) throw error;
    return {
      success: true,
      message: 'Code accepted. You can now set a new password.',
      resetToken: data?.session?.access_token,
      email: normalized,
    };
  }

  await sleep(600);
  if (!/^\d{6}$/.test(code)) {
    const error = new Error('Verification code must be 6 digits.');
    error.code = 'INVALID_OTP_FORMAT';
    throw error;
  }
  
  // Validate OTP against stored value
  const storedOtpData = storage.get(`reset_otp_${normalized}`);
  if (!storedOtpData) {
    const error = new Error('No reset request found. Please request a new code.');
    error.code = 'OTP_EXPIRED';
    throw error;
  }
  
  if (Date.now() > storedOtpData.expiry) {
    storage.remove(`reset_otp_${normalized}`);
    const error = new Error('Verification code has expired. Please request a new code.');
    error.code = 'OTP_EXPIRED';
    throw error;
  }
  
  if (code !== storedOtpData.otp) {
    const error = new Error('Invalid verification code.');
    error.code = 'INVALID_OTP';
    throw error;
  }
  
  // Clear OTP after successful validation
  storage.remove(`reset_otp_${normalized}`);
  
  return {
    success: true,
    message: 'Code accepted. You can now set a new password.',
    resetToken: generateToken(),
    email: normalized,
  };
};

export const resetPassword = async ({ resetToken, password }) => {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
    return {
      success: true,
      message: 'Password updated successfully. You can now log in.',
    };
  }

  await sleep(800);
  if (!resetToken) {
    const error = new Error('Reset session expired. Please restart the flow.');
    error.code = 'EXPIRED_TOKEN';
    throw error;
  }
  if (!password || password.length < 8) {
    const error = new Error('Password must be at least 8 characters.');
    error.code = 'WEAK_PASSWORD';
    throw error;
  }
  return {
    success: true,
    message: 'Password updated successfully. You can now log in.',
  };
};

export const fetchCurrentUser = async (token) => {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) return null;
    const profile = await fetchProfile(data.user.id);
    return profileFromAuthUser(data.user, profile);
  }
  await sleep(200);
  return token ? buildUser({ email: 'demo@subancare.com', role: ROLES.ADMIN }) : null;
};

export const signOut = async () => {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
};

export const onAuthStateChange = (handler) => {
  if (!isSupabaseConfigured || !supabase) {
    return { data: { subscription: { unsubscribe: () => {} } } };
  }
  return supabase.auth.onAuthStateChange(async (_event, session) => {
    if (!session?.user) {
      handler(null, null);
      return;
    }
    const profile = await fetchProfile(session.user.id);
    const user = profileFromAuthUser(session.user, profile);
    handler(user, session.access_token);
  });
};
