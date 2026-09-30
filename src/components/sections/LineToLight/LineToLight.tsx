import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Section } from "@/components/ui/Section";
import { pick, type Locale } from "@/lib/i18n/locales";
import type { Dictionary } from "@/lib/schemas/dictionary";
import type { Home } from "@/lib/schemas/home";
import { Slider } from "./Slider";

type LineToLightProps = {
  lang: Locale;
  dict: Dictionary["lineToLight"];
  images: Home["lineToLight"];
};

export function LineToLight({ lang, dict, images }: LineToLightProps) {
  return (
    <Section tone="charcoal">
      <Container>
        <Slider
          drawing={{ src: images.drawing.src, alt: pick(images.drawing.alt, lang) }}
          render={{ src: images.render.src, alt: pick(images.render.alt, lang) }}
          labels={{ label: dict.label, render: dict.render, drawing: dict.drawing }}
        >
          <Heading size="h2-em" variant="boldItalic">
            {dict.title}
          </Heading>
          <p className="text-body-lg text-mist">{dict.body}</p>
        </Slider>
      </Container>
    </Section>
  );
}
