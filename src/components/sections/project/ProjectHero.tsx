import { CoveLight } from "@/components/ui/CoveLight";
import { Photo } from "@/components/ui/Photo";
import { pick, type Locale } from "@/lib/i18n/locales";
import type { ImageContent } from "@/lib/schemas/common";

export function ProjectHero({ image, lang }: { image: ImageContent; lang: Locale }) {
  return (
    <section className="relative h-[60svh] min-h-[360px] overflow-hidden bg-charcoal md:h-[760px]">
      <Photo
        src={image.src}
        alt={pick(image.alt, lang)}
        position={image.position}
        sizes="100vw"
        priority
      />
      <CoveLight className="top-0" />
    </section>
  );
}
