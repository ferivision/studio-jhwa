import { ContactCta } from "@/components/sections/ContactCta";
import { Container } from "@/components/ui/Container";
import type { Dictionary } from "@/lib/schemas/dictionary";
import type { Site } from "@/lib/schemas/site";

export function Footer({ dict, site }: { dict: Dictionary; site: Site }) {
  return (
    <footer>
      <ContactCta dict={dict.contact} site={site} />
      <div className="theme-dark bg-deep text-dim">
        <Container className="flex min-h-20 flex-col justify-center gap-1 py-4 text-caption sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {new Date().getFullYear()} {site.name}
          </span>
          <span className="font-light italic">{dict.footer.tagline}</span>
        </Container>
      </div>
    </footer>
  );
}
