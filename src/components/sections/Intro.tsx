import { Container } from "@/components/ui/Container";
import { Photo } from "@/components/ui/Photo";
import { Section } from "@/components/ui/Section";
import { pick, type Locale } from "@/lib/i18n/locales";
import type { Dictionary } from "@/lib/schemas/dictionary";
import type { Home } from "@/lib/schemas/home";

type IntroProps = { lang: Locale; dict: Dictionary["intro"]; images: Home["intro"] };

export function Intro({ lang, dict, images }: IntroProps) {
  return (
    <Section>
      <Container className="flex flex-col justify-between gap-14 xl:flex-row xl:gap-24">
        <div className="flex max-w-prose flex-col gap-7 xl:pt-10">
          <p className="text-lead font-light">
            {dict.lead} <span className="font-semibold italic">{dict.leadEm}</span>
          </p>
          <p className="text-body-lg text-muted">{dict.body}</p>
          <p className="flex items-center gap-3 text-body font-medium text-ink">
            <span aria-hidden="true" className="h-px w-8 bg-oak" />
            {dict.tag}
          </p>
        </div>
        <div className="relative aspect-[620/520] w-full max-w-[620px] shrink-0">
          <Photo
            src={images.primary.src}
            alt={pick(images.primary.alt, lang)}
            sizes="(min-width: 1280px) 400px, 65vw"
            className="absolute top-0 left-0 h-[85%] w-[65%]"
          />
          <Photo
            src={images.secondary.src}
            alt={pick(images.secondary.alt, lang)}
            sizes="(min-width: 1280px) 280px, 45vw"
            className="absolute right-0 bottom-0 h-[65%] w-[45%] ring-[12px] ring-plaster"
          />
        </div>
      </Container>
    </Section>
  );
}
