import { z } from "zod";

/** Values awaiting real data contain a bracketed token, e.g. "[PLACEHOLDER]", "[City]". */
export const PLACEHOLDER_PATTERN = /\[[^\]]+\]/;
export const isPlaceholder = (value: string): boolean => PLACEHOLDER_PATTERN.test(value);
export const placeholder = z.string().regex(/^\[[^\]]+\]$/, "must be a [PLACEHOLDER] token");

export const text = z.string().trim().min(1);
export const localized = z.strictObject({ en: text, id: text });
export type Localized = z.infer<typeof localized>;

export const imagePath = z
  .string()
  .regex(
    /^\/images\/[a-z0-9/_-]+\.(jpe?g|png|webp|avif)$/,
    "must be a path under /images/, e.g. /images/projects/rh-house/cover.jpg",
  );

export const imageContent = z.strictObject({
  src: imagePath,
  alt: localized,
  position: z
    .string()
    .regex(/^\d{1,3}% \d{1,3}%$/, 'must look like "50% 40%"')
    .optional(),
});
export type ImageContent = z.infer<typeof imageContent>;
