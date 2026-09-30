import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { SkipLink } from "@/components/layout/SkipLink";
import { env } from "@/config/env";
import { getDictionary, getHome, getSite } from "@/lib/content";
import { jost } from "@/lib/fonts";
import { isLocale, locales } from "@/lib/i18n/locales";
import { JsonLd } from "@/lib/seo/JsonLd";
import { businessJsonLd } from "@/lib/seo/structured-data";
import "../globals.css";

export const dynamicParams = false;

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
  icons: { icon: "/favicon.svg" },
};

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

type LayoutProps = { children: ReactNode; params: Promise<{ lang: string }> };

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  return (
    <html lang={lang} className={jost.variable}>
      <body>
        <JsonLd
          data={businessJsonLd(
            getSite(),
            lang,
            env.NEXT_PUBLIC_SITE_URL,
            env.NEXT_PUBLIC_SITE_URL + getHome().hero.src,
          )}
        />
        <SkipLink label={dict.a11y.skipToContent} />
        {children}
        <Footer dict={dict} site={getSite()} />
      </body>
    </html>
  );
}
