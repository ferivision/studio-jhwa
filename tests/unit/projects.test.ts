import { describe, expect, it } from "vitest";
import { getFeaturedProjects, getNextProject, getProject, getProjects } from "@/lib/content";

describe("project repository", () => {
  it("sorts by order", () => {
    expect(getProjects().map((p) => p.slug)).toEqual([
      "rh-house",
      "rs-house",
      "ny-nursery",
      "ef-bedroom",
      "nn-house",
    ]);
  });
  it("finds by slug and returns undefined for unknown slugs", () => {
    expect(getProject("rh-house")?.name).toBe("RH House");
    expect(getProject("nope")).toBeUndefined();
  });
  it("wraps next project from last to first", () => {
    expect(getNextProject("rh-house").slug).toBe("rs-house");
    expect(getNextProject("nn-house").slug).toBe("rh-house");
  });
  it("returns featured projects", () => {
    expect(getFeaturedProjects().length).toBeGreaterThan(0);
  });
});
