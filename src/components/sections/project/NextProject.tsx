import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import type { Project } from "@/lib/schemas/project";

export function NextProject({
  project,
  lang,
  label,
}: {
  project: Project;
  lang: Locale;
  label: string;
}) {
  return (
    <section className="theme-dark bg-deep py-section text-plaster">
      <Container className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <span className="text-body text-dim">{label}</span>
        <Link
          href={localizedPath(lang, `/projects/${project.slug}`)}
          className="text-display-lg font-semibold italic no-underline hover:text-glow"
        >
          {project.name}
        </Link>
      </Container>
    </section>
  );
}
