import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Section } from "@/components/ui/Section";
import { TextLink } from "@/components/ui/TextLink";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import type { Dictionary } from "@/lib/schemas/dictionary";
import type { Project } from "@/lib/schemas/project";
import { ProjectCard } from "./ProjectCard";

type SelectedProjectsProps = { lang: Locale; dict: Dictionary["selected"]; projects: Project[] };

export function SelectedProjects({ lang, dict, projects }: SelectedProjectsProps) {
  return (
    <Section id="projects">
      <Container className="flex flex-col gap-14">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Heading size="h2" variant="thin">
            {dict.title}
          </Heading>
          <TextLink href={localizedPath(lang, "/projects")}>{dict.viewAll}</TextLink>
        </div>
        <div className="grid grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-3 lg:gap-y-16">
          {projects.map((project, index) => (
            <ProjectCard
              key={project.slug}
              project={project}
              lang={lang}
              size={index < 2 ? "large" : "small"}
              className={index === 0 ? "sm:col-span-2" : undefined}
            />
          ))}
        </div>
      </Container>
    </Section>
  );
}
