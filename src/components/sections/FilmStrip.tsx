import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Section } from "@/components/ui/Section";
import { TextLink } from "@/components/ui/TextLink";
import { cn } from "@/lib/cn";
import { localizedPath, pick, type Locale } from "@/lib/i18n/locales";
import type { Dictionary } from "@/lib/schemas/dictionary";
import type { Home } from "@/lib/schemas/home";

type FilmStripProps = { lang: Locale; dict: Dictionary["strip"]; items: Home["filmStrip"] };

export function FilmStrip({ lang, dict, items }: FilmStripProps) {
  // Two copies make the -50% translate loop seamless; the copy is hidden from AT and under reduced motion.
  const loop = [...items, ...items];
  return (
    <Section tone="deep" aria-label={dict.label} className="overflow-hidden">
      <Container className="flex flex-wrap items-end justify-between gap-6">
        <Heading size="h2-em" variant="boldItalic">
          {dict.title}
        </Heading>
        <TextLink href={localizedPath(lang, "/projects")} tone="light">
          {dict.viewAll}
        </TextLink>
      </Container>
      <div className="mt-12 overflow-hidden">
        <div
          data-film-strip
          className="flex w-max animate-strip gap-4 hover:[animation-play-state:paused] motion-reduce:w-auto motion-reduce:flex-wrap motion-reduce:px-gutter"
        >
          {loop.map((item, index) => {
            const duplicate = index >= items.length;
            return (
              <div
                key={`${item.src}-${index}`}
                aria-hidden={duplicate || undefined}
                className={cn(
                  "relative h-60 shrink-0 md:h-90",
                  duplicate && "motion-reduce:hidden",
                )}
                style={{ aspectRatio: item.ratio }}
              >
                <Image
                  src={item.src}
                  alt={duplicate ? "" : pick(item.alt, lang)}
                  fill
                  sizes="(min-width: 768px) 500px, 340px"
                  className="object-cover"
                />
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
