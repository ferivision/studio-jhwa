import { z } from "zod";
import { localized, placeholder, text } from "./common";

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'must be "HH:MM"');
const day = z.enum(["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]);

export const siteSchema = z.strictObject({
  name: text,
  legalName: text,
  tagline: text,
  description: localized,
  contact: z.strictObject({
    whatsapp: z.union([
      placeholder,
      z
        .string()
        .regex(
          /^62\d{8,13}$/,
          "WhatsApp must be digits in international format, e.g. 6281234567890",
        ),
    ]),
    email: z.union([placeholder, z.email()]),
  }),
  address: z.strictObject({
    street: text,
    city: text,
    region: text,
    postalCode: z.union([
      placeholder,
      z.string().regex(/^\d{5}$/, "must be a 5-digit postal code"),
    ]),
    country: z.literal("ID"),
    geo: z
      .strictObject({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) })
      .optional(),
  }),
  serviceAreas: z.array(text).min(1),
  socials: z.array(z.strictObject({ platform: z.enum(["instagram"]), handle: text, url: z.url() })),
  businessHours: z.array(
    z.strictObject({
      days: z.union([placeholder, z.array(day).min(1)]),
      opens: z.union([placeholder, time]),
      closes: z.union([placeholder, time]),
    }),
  ),
});
export type Site = z.infer<typeof siteSchema>;
