import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { SkipLink } from "@/components/layout/SkipLink";
import { getDictionary, getSite } from "@/lib/content";
import { jost } from "@/lib/fonts";
import { isLocale, locales } from "@/lib/i18n/locales";
import "../globals.css";

export const dynamicParams = false;

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
        <SkipLink label={dict.a11y.skipToContent} />
        {children}
        <Footer dict={dict} site={getSite()} />
      </body>
    </html>
  );
}
