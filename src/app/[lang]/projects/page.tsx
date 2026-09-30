import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { getDictionary } from "@/lib/content";
import { isLocale } from "@/lib/i18n/locales";

export default async function ProjectsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  return (
    <>
      <Header lang={lang} dict={dict} variant="solid" />
      <main id="main" />
    </>
  );
}
