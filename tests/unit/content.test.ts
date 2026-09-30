import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { getDictionary, getHome, getProjects, getSite } from "@/lib/content";
import { readJson } from "@/lib/content/load";
import { projectSchema } from "@/lib/schemas/project";
import type { ImageContent } from "@/lib/schemas/common";

function keyPaths(value: unknown, prefix = ""): string[] {
  if (Array.isArray(value)) {
    return [
      `${prefix}[${value.length}]`,
      ...value.flatMap((v, i) => keyPaths(v, `${prefix}[${i}]`)),
    ];
  }
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([k, v]) => {
      const p = prefix ? `${prefix}.${k}` : k;
      return [p, ...keyPaths(v, p)];
    });
  }
  return [];
}

describe("content files", () => {
  it("site.json, home.json and both dictionaries match their schemas", () => {
    expect(() => getSite()).not.toThrow();
    expect(() => getHome()).not.toThrow();
    expect(() => getDictionary("en")).not.toThrow();
    expect(() => getDictionary("id")).not.toThrow();
  });

  it("every project file matches the schema", () => {
    const files = readdirSync("content/projects").filter((f) => f.endsWith(".json"));
    expect(files.length).toBeGreaterThanOrEqual(5);
    expect(getProjects()).toHaveLength(files.length);
  });

  it("en and id dictionaries have identical keys (including array lengths)", () => {
    expect(keyPaths(getDictionary("id")).sort()).toEqual(keyPaths(getDictionary("en")).sort());
  });

  it("project slugs are unique and match their file names", () => {
    const projects = getProjects();
    const slugs = projects.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(existsSync(`content/projects/${slug}.json`)).toBe(true);
  });

  it("every referenced image exists in public/", () => {
    const home = getHome();
    const images: ImageContent[] = [
      home.hero,
      home.intro.primary,
      home.intro.secondary,
      ...home.filmStrip,
      home.lineToLight.drawing,
      home.lineToLight.render,
      ...home.rooms,
      home.services.design,
      home.services.visualize,
      home.services.build,
      ...getProjects().flatMap((p) => [
        p.cover,
        ...p.gallery,
        ...(p.drawing ? [p.drawing.drawing, p.drawing.render] : []),
      ]),
    ];
    const missing = images.map((i) => i.src).filter((src) => !existsSync(path.join("public", src)));
    expect(missing).toEqual([]);
  });
});

describe("invalid content", () => {
  const fixtures = path.resolve("tests/fixtures/content");

  it("names the file and the failing field", () => {
    expect(() => readJson("bad-project.json", projectSchema, fixtures)).toThrowError(
      /content\/bad-project\.json[\s\S]*category/,
    );
  });

  it("reports malformed JSON with the file name", () => {
    expect(() => readJson("malformed.json", z.object({}), fixtures)).toThrowError(
      /content\/malformed\.json/,
    );
  });
});
