import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Section } from "@/components/ui/Section";
import { pick, type Locale } from "@/lib/i18n/locales";
import type { Dictionary } from "@/lib/schemas/dictionary";
import type { Project } from "@/lib/schemas/project";

type ProjectStoryProps = { project: Project; lang: Locale; dict: Dictionary["project"] };

export function ProjectStory({ project, lang, dict }: ProjectStoryProps) {
  const blocks = [
    { title: dict.brief, body: pick(project.brief, lang) },
    { title: dict.approach, body: pick(project.approach, lang) },
  ];
  return (
    <Section tone="stone">
      <Container className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-x-24">
        {blocks.map((block) => (
          <div key={block.title} className="flex flex-col gap-4.5">
            <Heading size="h3" variant="thin">
              {block.title}
            </Heading>
            <p className="text-body-lg text-muted-strong">{block.body}</p>
          </div>
        ))}
      </Container>
    </Section>
  );
}
