import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    alias: { "server-only": new URL("./tests/setup/server-only.ts", import.meta.url).pathname },
  },
  test: { include: ["tests/unit/**/*.test.ts"], environment: "node" },
});
