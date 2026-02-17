/**
 * Simple in-memory rate limiter using sliding window approach
 * 
 * Tracks request timestamps and enforces rate limits per identifier (IP, user, etc.)
 * Automatically cleans up old entries to prevent memory leaks.
 */

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number; // Unix timestamp in milliseconds
}

class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private windowMs: number;
  private cleanupInterval: NodeJS.Timeout | null = null;

  /**
   * @param maxRequests - Maximum number of requests allowed
   * @param windowMs - Time window in milliseconds (e.g., 3600000 for 1 hour)
   */
  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;

    // Clean up old entries every 5 minutes to prevent memory leaks
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * Check if a request should be allowed
   * @param identifier - Unique identifier (IP address, user ID, etc.)
   * @returns Rate limit result with allowed status and remaining requests
   */
  check(identifier: string): RateLimitResult {
    const now = Date.now();
    const cutoff = now - this.windowMs;

    // Get existing requests for this identifier
    const timestamps = this.requests.get(identifier) || [];

    // Filter out requests outside the time window
    const recentRequests = timestamps.filter((ts) => ts > cutoff);

    // Check if limit exceeded
    const allowed = recentRequests.length < this.maxRequests;

    if (allowed) {
      // Add current request timestamp
      recentRequests.push(now);
      this.requests.set(identifier, recentRequests);
    } else {
      // Update with filtered timestamps (for accurate remaining count)
      this.requests.set(identifier, recentRequests);
    }

    // Calculate reset time (oldest request in window + window duration)
    const resetAt =
      recentRequests.length > 0
        ? Math.min(...recentRequests) + this.windowMs
        : now + this.windowMs;

    return {
      allowed,
      remaining: Math.max(0, this.maxRequests - recentRequests.length),
      resetAt,
    };
  }

  /**
   * Clean up old entries that are outside the time window
   */
  private cleanup(): void {
    const now = Date.now();
    const cutoff = now - this.windowMs;

    for (const [identifier, timestamps] of this.requests.entries()) {
      const recentRequests = timestamps.filter((ts) => ts > cutoff);
      if (recentRequests.length === 0) {
        this.requests.delete(identifier);
      } else {
        this.requests.set(identifier, recentRequests);
      }
    }
  }

  /**
   * Clean up resources (call this when shutting down)
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.requests.clear();
  }
}

/**
 * Rate limiter for Unsplash API
 * Unsplash demo apps typically have 50 requests per hour limit
 */
export const unsplashRateLimiter = new RateLimiter(50, 60 * 60 * 1000); // 50 requests per hour

/**
 * Get client identifier from request (IP address)
 * In production, you might want to use a more sophisticated method
 * that accounts for proxies, load balancers, etc.
 */
export function getClientIdentifier(req: Request): string {
  // Try to get IP from various headers (for proxies/load balancers)
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  // Fallback: use a default identifier (in production, you'd want proper IP detection)
  // For now, we'll use a global identifier since this is likely a single-user app
  return "global";
}
