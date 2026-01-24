import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    testTimeout: 45000,
    hookTimeout: 45000,
    exclude: [
      "node_modules/",
      ".next/",
      "dist/",
      "e2e/",
      "tests/e2e/",
      "docs/",
      "**/*.config.*",
      "**/*.d.ts",
    ],
  },
});
