/**
 * Centralized UI constants — keep magic numbers / strings out of components.
 */

export const INPUT_TYPES = Object.freeze({
  TEXT: 'text',
  EMAIL: 'email',
  PASSWORD: 'password',
  TEL: 'tel',
  NUMBER: 'number',
  DATE: 'date',
  SEARCH: 'search',
  URL: 'url',
});

export const BUTTON_VARIANTS = Object.freeze({
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  OUTLINE: 'outline',
  GHOST: 'ghost',
  DANGER: 'danger',
});

export const BUTTON_SIZES = Object.freeze({
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
});

export const SPINNER_SIZES = Object.freeze({
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
});

export const OTP_LENGTH = 6;

export const RESEND_COOLDOWN_SECONDS = 30;

export const SESSION_TIMEOUT_MS = 15 * 60 * 1000;
