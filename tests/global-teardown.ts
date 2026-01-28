import type { FullConfig } from "@playwright/test";

async function globalTeardown(_config: FullConfig) {
  // Clean up global test environment
  console.log("Cleaning up Playwright tests...");

  // You can perform global cleanup here
  // For example, stopping services, cleaning databases, etc.
}

export default globalTeardown;
