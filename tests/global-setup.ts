import type { FullConfig } from "@playwright/test";

async function globalSetup(_config: FullConfig) {
  // Set up global test environment
  console.log("Setting up Playwright tests...");

  // You can start any services or perform global setup here
  // For example, database migrations, seeding, etc.
}

export default globalSetup;
