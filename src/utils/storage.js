/**
 * Thin wrapper around localStorage with safe JSON handling.
 * No-op when window/localStorage is unavailable.
 */

const isStorageAvailable = () => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    const probe = '__subhan_care_probe__';
    window.localStorage.setItem(probe, probe);
    window.localStorage.removeItem(probe);
    return true;
  } catch (error) {
    return false;
  }
};

export const storage = {
  get(key, fallback = null) {
    if (!isStorageAvailable()) return fallback;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch (error) {
      return fallback;
    }
  },
  set(key, value) {
    if (!isStorageAvailable()) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      /* quota exceeded or serialization error - ignore */
    }
  },
  remove(key) {
    if (!isStorageAvailable()) return;
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      /* ignore */
    }
  },
  clear() {
    if (!isStorageAvailable()) return;
    try {
      window.localStorage.clear();
    } catch (error) {
      /* ignore */
    }
  },
};

export const STORAGE_KEYS = Object.freeze({
  AUTH_TOKEN: 'subhan_care.auth.token',
  AUTH_USER: 'subhan_care.auth.user',
  AUTH_REMEMBER: 'subhan_care.auth.remember',
});
