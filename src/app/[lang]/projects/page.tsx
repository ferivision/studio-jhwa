import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { ProjectFilter } from "@/components/sections/ProjectFilter";
import { ProjectRow } from "@/components/sections/ProjectList";
import { Container } from "@/components/ui/Container";
import { Heading, HeadingEm, HeadingThin } from "@/components/ui/Heading";
import { getDictionary, getProjects } from "@/lib/content";
import { isLocale } from "@/lib/i18n/locales";
import { buildMetadata } from "@/lib/seo/metadata";
import { categories } from "@/lib/schemas/project";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const { meta } = getDictionary(lang);
  return buildMetadata({
    lang,
    path: "/projects",
    title: meta.projects.title,
    description: meta.projects.description,
  });
}

export default async function ProjectsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const page = dict.projectsPage;
  const filters = [
    { value: "all" as const, label: page.filters.all },
    ...categories.map((c) => ({ value: c, label: page.filters[c] })),
  ];
  const rows = getProjects().map((project) => ({
    key: project.slug,
    category: project.category,
    node: <ProjectRow project={project} lang={lang} />,
  }));
  return (
    <>
      <Header lang={lang} dict={dict} variant="solid" />
      <main id="main" tabIndex={-1} className="pt-section pb-section">
        <Container className="flex flex-col gap-10">
          <div className="flex flex-wrap items-end justify-between gap-8">
            <Heading as="h1" size="display-lg">
              <HeadingThin>{page.title1} </HeadingThin>
              <HeadingEm>{page.title2}</HeadingEm>
            </Heading>
            <p className="max-w-[460px] text-body-lg text-muted">{page.lead}</p>
          </div>
          <ProjectFilter
            filters={filters}
            rows={rows}
            labels={{
              group: page.filterLabel,
              resultCount: page.resultCount,
              empty: page.empty,
            }}
          />
        </Container>
      </main>
    </>
  );
}
