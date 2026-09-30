import { Button } from "@/components/ui/Button";
import { CoveLight } from "@/components/ui/CoveLight";
import { Container } from "@/components/ui/Container";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { Heading, HeadingEm, HeadingThin } from "@/components/ui/Heading";
import { Section } from "@/components/ui/Section";
import { emailHref, primaryContact, whatsappHref } from "@/lib/content";
import type { Dictionary } from "@/lib/schemas/dictionary";
import type { Site } from "@/lib/schemas/site";

export function ContactCta({ dict, site }: { dict: Dictionary["contact"]; site: Site }) {
  const wa = whatsappHref(site);
  const mail = emailHref(site);
  const primary = primaryContact(site);
  const instagram = site.socials.find((s) => s.platform === "instagram");
  return (
    <Section tone="charcoal" id="contact">
      <CoveLight className="top-0" />
      <Container className="flex flex-col justify-between gap-16 lg:flex-row lg:gap-24">
        <div className="flex max-w-[680px] flex-col gap-8">
          <Heading size="h2">
            <HeadingThin>{dict.line1}</HeadingThin>
            <br />
            <HeadingEm>{dict.line2}</HeadingEm>
          </Heading>
          {primary && (
            <Button href={primary.href} variant="glow" className="self-start">
              {primary.kind === "whatsapp" ? dict.cta : dict.ctaInstagram}
            </Button>
          )}
        </div>
        <dl className="grid w-full grid-cols-[120px_minmax(0,1fr)] content-start gap-6 text-body-lg lg:w-[420px] lg:shrink-0">
          <dt className="text-dim">{dict.whatsapp}</dt>
          <dd className="m-0">
            {wa ? (
              <ExternalLink href={wa} className="inline-flex min-h-11 items-center">
                +{site.contact.whatsapp}
              </ExternalLink>
            ) : (
              site.contact.whatsapp
            )}
          </dd>
          <dt className="text-dim">{dict.email}</dt>
          <dd className="m-0">
            {mail ? (
              <a href={mail} className="inline-flex min-h-11 items-center">
                {site.contact.email}
              </a>
            ) : (
              site.contact.email
            )}
          </dd>
          {instagram && (
            <>
              <dt className="text-dim">{dict.instagram}</dt>
              <dd className="m-0">
                <ExternalLink
                  href={instagram.url}
                  className="inline-flex min-h-11 items-center underline underline-offset-5 hover:text-glow"
                >
                  {instagram.handle}
                </ExternalLink>
              </dd>
            </>
          )}
          <dt className="text-dim">{dict.studio}</dt>
          <dd className="m-0">{dict.studioValue}</dd>
        </dl>
      </Container>
    </Section>
  );
}
