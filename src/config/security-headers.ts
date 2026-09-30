type Header = { key: string; value: string };
type Options = { dev: boolean; https: boolean; indexable: boolean };

/**
 * One place for HTTP security headers (CLAUDE.md §7).
 * CSP is a static allow-list (plan decision D2): 'unsafe-inline' for scripts is required by
 * App Router hydration without a per-request nonce; there are no third-party scripts.
 */
export function securityHeaders({ dev, https, indexable }: Options): Header[] {
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    `connect-src 'self'${dev ? " ws:" : ""}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(https ? ["upgrade-insecure-requests"] : []),
  ].join("; ");

  return [
    { key: "Content-Security-Policy", value: csp },
    ...(https
      ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }]
      : []),
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
    },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    ...(indexable ? [] : [{ key: "X-Robots-Tag", value: "noindex, nofollow" }]),
  ];
}
