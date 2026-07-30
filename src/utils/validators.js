/**
 * Form validation helpers - pure functions, no deps.
 * Returns string with error message or empty string when valid.
 */

const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const PHONE_REGEX = /^[+0-9][\d\s\-()]{6,18}\d$/;
const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;

export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  return false;
};

export const validateEmail = (value) => {
  if (isEmpty(value)) return 'Email is required';
  if (!EMAIL_REGEX.test(value.trim())) return 'Enter a valid email address';
  return '';
};

export const validatePassword = (value, { strong = false } = {}) => {
  if (isEmpty(value)) return 'Password is required';
  if (value.length < 8) return 'Password must be at least 8 characters';
  if (strong && !STRONG_PASSWORD_REGEX.test(value)) {
    return 'Must include upper, lower, number and special character';
  }
  return '';
};

export const validateConfirmPassword = (value, password) => {
  if (isEmpty(value)) return 'Please confirm your password';
  if (value !== password) return 'Passwords do not match';
  return '';
};

export const validateOtp = (value, length = 6) => {
  const trimmed = (value || '').trim();
  if (isEmpty(trimmed)) return 'Enter the verification code';
  if (!/^\d+$/.test(trimmed)) return 'Code must contain digits only';
  if (trimmed.length !== length) return `Code must be ${length} digits`;
  return '';
};

export const validatePhone = (value) => {
  if (isEmpty(value)) return 'Phone number is required';
  if (!PHONE_REGEX.test(value.trim())) return 'Enter a valid phone number';
  return '';
};

export const validateRequired = (value, label = 'This field') => {
  if (isEmpty(value)) return `${label} is required`;
  return '';
};

/**
 * Run multiple validators and return the first error message.
 */
export const validateField = (value, rules = []) => {
  for (const rule of rules) {
    const error = rule(value);
    if (error) return error;
  }
  return '';
};
