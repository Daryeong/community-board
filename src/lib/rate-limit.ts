"server-only";

const requestHistory = new Map<string, number[]>();

const limits: Record<string, { windowMs: number; maxRequests: number }> = {
  login: { windowMs: 60 * 1000, maxRequests: 5 },
  register: { windowMs: 60 * 60 * 1000, maxRequests: 3 },
  createPost: { windowMs: 60 * 60 * 1000, maxRequests: 10 },
  createComment: { windowMs: 60 * 60 * 1000, maxRequests: 20 },
};

export function checkRateLimit(key: string, type: keyof typeof limits): { allowed: boolean; remaining: number; resetTime: number } {
  const config = limits[type];

  const now = Date.now();
  const timestamps = requestHistory.get(key) ?? [];
  const validTimestamps = timestamps.filter((t) => now - t < config.windowMs);
  
  const remaining = Math.max(0, config.maxRequests - validTimestamps.length);
  const resetTime = validTimestamps.length > 0 
    ? Math.min(...validTimestamps) + config.windowMs 
    : now + config.windowMs;

  if (validTimestamps.length >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetTime };
  }

  validTimestamps.push(now);
  requestHistory.set(key, validTimestamps);
  
  return { allowed: true, remaining: remaining - 1, resetTime };
}

export function getRateLimitInfo(type: keyof typeof limits) {
  return limits[type];
}