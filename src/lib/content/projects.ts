import "server-only";
import path from "node:path";
import { projectSchema, type Project } from "@/lib/schemas/project";
import { ContentError } from "./errors";
import { listJson, readJson } from "./load";

export function getProjects(): Project[] {
  const projects = listJson("projects").map((file) => {
    const project = readJson(file, projectSchema);
    if (path.posix.basename(file, ".json") !== project.slug) {
      throw new ContentError(file, `slug "${project.slug}" must match the file name`);
    }
    return project;
  });
  const orders = projects.map((p) => p.order);
  if (new Set(orders).size !== orders.length) {
    throw new ContentError("projects/", 'every project needs a unique "order" value');
  }
  return projects.sort((a, b) => a.order - b.order);
}

export function getProject(slug: string): Project | undefined {
  return getProjects().find((p) => p.slug === slug);
}

export function getFeaturedProjects(): Project[] {
  return getProjects().filter((p) => p.featured);
}

export function getNextProject(slug: string): Project {
  const projects = getProjects();
  const index = projects.findIndex((p) => p.slug === slug);
  const next = projects[(index + 1) % projects.length];
  if (!next) throw new ContentError("projects/", "at least one project is required");
  return next;
}
