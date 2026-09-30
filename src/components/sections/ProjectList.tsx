import Link from "next/link";
import { Photo } from "@/components/ui/Photo";
import { localizedPath, pick, type Locale } from "@/lib/i18n/locales";
import type { Project } from "@/lib/schemas/project";

type ProjectRowProps = { project: Project; lang: Locale };

export function ProjectRow({ project, lang }: ProjectRowProps) {
  return (
    <Link
      data-project-row
      href={localizedPath(lang, `/projects/${project.slug}`)}
      className="group flex flex-col items-start gap-5 border-t border-line py-8 no-underline md:min-h-[380px] md:flex-row md:items-center md:gap-12 md:py-0"
    >
      <span className="grow text-list font-light group-hover:text-oak">{project.name}</span>
      <span className="flex flex-col gap-1.5 text-base text-muted md:w-[260px]">
        <span>{pick(project.type, lang)}</span>
        <span>
          {project.city}, {project.year}
        </span>
        <span>{pick(project.scope, lang)}</span>
      </span>
      <Photo
        src={project.cover.src}
        alt={pick(project.cover.alt, lang)}
        position={project.cover.position}
        sizes="(min-width: 1280px) 560px, (min-width: 768px) 380px, 100vw"
        className="relative order-first aspect-video w-full shrink-0 md:order-none md:aspect-auto md:h-[214px] md:w-[380px] xl:h-[316px] xl:w-[560px]"
      />
    </Link>
  );
}
