import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z
    .url({ message: "NEXT_PUBLIC_SITE_URL must be an absolute URL, e.g. https://studiojhwa.com" })
    .default("http://localhost:3000")
    .transform((url) => url.replace(/\/+$/, "")),
  SITE_ENV: z
    .enum(["development", "preview", "production"], {
      message: "SITE_ENV must be development, preview or production",
    })
    .default("development"),
});

export type Env = z.infer<typeof envSchema>;

export function parseEnv(source: Record<string, string | undefined>): Env {
  const result = envSchema.safeParse({
    // Hosting dashboards may set a variable to ""; treat that as unset.
    NEXT_PUBLIC_SITE_URL: source.NEXT_PUBLIC_SITE_URL || undefined,
    SITE_ENV: source.SITE_ENV || undefined,
  });
  if (!result.success) throw new Error(`Invalid environment:\n${z.prettifyError(result.error)}`);
  return result.data;
}

/** The only place in the app that reads process.env. */
export const env = parseEnv(process.env);
