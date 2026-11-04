type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/**
 * Lightweight local limiter. For multi-instance production, replace this
 * adapter with Redis/Upstash while retaining the same call site.
 */
export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfter: 0 };
  }
  current.count += 1;
  buckets.set(key, current);
  return {
    allowed: current.count <= limit,
    retryAfter: Math.ceil((current.resetAt - now) / 1000),
  };
}

export function requestIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local"
  );
}


/**
 * Security-sensitive endpoints must use a distributed limiter in production.
 * Unlike the legacy per-process helper, this fails CLOSED when Redis/Upstash
 * is unavailable, avoiding accidental bypass across Vercel instances.
 *
 * This function performs network I/O only when invoked at runtime.
 */
export async function strictRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<{ allowed: boolean; retryAfter: number }> {
  if (process.env.NODE_ENV !== "production") {
    return rateLimit(key, limit, windowMs);
  }

  const endpoint = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!endpoint || !token) {
    console.error("Distributed rate limiter is not configured.");
    return { allowed: false, retryAfter: 60 };
  }

  try {
    const url = new URL(endpoint);
    if (url.protocol !== "https:" || url.username || url.password) {
      return { allowed: false, retryAfter: 60 };
    }
    // Atomic INCR and expiry inside a single Redis Lua command.
    const script =
      "local count = redis.call('INCR', KEYS[1]); " +
      "if count == 1 then redis.call('PEXPIRE', KEYS[1], ARGV[1]); end; " +
      "return {count, redis.call('PTTL', KEYS[1])}";
    const response = await fetch(url.origin, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        "EVAL", script, "1", `kingdropp:rate:${key}`,
        String(windowMs),
      ]),
      cache: "no-store",
      signal: AbortSignal.timeout(2500),
    });
    if (!response.ok) return { allowed: false, retryAfter: 60 };
    const payload = (await response.json()) as { result?: unknown; error?: string };
    if (payload.error || !Array.isArray(payload.result)) {
      return { allowed: false, retryAfter: 60 };
    }
    const count = Number(payload.result[0]);
    const ttl = Number(payload.result[1]);
    if (!Number.isFinite(count) || !Number.isFinite(ttl)) {
      return { allowed: false, retryAfter: 60 };
    }
    return {
      allowed: count <= limit,
      retryAfter: Math.max(1, Math.ceil(ttl / 1000)),
    };
  } catch {
    console.error("Distributed rate limiter unavailable.");
    return { allowed: false, retryAfter: 60 };
  }
}
