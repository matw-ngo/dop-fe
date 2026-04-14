import path from "node:path";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.minimal.ts"],
    testTimeout: 10000,
    hookTimeout: 10000,
    include: ["src/app/[locale]/[...slug]/__tests__/**/*.test.{ts,tsx}"],
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
