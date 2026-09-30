import { z } from "zod";

const envSchema = z
  .object({
    NEXT_PUBLIC_SITE_URL: z
      .url({ message: "NEXT_PUBLIC_SITE_URL must be an absolute URL, e.g. https://studiojhwa.com" })
      .optional(),
    SITE_ENV: z
      .enum(["development", "preview", "production"], {
        message: "SITE_ENV must be development, preview or production",
      })
      .default("development"),
  })
  .superRefine((value, ctx) => {
    if (value.SITE_ENV === "production" && !value.NEXT_PUBLIC_SITE_URL) {
      ctx.addIssue({
        code: "custom",
        path: ["NEXT_PUBLIC_SITE_URL"],
        message: 'NEXT_PUBLIC_SITE_URL is required when SITE_ENV is "production"',
      });
    }
  })
  .transform((value) => ({
    NEXT_PUBLIC_SITE_URL: (value.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
      /\/+$/,
      "",
    ),
    SITE_ENV: value.SITE_ENV,
  }));

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
