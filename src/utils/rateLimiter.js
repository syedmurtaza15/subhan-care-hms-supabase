/**
 * Client-side rate limiter to prevent abuse.
 * Tracks request counts per endpoint in localStorage with time windows.
 */

const STORAGE_PREFIX = 'rate_limit_';
const DEFAULT_WINDOW_MS = 60 * 1000; // 1 minute
const DEFAULT_MAX_REQUESTS = 30; // 30 requests per minute

class RateLimiter {
  constructor() {
    this.limits = new Map();
  }

  /**
   * Check if a request is allowed based on rate limits.
   * @param {string} endpoint - The endpoint identifier (e.g., 'login', 'create_invoice')
   * @param {number} maxRequests - Maximum requests allowed in the time window
   * @param {number} windowMs - Time window in milliseconds
   * @returns {boolean} - True if request is allowed, false if rate limited
   */
  isAllowed(endpoint, maxRequests = DEFAULT_MAX_REQUESTS, windowMs = DEFAULT_WINDOW_MS) {
    const key = `${STORAGE_PREFIX}${endpoint}`;
    const now = Date.now();
    
    try {
      const data = JSON.parse(localStorage.getItem(key) || '{"requests": [], "blockedUntil": null}');
      
      // Check if currently blocked
      if (data.blockedUntil && now < data.blockedUntil) {
        return false;
      }
      
      // Clear blocked status if time has passed
      if (data.blockedUntil && now >= data.blockedUntil) {
        data.blockedUntil = null;
        data.requests = [];
      }
      
      // Remove requests outside the time window
      data.requests = data.requests.filter(timestamp => now - timestamp < windowMs);
      
      // Check if under limit
      if (data.requests.length < maxRequests) {
        data.requests.push(now);
        localStorage.setItem(key, JSON.stringify(data));
        return true;
      }
      
      // Rate limit exceeded - block for the window duration
      data.blockedUntil = now + windowMs;
      localStorage.setItem(key, JSON.stringify(data));
      return false;
      
    } catch (error) {
      // If localStorage fails, allow the request (fail open)
      return true;
    }
  }

  /**
   * Get remaining requests before rate limit.
   * @param {string} endpoint - The endpoint identifier
   * @param {number} maxRequests - Maximum requests allowed
   * @param {number} windowMs - Time window in milliseconds
   * @returns {number} - Remaining requests
   */
  getRemaining(endpoint, maxRequests = DEFAULT_MAX_REQUESTS, windowMs = DEFAULT_WINDOW_MS) {
    const key = `${STORAGE_PREFIX}${endpoint}`;
    const now = Date.now();
    
    try {
      const data = JSON.parse(localStorage.getItem(key) || '{"requests": [], "blockedUntil": null}');
      
      if (data.blockedUntil && now < data.blockedUntil) {
        return 0;
      }
      
      data.requests = data.requests.filter(timestamp => now - timestamp < windowMs);
      return Math.max(0, maxRequests - data.requests.length);
      
    } catch (error) {
      return maxRequests;
    }
  }

  /**
   * Get time until rate limit resets.
   * @param {string} endpoint - The endpoint identifier
   * @returns {number} - Milliseconds until reset, or 0 if not rate limited
   */
  getResetTime(endpoint) {
    const key = `${STORAGE_PREFIX}${endpoint}`;
    const now = Date.now();
    
    try {
      const data = JSON.parse(localStorage.getItem(key) || '{"requests": [], "blockedUntil": null}');
      
      if (data.blockedUntil && now < data.blockedUntil) {
        return data.blockedUntil - now;
      }
      
      return 0;
      
    } catch (error) {
      return 0;
    }
  }

  /**
   * Reset rate limit for an endpoint (for testing or admin use).
   * @param {string} endpoint - The endpoint identifier
   */
  reset(endpoint) {
    const key = `${STORAGE_PREFIX}${endpoint}`;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      // Ignore
    }
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter();

// Convenience functions for common endpoints
export const checkAuthRateLimit = () => rateLimiter.isAllowed('auth', 5, 60 * 1000); // 5 per minute
export const checkDataRateLimit = () => rateLimiter.isAllowed('data', 100, 60 * 1000); // 100 per minute
export const checkPasswordResetRateLimit = () => rateLimiter.isAllowed('password_reset', 3, 60 * 60 * 1000); // 3 per hour
