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
import { getDictionary, getNextProject, getProject, getProjects } from "@/lib/content";
import { isLocale } from "@/lib/i18n/locales";

export const dynamicParams = false;

export function generateStaticParams() {
  return getProjects().map((project) => ({ slug: project.slug }));
}

type ProjectPageProps = { params: Promise<{ lang: string; slug: string }> };

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { lang, slug } = await params;
  const project = getProject(slug);
  if (!isLocale(lang) || !project) notFound();
  const dict = getDictionary(lang);
  return (
    <>
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
