import { getDictionary, getProject } from "@/lib/content";
import { isLocale, pick } from "@/lib/i18n/locales";
import { renderOgImage } from "@/lib/seo/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "studioJHWA project";

export default async function Image({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const locale = isLocale(lang) ? lang : "en";
  const project = getProject(slug);
  const dict = getDictionary(locale);
  return renderOgImage({
    title: project?.name ?? dict.hero.line1,
    subtitle: project ? pick(project.type, locale) : dict.hero.eyebrow,
  });
}
