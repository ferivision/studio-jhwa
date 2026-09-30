import Link from "next/link";
import { Photo } from "@/components/ui/Photo";
import { cn } from "@/lib/cn";
import { localizedPath, pick, type Locale } from "@/lib/i18n/locales";
import type { Project } from "@/lib/schemas/project";

const heights = {
  large: "h-[300px] sm:h-[360px] lg:h-[520px]",
  small: "h-[300px] sm:h-[360px] lg:h-[320px]",
} as const;

type ProjectCardProps = {
  project: Project;
  lang: Locale;
  size: keyof typeof heights;
  className?: string;
};

export function ProjectCard({ project, lang, size, className }: ProjectCardProps) {
  return (
    <Link
      href={localizedPath(lang, `/projects/${project.slug}`)}
      className={cn("group flex flex-col gap-4.5 no-underline", className)}
    >
      <Photo
        src={project.cover.src}
        alt={pick(project.cover.alt, lang)}
        position={project.cover.position}
        sizes={
          size === "large"
            ? "(min-width: 1024px) 66vw, 100vw"
            : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        }
        className={cn("relative w-full", heights[size])}
      />
      <span className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
        <span className="text-card group-hover:text-oak">{project.name}</span>
        <span className="text-small text-muted">
          {pick(project.type, lang)}, {project.city}
        </span>
      </span>
    </Link>
  );
}
