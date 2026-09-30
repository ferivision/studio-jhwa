import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Button } from "@/components/ui/Button";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { Heading, HeadingEm, HeadingThin } from "@/components/ui/Heading";
import { CoveLight } from "@/components/ui/CoveLight";

describe("ui primitives", () => {
  it("Heading renders the requested level with token classes", () => {
    const html = renderToStaticMarkup(
      <Heading as="h1" size="display-xl">
        <HeadingThin>Formed by flow,</HeadingThin>
        <HeadingEm>built on principles.</HeadingEm>
      </Heading>,
    );
    expect(html).toMatch(/^<h1 class="[^"]*text-display-xl/);
    expect(html).toContain('<span class="font-light">Formed by flow,</span>');
    expect(html).toContain('<span class="font-semibold italic">built on principles.</span>');
  });

  it("Button opens external links safely", () => {
    const html = renderToStaticMarkup(
      <Button href="https://wa.me/620000" variant="glow">
        Chat
      </Button>,
    );
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it("Button keeps internal links in the same tab", () => {
    const html = renderToStaticMarkup(
      <Button href="/en/projects" variant="outline">
        Projects
      </Button>,
    );
    expect(html).not.toContain("target=");
  });

  it("ExternalLink always sets rel", () => {
    expect(
      renderToStaticMarkup(
        <ExternalLink href="https://instagram.com/studio.jhwa">IG</ExternalLink>,
      ),
    ).toContain('rel="noopener noreferrer"');
  });

  it("CoveLight is hidden from assistive tech", () => {
    expect(renderToStaticMarkup(<CoveLight />)).toContain('aria-hidden="true"');
  });
});
