import { getDictionary } from "@/lib/content";
import { isLocale } from "@/lib/i18n/locales";
import { renderOgImage } from "@/lib/seo/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "studioJHWA";

export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = getDictionary(isLocale(lang) ? lang : "en");
  return renderOgImage({
    title: `${dict.hero.line1} ${dict.hero.line2}`,
    subtitle: dict.hero.eyebrow,
  });
}
