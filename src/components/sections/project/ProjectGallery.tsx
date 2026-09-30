import { Container } from "@/components/ui/Container";
import { Photo } from "@/components/ui/Photo";
import { Section } from "@/components/ui/Section";
import { pick, type Locale } from "@/lib/i18n/locales";
import type { ImageContent } from "@/lib/schemas/common";

type GalleryProps = { images: ImageContent[]; lang: Locale };

function Img({
  image,
  lang,
  sizes,
  className,
}: {
  image: ImageContent;
  lang: Locale;
  sizes: string;
  className: string;
}) {
  return (
    <Photo
      src={image.src}
      alt={pick(image.alt, lang)}
      position={image.position}
      sizes={sizes}
      className={`relative w-full ${className}`}
    />
  );
}

/** gallery[0..2]: one wide image, then a pair. */
export function ProjectGalleryLead({ images, lang }: GalleryProps) {
  const [wide, ...pair] = images.slice(0, 3);
  if (!wide) return null;
  return (
    <Section data-gallery>
      <Container className="flex flex-col gap-8">
        <Img image={wide} lang={lang} sizes="100vw" className="h-[clamp(320px,44vw,640px)]" />
        {pair.length > 0 && (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            {pair.map((image) => (
              <Img
                key={image.src}
                image={image}
                lang={lang}
                sizes="(min-width: 640px) 50vw, 100vw"
                className="h-[clamp(280px,33vw,480px)]"
              />
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}

/** gallery[3]: full-bleed detail image. */
export function ProjectDetailImage({
  image,
  lang,
  label,
}: {
  image: ImageContent | undefined;
  lang: Locale;
  label: string;
}) {
  if (!image) return null;
  return (
    <section
      data-gallery
      aria-label={label}
      className="relative h-[clamp(360px,50vw,720px)] overflow-hidden"
    >
      <Photo src={image.src} alt={pick(image.alt, lang)} position={image.position} sizes="100vw" />
    </section>
  );
}

/** gallery[4..]: pairs at 2fr / 3fr. */
export function ProjectGalleryRest({ images, lang }: GalleryProps) {
  const rest = images.slice(4);
  if (rest.length === 0) return null;
  return (
    <Section data-gallery>
      <Container className="grid grid-cols-1 gap-8 md:grid-cols-[2fr_3fr]">
        {rest.map((image) => (
          <Img
            key={image.src}
            image={image}
            lang={lang}
            sizes="(min-width: 768px) 60vw, 100vw"
            className="h-[clamp(320px,40vw,580px)]"
          />
        ))}
      </Container>
    </Section>
  );
}
