import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Built } from "@/components/sections/Built";
import { Faq } from "@/components/sections/Faq";
import { FilmStrip } from "@/components/sections/FilmStrip";
import { Hero } from "@/components/sections/Hero";
import { Intro } from "@/components/sections/Intro";
import { LineToLight } from "@/components/sections/LineToLight/LineToLight";
import { Rooms } from "@/components/sections/Rooms";
import { SelectedProjects } from "@/components/sections/SelectedProjects";
import { Services } from "@/components/sections/Services";
import { getDictionary, getFeaturedProjects, getHome } from "@/lib/content";
import { isLocale } from "@/lib/i18n/locales";

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const home = getHome();
  return (
    <>
      <Header lang={lang} dict={dict} variant="overlay" />
      <main id="main" tabIndex={-1}>
        <Hero lang={lang} dict={dict.hero} image={home.hero} />
        <Intro lang={lang} dict={dict.intro} images={home.intro} />
        <SelectedProjects lang={lang} dict={dict.selected} projects={getFeaturedProjects()} />
        <FilmStrip lang={lang} dict={dict.strip} items={home.filmStrip} />
        <LineToLight lang={lang} dict={dict.lineToLight} images={home.lineToLight} />
        <Rooms lang={lang} dict={dict.rooms} rooms={home.rooms} />
        <Services lang={lang} dict={dict.services} images={home.services} />
        <Built dict={dict.built} />
        <Faq dict={dict.faq} />
      </main>
    </>
  );
}
