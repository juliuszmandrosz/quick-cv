import { describe, expect, it } from "vitest";
import { checkRateLimit, clientKey } from "@/lib/rate-limit";

const requestFrom = (ip: string) =>
  new Request("https://nicecv.test/api", {
    headers: { "x-forwarded-for": `${ip}, 10.0.0.1` },
  });

describe("checkRateLimit", () => {
  const rule = { limit: 3, windowMs: 60_000 };

  it("allows requests up to the limit, then blocks", () => {
    const scope = `test-${Math.random()}`;
    const results = Array.from({ length: 4 }, () =>
      checkRateLimit(requestFrom("1.1.1.1"), scope, rule),
    );

    expect(results.map((r) => r.allowed)).toEqual([true, true, true, false]);
    expect(results[3].retryAfterSeconds).toBeGreaterThan(0);
  });

  it("counts each client IP separately", () => {
    const scope = `test-${Math.random()}`;
    for (let i = 0; i < 3; i++) {
      checkRateLimit(requestFrom("2.2.2.2"), scope, rule);
    }

    expect(checkRateLimit(requestFrom("2.2.2.2"), scope, rule).allowed).toBe(
      false,
    );
    expect(checkRateLimit(requestFrom("3.3.3.3"), scope, rule).allowed).toBe(
      true,
    );
  });
});

describe("clientKey", () => {
  it("uses the first x-forwarded-for entry, which is the original client", () => {
    expect(clientKey(requestFrom("4.4.4.4"), "scope")).toBe("scope:4.4.4.4");
  });

  it("falls back to a shared bucket when no address is present", () => {
    expect(clientKey(new Request("https://nicecv.test"), "scope")).toBe(
      "scope:unknown",
    );
  });
});
