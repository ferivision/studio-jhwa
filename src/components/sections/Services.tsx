import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Photo } from "@/components/ui/Photo";
import { Section } from "@/components/ui/Section";
import { pick, type Locale } from "@/lib/i18n/locales";
import type { Dictionary } from "@/lib/schemas/dictionary";
import type { Home } from "@/lib/schemas/home";

const order = ["design", "visualize", "build"] as const;

type ServicesProps = { lang: Locale; dict: Dictionary["services"]; images: Home["services"] };

export function Services({ lang, dict, images }: ServicesProps) {
  return (
    <Section tone="stone" id="services">
      <Container className="flex flex-col gap-16">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Heading size="h2" variant="thin">
            {dict.title}
          </Heading>
          <p className="max-w-[460px] text-body-lg text-muted-strong">{dict.lead}</p>
        </div>
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-3 lg:gap-x-12">
          {order.map((key) => (
            <div key={key} className="flex flex-col gap-4.5">
              <Photo
                src={images[key].src}
                alt={pick(images[key].alt, lang)}
                sizes="(min-width: 1024px) 33vw, 100vw"
                className="relative h-[360px] w-full"
              />
              <div aria-hidden="true" className="mt-2.5 h-px bg-oak" />
              <Heading as="h3" size="service" variant="boldItalic">
                {dict[key].title}
              </Heading>
              <p className="text-body text-muted-strong">{dict[key].body}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
