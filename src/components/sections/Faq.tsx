import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Section } from "@/components/ui/Section";
import type { Dictionary } from "@/lib/schemas/dictionary";

export function Faq({ dict }: { dict: Dictionary["faq"] }) {
  return (
    <Section tone="stone" id="faq">
      <Container className="flex flex-col gap-14">
        <Heading size="h2" variant="thin">
          {dict.title}
        </Heading>
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-x-16">
          {dict.items.map((item) => (
            <div key={item.q} className="flex flex-col gap-3 border-t border-oak pt-6">
              <h3 className="m-0 text-faq font-medium">{item.q}</h3>
              <p className="max-w-[540px] text-body text-muted-strong">{item.a}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
