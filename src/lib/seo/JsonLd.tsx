import { serializeJsonLd } from "./structured-data";

/** The only allowed use of dangerouslySetInnerHTML (CLAUDE.md §7): input is our own data, `<` is escaped. */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
