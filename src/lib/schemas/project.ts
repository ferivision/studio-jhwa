import { z } from "zod";
import { imageContent, localized, placeholder, text } from "./common";

export const categories = ["house", "bedroom", "kids"] as const;
export const categorySchema = z.enum(categories);
export type Category = z.infer<typeof categorySchema>;

export const projectSchema = z.strictObject({
  slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "must be kebab-case"),
  name: text,
  category: categorySchema,
  type: localized,
  city: text,
  year: z.union([placeholder, z.string().regex(/^\d{4}$/, "must be a 4-digit year")]),
  area: text,
  duration: localized,
  scope: localized,
  summary: localized,
  brief: localized,
  approach: localized,
  cover: imageContent,
  gallery: z.array(imageContent),
  drawing: z.strictObject({ drawing: imageContent, render: imageContent }).optional(),
  featured: z.boolean(),
  order: z.number().int().positive(),
});
export type Project = z.infer<typeof projectSchema>;
