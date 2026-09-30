import type { MetadataRoute } from "next";
import { env } from "@/config/env";
import { getProjects } from "@/lib/content";
import { locales } from "@/lib/i18n/locales";
import { alternatesFor } from "@/lib/seo/metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = env.NEXT_PUBLIC_SITE_URL;
  const paths = ["", "/projects", ...getProjects().map((p) => `/projects/${p.slug}`)];
  const absolute = (languages: Record<string, string>) =>
    Object.fromEntries(Object.entries(languages).map(([lang, path]) => [lang, `${base}${path}`]));
  return paths.flatMap((path) =>
    locales.map((lang) => ({
      url: `${base}/${lang}${path}`,
      alternates: { languages: absolute(alternatesFor(path)) },
    })),
  );
}
