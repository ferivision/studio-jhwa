import type { NextConfig } from "next";
import { securityHeaders } from "./src/config/security-headers";

// next.config.ts runs outside the app, so it may read process.env directly (documented exception).
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // Safety net: image routes and content loaders read content/ via fs.
  outputFileTracingIncludes: { "/**": ["./content/**/*"] },
  experimental: { globalNotFound: true },
  async redirects() {
    return [{ source: "/", destination: "/en", permanent: false }];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders({
          dev: process.env.NODE_ENV === "development",
          https: siteUrl.startsWith("https://"),
          indexable: process.env.SITE_ENV === "production",
        }),
      },
    ];
  },
};

export default nextConfig;
