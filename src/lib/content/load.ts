import "server-only";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { ContentError } from "./errors";

export const CONTENT_DIR = path.join(process.cwd(), "content");

export function readJson<T extends z.ZodType>(
  relativePath: string,
  schema: T,
  baseDir = CONTENT_DIR,
): z.infer<T> {
  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(path.join(baseDir, relativePath), "utf8"));
  } catch (error) {
    throw new ContentError(relativePath, error instanceof Error ? error.message : String(error));
  }
  const result = schema.safeParse(raw);
  if (!result.success) throw new ContentError(relativePath, z.prettifyError(result.error));
  return result.data;
}

export function listJson(relativeDir: string, baseDir = CONTENT_DIR): string[] {
  return readdirSync(path.join(baseDir, relativeDir))
    .filter((file) => file.endsWith(".json"))
    .sort()
    .map((file) => path.posix.join(relativeDir, file));
}
