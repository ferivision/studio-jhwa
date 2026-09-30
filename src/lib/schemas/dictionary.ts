import { z } from "zod";
import { text as s } from "./common";

const titled = z.strictObject({ title: s, body: s });
const meta = z.strictObject({ title: s, description: s });

export const dictionarySchema = z.strictObject({
  meta: z.strictObject({
    home: meta,
    projects: meta,
    /** Templates: {name}, {type}, {city}. */
    project: meta.extend({ descriptionNoCity: s }),
    ogAlt: s,
  }),
  a11y: z.strictObject({ skipToContent: s, mainNav: s, openMenu: s, closeMenu: s, menu: s }),
  nav: z.strictObject({ projects: s, services: s, rooms: s, faq: s, cta: s }),
  lang: z.strictObject({ en: s, id: s }),
  hero: z.strictObject({ eyebrow: s, line1: s, line2: s, primary: s, secondary: s }),
  intro: z.strictObject({ lead: s, leadEm: s, body: s, tag: s }),
  selected: z.strictObject({ title: s, viewAll: s }),
  strip: z.strictObject({ label: s, title: s, viewAll: s }),
  lineToLight: z.strictObject({ title: s, body: s, label: s, render: s, drawing: s }),
  rooms: z.strictObject({ label: s, living: s, kitchen: s, workspace: s, kids: s }),
  services: z.strictObject({ title: s, lead: s, design: titled, visualize: titled, build: titled }),
  built: z.strictObject({
    title: s,
    lead: s,
    before: s,
    after: s,
    beforePlaceholder: s,
    afterPlaceholder: s,
    quote: s,
    cite: s,
  }),
  faq: z.strictObject({ title: s, items: z.array(z.strictObject({ q: s, a: s })).min(1) }),
  contact: z.strictObject({
    line1: s,
    line2: s,
    cta: s,
    whatsapp: s,
    email: s,
    instagram: s,
    studio: s,
    studioValue: s,
  }),
  footer: z.strictObject({ tagline: s }),
  projectsPage: z.strictObject({
    title1: s,
    title2: s,
    lead: s,
    filterLabel: s,
    filters: z.strictObject({ all: s, house: s, bedroom: s, kids: s }),
    /** Template: {count}. */
    resultCount: s,
    empty: s,
  }),
  project: z.strictObject({
    back: s,
    location: s,
    type: s,
    area: s,
    scope: s,
    duration: s,
    year: s,
    brief: s,
    approach: s,
    drawing: s,
    finished: s,
    next: s,
    detail: s,
  }),
  notFound: z.strictObject({ title: s, body: s, home: s }),
  breadcrumb: z.strictObject({ home: s, projects: s }),
});
export type Dictionary = z.infer<typeof dictionarySchema>;
