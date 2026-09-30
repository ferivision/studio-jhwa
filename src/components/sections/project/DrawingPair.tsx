import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Photo } from "@/components/ui/Photo";
import { Section } from "@/components/ui/Section";
import { pick, type Locale } from "@/lib/i18n/locales";
import type { Project } from "@/lib/schemas/project";

type DrawingPairProps = {
  pair: Project["drawing"];
  lang: Locale;
  labels: { title: string; drawing: string; finished: string };
};

export function DrawingPair({ pair, lang, labels }: DrawingPairProps) {
  if (!pair) return null;
  const figures = [
    { image: pair.drawing, caption: labels.drawing, bg: "bg-paper" },
    { image: pair.render, caption: labels.finished, bg: "" },
  ];
  return (
    <Section tone="charcoal">
      <Container className="flex flex-col gap-12">
        <Heading size="h2-em" variant="boldItalic">
          {labels.title}
        </Heading>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {figures.map(({ image, caption, bg }) => (
            <figure key={image.src} className="m-0 flex flex-col gap-3.5">
              <Photo
                src={image.src}
                alt={pick(image.alt, lang)}
                sizes="(min-width: 768px) 50vw, 100vw"
                className={`relative h-[clamp(360px,39vw,560px)] w-full ${bg}`}
              />
              <figcaption className="text-base text-mist">{caption}</figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </Section>
  );
}
