/**
 * Rate Limiting Middleware
 * Prevents abuse of expensive operations like blockchain syncs
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number; // in milliseconds
}

class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private config: RateLimitConfig;

  constructor(maxRequests: number = 5, windowMs: number = 5 * 60 * 1000) {
    this.config = { maxRequests, windowMs };

    // Cleanup expired entries every minute
    this.startCleanupInterval();
  }

  /**
   * Check if a key has exceeded rate limit
   * Returns { allowed: boolean, remaining: number, resetTime: number }
   */
  check(key: string): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
  } {
    const now = Date.now();
    const entry = this.store.get(key);

    // No entry or window has expired
    if (!entry || now >= entry.resetTime) {
      const resetTime = now + this.config.windowMs;
      this.store.set(key, {
        count: 1,
        resetTime,
      });

      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime,
      };
    }

    // Increment count
    entry.count++;

    const allowed = entry.count <= this.config.maxRequests;
    const remaining = Math.max(0, this.config.maxRequests - entry.count);

    return {
      allowed,
      remaining,
      resetTime: entry.resetTime,
    };
  }

  /**
   * Reset the rate limit for a key (admin action)
   */
  reset(key: string): void {
    this.store.delete(key);
  }

  /**
   * Clean up expired entries to prevent memory leak
   */
  private startCleanupInterval(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.store.entries()) {
        if (now >= entry.resetTime) {
          this.store.delete(key);
        }
      }
    }, 60 * 1000); // Cleanup every minute
  }

  /**
   * Get stats for debugging
   */
  getStats(): { keys: number; config: RateLimitConfig } {
    return {
      keys: this.store.size,
      config: this.config,
    };
  }
}

// Create singleton instance
// Rate limit: 5 syncs per 5 minutes per wallet
export const syncLimiter = new RateLimiter(5, 5 * 60 * 1000);

/**
 * Get rate limit key from request
 * Prefers wallet address, fallbacks to IP address
 */
export function getRateLimitKey(
  wallet: string | null,
  ipAddress: string | null,
): string {
  if (wallet) {
    return `sync:${wallet}`;
  }
  if (ipAddress) {
    return `sync:ip:${ipAddress}`;
  }
  return `sync:unknown`;
}

/**
 * Extract IP address from request headers
 */
export function getClientIP(request: Request): string | null {
  // Try standard headers first
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    // x-forwarded-for can be comma-separated list, take the first
    return forwarded.split(",")[0].trim();
  }

  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  // Try to get from URL if it's a local request
  const url = new URL(request.url);
  return url.hostname || null;
}
