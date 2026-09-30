import { describe, expect, it } from "vitest";
import { securityHeaders } from "@/config/security-headers";

const toMap = (h: { key: string; value: string }[]) =>
  Object.fromEntries(h.map(({ key, value }) => [key, value]));

describe("security headers", () => {
  const prod = toMap(securityHeaders({ dev: false, https: true, indexable: true }));

  it("sets a strict CSP", () => {
    const csp = prod["Content-Security-Policy"];
    for (const directive of [
      "default-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ]) {
      expect(csp).toContain(directive);
    }
    expect(csp).not.toContain("unsafe-eval");
  });

  it("sets HSTS, nosniff, referrer and permissions policies", () => {
    expect(prod["Strict-Transport-Security"]).toBe("max-age=63072000; includeSubDomains");
    expect(prod["X-Content-Type-Options"]).toBe("nosniff");
    expect(prod["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(prod["Permissions-Policy"]).toContain("camera=()");
    expect(prod["X-Frame-Options"]).toBe("DENY");
    expect(prod["X-Robots-Tag"]).toBeUndefined();
  });

  it("allows eval only in dev, and skips HTTPS-only headers on http", () => {
    const dev = toMap(securityHeaders({ dev: true, https: false, indexable: false }));
    expect(dev["Content-Security-Policy"]).toContain("'unsafe-eval'");
    expect(dev["Content-Security-Policy"]).not.toContain("upgrade-insecure-requests");
    expect(dev["Strict-Transport-Security"]).toBeUndefined();
    expect(dev["X-Robots-Tag"]).toBe("noindex, nofollow");
  });
});
