import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import jsxA11y from "eslint-plugin-jsx-a11y";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  // jsx-a11y plugin is already registered by eslint-config-next; add its strict rules only.
  { rules: { ...jsxA11y.flatConfigs.strict.rules } },
  {
    rules: {
      "no-console": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "react/no-danger": "error",
    },
  },
  { files: ["src/lib/seo/JsonLd.tsx"], rules: { "react/no-danger": "off" } },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "playwright-report/**",
    "test-results/**",
    "reference/**",
    "next-env.d.ts",
  ]),
]);
