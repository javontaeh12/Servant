const rateLimit = new Map<string, { count: number; resetAt: number }>();

// Clean up expired entries every 60 seconds
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimit) {
      if (now > entry.resetAt) {
        rateLimit.delete(key);
      }
    }
  }, 60000).unref?.();
}

/**
 * Check if a request is within the rate limit.
 * Returns true if allowed, false if rate limited.
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const entry = rateLimit.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimit.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) {
    return false;
  }

  entry.count++;
  return true;
}
