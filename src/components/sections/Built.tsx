import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Section } from "@/components/ui/Section";
import type { Dictionary } from "@/lib/schemas/dictionary";

export function Built({ dict }: { dict: Dictionary["built"] }) {
  const panels = [
    {
      caption: dict.before,
      label: dict.beforePlaceholder,
      classes: "stripes-light text-muted-strong",
    },
    { caption: dict.after, label: dict.afterPlaceholder, classes: "stripes-dark text-mist" },
  ];
  return (
    <Section>
      <Container className="flex flex-col gap-14">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Heading size="h2-em" variant="boldItalic">
            {dict.title}
          </Heading>
          <p className="max-w-[460px] text-body-lg text-muted">{dict.lead}</p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {panels.map((panel) => (
            <figure key={panel.caption} className="m-0 flex flex-col gap-3.5">
              <div
                role="img"
                aria-label={panel.label}
                className={`flex h-[280px] items-end p-5 md:h-[440px] ${panel.classes}`}
              >
                <span className="text-caption">{panel.label}</span>
              </div>
              <figcaption className="text-body">{panel.caption}</figcaption>
            </figure>
          ))}
        </div>
        <blockquote className="m-0 grid grid-cols-1 gap-6 border-t border-line pt-10 md:grid-cols-2 md:gap-8">
          <p className="text-quote font-light italic">“{dict.quote}”</p>
          <footer className="self-end text-body text-muted">{dict.cite}</footer>
        </blockquote>
      </Container>
    </Section>
  );
}
