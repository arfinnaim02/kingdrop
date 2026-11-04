import { afterEach, describe, expect, it, vi } from "vitest";
import { strictRateLimit } from "../src/lib/security/rate-limit";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("security-sensitive rate limiter", () => {
  it("fails closed in production without a distributed provider", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
    expect(await strictRateLimit("login:test", 8, 60000)).toMatchObject({ allowed: false });
  });

  it("fails closed if the distributed service is unavailable", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://example.upstash.io");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "test-token");
    const fetchMock = vi.fn().mockRejectedValue(new Error("no connection"));
    vi.stubGlobal("fetch", fetchMock);
    expect(await strictRateLimit("login:test2", 8, 60000)).toMatchObject({ allowed: false });
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("uses the atomic distributed count in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://example.upstash.io");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "test-token");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true, json: async () => ({ result: [9, 20000] }),
    }));
    expect(await strictRateLimit("login:test3", 8, 60000)).toEqual({
      allowed: false, retryAfter: 20,
    });
  });
});
