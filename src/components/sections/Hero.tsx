import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { CoveLight } from "@/components/ui/CoveLight";
import { Heading, HeadingEm, HeadingThin } from "@/components/ui/Heading";
import { Photo } from "@/components/ui/Photo";
import { TextLink } from "@/components/ui/TextLink";
import { localizedPath, pick, type Locale } from "@/lib/i18n/locales";
import type { ImageContent } from "@/lib/schemas/common";
import type { Dictionary } from "@/lib/schemas/dictionary";

type HeroProps = { lang: Locale; dict: Dictionary["hero"]; image: ImageContent };

export function Hero({ lang, dict, image }: HeroProps) {
  return (
    <section
      id="top"
      className="theme-dark relative flex h-svh max-h-[900px] min-h-[640px] items-end overflow-hidden bg-charcoal text-plaster"
    >
      <Photo
        src={image.src}
        alt={pick(image.alt, lang)}
        position={image.position}
        sizes="100vw"
        priority
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-[70%] bg-linear-to-b from-deep/0 to-deep/85"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-44 bg-linear-to-b from-deep/70 to-deep/0"
      />
      <CoveLight className="top-header-sm md:top-header" />
      <Container className="relative flex flex-wrap items-end justify-between gap-x-16 gap-y-10 pb-12 md:pb-24">
        <div className="flex flex-col gap-7">
          <p className="text-body text-mist">{dict.eyebrow}</p>
          <Heading as="h1" size="display-xl">
            <HeadingThin>{dict.line1}</HeadingThin>
            <br />
            <HeadingEm>{dict.line2}</HeadingEm>
          </Heading>
        </div>
        <div className="flex shrink-0 flex-col items-start gap-5 md:items-end">
          <Button href={localizedPath(lang, "/projects")} variant="glow">
            {dict.primary}
          </Button>
          <TextLink href="#contact" tone="light">
            {dict.secondary}
          </TextLink>
        </div>
      </Container>
    </section>
  );
}
