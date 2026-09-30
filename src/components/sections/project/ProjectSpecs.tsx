import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Section } from "@/components/ui/Section";
import { TextLink } from "@/components/ui/TextLink";
import { localizedPath, pick, type Locale } from "@/lib/i18n/locales";
import type { Dictionary } from "@/lib/schemas/dictionary";
import type { Project } from "@/lib/schemas/project";

type ProjectSpecsProps = { project: Project; lang: Locale; dict: Dictionary["project"] };

export function ProjectSpecs({ project, lang, dict }: ProjectSpecsProps) {
  const specs = [
    [dict.location, project.city],
    [dict.type, pick(project.type, lang)],
    [dict.area, project.area],
    [dict.scope, pick(project.scope, lang)],
    [dict.duration, pick(project.duration, lang)],
    [dict.year, project.year],
  ] as const;
  return (
    <Section>
      <Container className="flex flex-col justify-between gap-12 lg:flex-row lg:gap-24">
        <div className="flex max-w-[700px] flex-col gap-6">
          <TextLink
            href={localizedPath(lang, "/projects")}
            className="self-start text-base text-muted"
          >
            {dict.back}
          </TextLink>
          <Heading as="h1" size="display-lg" variant="thin">
            {project.name}
          </Heading>
          <p className="text-summary font-medium italic">{pick(project.summary, lang)}</p>
        </div>
        <dl className="grid w-full grid-cols-[120px_minmax(0,1fr)] content-start gap-x-6 gap-y-4 text-body lg:w-[400px] lg:shrink-0 lg:pt-10">
          {specs.map(([term, value]) => (
            <div key={term} className="contents">
              <dt className="text-muted">{term}</dt>
              <dd className="m-0">{value}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </Section>
  );
}
