/**
 * Misc small helpers used across the app.
 */

export const classNames = (...args) => {
  const out = [];
  args.forEach((item) => {
    if (!item) return;
    if (typeof item === 'string' || typeof item === 'number') {
      out.push(String(item));
    } else if (Array.isArray(item)) {
      const nested = classNames(...item);
      if (nested) out.push(nested);
    } else if (typeof item === 'object') {
      Object.entries(item).forEach(([key, value]) => {
        if (value) out.push(key);
      });
    }
  });
  return out.filter(Boolean).join(' ');
};

export const initialsFromName = (name = '') => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const formatDate = (input, options = {}) => {
  if (!input) return '';
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  }).format(date);
};

export const formatTime = (input) => {
  if (!input) return '';
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
};

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const truncate = (text, max = 80) => {
  if (!text) return '';
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
};
