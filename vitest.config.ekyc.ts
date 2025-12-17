/**
 * Vitest Configuration for eKYC Testing
 *
 * This configuration file sets up the testing environment for eKYC integration tests:
 * - Custom test environment
 * - Mock setup and teardown
 * - Coverage configuration
 * - Performance testing settings
 */

import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],

  // Test environment configuration
  test: {
    // Use jsdom for DOM testing
    environment: "jsdom",

    // Setup files
    setupFiles: ["./src/__tests__/setup/ekyc-test-setup.ts"],

    // Global setup
    globalSetup: "./src/__tests__/setup/global-setup.ts",

    // Coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      reportsDirectory: "./coverage/ekyc",
      exclude: [
        "node_modules/",
        "src/__tests__/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/dist/**",
        "coverage/**",
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
        // Specific thresholds for eKYC modules
        "src/lib/verification/**": {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
        "src/components/form-generation/fields/EkycField.tsx": {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85,
        },
      },
    },

    // Test timeout
    testTimeout: 10000,
    hookTimeout: 10000,

    // Include patterns
    include: [
      "src/**/__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
      "src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
    ],

    // Exclude patterns
    exclude: ["node_modules/", "dist/", ".idea/", ".git/", "coverage/**"],

    // Reporter configuration
    reporters: ["verbose", "json", "html"],

    // Aliases for path resolution
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/components": path.resolve(__dirname, "./src/components"),
      "@/lib": path.resolve(__dirname, "./src/lib"),
      "@/__tests__": path.resolve(__dirname, "./src/__tests__"),
    },

    // Globals for testing
    globals: true,

    // Concurrent configuration
    maxConcurrency: 4,
    maxWorkers: 2,

    // Isolate each test file
    isolate: true,

    // Enable test sequence
    sequence: {
      concurrent: true,
      shuffle: false,
    },

    // Performance testing hooks
    benchmark: {
      include: ["**/*.benchmark.test.{ts,js}"],
      outputJson: "./benchmark-results/ekyc-benchmarks.json",
    },
  },

  // Resolve configuration
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/components": path.resolve(__dirname, "./src/components"),
      "@/lib": path.resolve(__dirname, "./src/lib"),
      "@/__tests__": path.resolve(__dirname, "./src/__tests__"),
    },
  },

  // Define global variables
  define: {
    "process.env.NODE_ENV": '"test"',
    "process.env.NEXT_PUBLIC_EKYC_ENVIRONMENT": '"test"',
  },
});
