import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { DrawingPair } from "@/components/sections/project/DrawingPair";
import { NextProject } from "@/components/sections/project/NextProject";
import {
  ProjectDetailImage,
  ProjectGalleryLead,
  ProjectGalleryRest,
} from "@/components/sections/project/ProjectGallery";
import { ProjectHero } from "@/components/sections/project/ProjectHero";
import { ProjectSpecs } from "@/components/sections/project/ProjectSpecs";
import { ProjectStory } from "@/components/sections/project/ProjectStory";
import { env } from "@/config/env";
import { getDictionary, getNextProject, getProject, getProjects } from "@/lib/content";
import { format } from "@/lib/i18n/format";
import { isPlaceholder } from "@/lib/schemas/common";
import { isLocale, pick } from "@/lib/i18n/locales";
import { JsonLd } from "@/lib/seo/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo/structured-data";
import { buildMetadata } from "@/lib/seo/metadata";

export const dynamicParams = false;

export function generateStaticParams() {
  return getProjects().map((project) => ({ slug: project.slug }));
}

type ProjectPageProps = { params: Promise<{ lang: string; slug: string }> };

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { lang, slug } = await params;
  const project = getProject(slug);
  if (!isLocale(lang) || !project) notFound();
  const { meta } = getDictionary(lang);
  return buildMetadata({
    lang,
    path: `/projects/${slug}`,
    title: format(meta.project.title, { name: project.name }),
    description: isPlaceholder(project.city)
      ? format(meta.project.descriptionNoCity, {
          name: project.name,
          type: pick(project.type, lang),
        })
      : format(meta.project.description, {
          name: project.name,
          type: pick(project.type, lang),
          city: project.city,
        }),
  });
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { lang, slug } = await params;
  const project = getProject(slug);
  if (!isLocale(lang) || !project) notFound();
  const dict = getDictionary(lang);
  const base = `${env.NEXT_PUBLIC_SITE_URL}/${lang}`;
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: dict.breadcrumb.home, url: base },
          { name: dict.breadcrumb.projects, url: `${base}/projects` },
          { name: project.name, url: `${base}/projects/${project.slug}` },
        ])}
      />
      <Header lang={lang} dict={dict} variant="solid" />
      <main id="main" tabIndex={-1}>
        <ProjectHero image={project.cover} lang={lang} />
        <ProjectSpecs project={project} lang={lang} dict={dict.project} />
        <ProjectStory project={project} lang={lang} dict={dict.project} />
        <ProjectGalleryLead images={project.gallery} lang={lang} />
        <DrawingPair
          pair={project.drawing}
          lang={lang}
          labels={{
            title: dict.lineToLight.title,
            drawing: dict.project.drawing,
            finished: dict.project.finished,
          }}
        />
        <ProjectDetailImage image={project.gallery[3]} lang={lang} label={dict.project.detail} />
        <ProjectGalleryRest images={project.gallery} lang={lang} />
        <NextProject project={getNextProject(slug)} lang={lang} label={dict.project.next} />
      </main>
    </>
  );
}
