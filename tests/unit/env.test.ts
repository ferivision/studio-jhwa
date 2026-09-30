import { describe, expect, it } from "vitest";
import { parseEnv } from "@/config/env";

describe("env", () => {
  it("applies defaults and strips the trailing slash", () => {
    expect(parseEnv({})).toEqual({
      NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
      SITE_ENV: "development",
    });
    expect(
      parseEnv({ NEXT_PUBLIC_SITE_URL: "https://studiojhwa.example/" }).NEXT_PUBLIC_SITE_URL,
    ).toBe("https://studiojhwa.example");
  });
  it("treats empty strings as unset", () => {
    expect(parseEnv({ NEXT_PUBLIC_SITE_URL: "", SITE_ENV: "" }).SITE_ENV).toBe("development");
  });
  it("fails with a readable message on invalid values", () => {
    expect(() => parseEnv({ NEXT_PUBLIC_SITE_URL: "not a url" })).toThrowError(
      /NEXT_PUBLIC_SITE_URL/,
    );
    expect(() => parseEnv({ SITE_ENV: "prod" })).toThrowError(/SITE_ENV/);
  });
  it("requires an explicit site URL in production", () => {
    expect(() => parseEnv({ SITE_ENV: "production" })).toThrowError(/NEXT_PUBLIC_SITE_URL/);
    expect(
      parseEnv({ SITE_ENV: "production", NEXT_PUBLIC_SITE_URL: "https://studiojhwa.example" }),
    ).toEqual({
      NEXT_PUBLIC_SITE_URL: "https://studiojhwa.example",
      SITE_ENV: "production",
    });
    expect(parseEnv({ SITE_ENV: "preview" }).NEXT_PUBLIC_SITE_URL).toBe("http://localhost:3000");
  });
});
