import { FullConfig } from "@playwright/test";
import path from "path";

interface GlobalSetupResult {
  artifactsDir: string;
}

async function globalTeardown(config: FullConfig, globalSetupResult?: GlobalSetupResult) {
  console.log("🧹 Starting global teardown...");

  try {
    // Clean up test database if needed
    if (process.env.TEST_DATABASE_URL) {
      console.log("🗄️ Cleaning up test database...");
      // await cleanupTestDatabase();
    }

    // Stop mock services if they were started
    if (process.env.USE_MOCKS === "true") {
      console.log("🎭 Stopping mock services...");
      // await stopMockServices();
    }

    // Clean up test user accounts if they were created
    console.log("👤 Cleaning up test user accounts...");
    // await cleanupTestUsers();

    // Clean up test data
    console.log("💼 Cleaning up test data...");
    // await cleanupTestData();

    // Archive test artifacts if needed
    if (globalSetupResult?.artifactsDir) {
      console.log("📦 Archiving test artifacts...");
      const artifactsDir = globalSetupResult.artifactsDir;
      const archiveDir = path.join(artifactsDir, `archive-${Date.now()}`);

      try {
        await require("fs").promises.mkdir(archiveDir, { recursive: true });
        // Archive important files
        // await archiveTestResults(artifactsDir, archiveDir);
      } catch (error) {
        console.warn("⚠️ Failed to archive test artifacts:", error);
      }
    }

    console.log("✅ Global teardown completed successfully");
  } catch (error) {
    console.error("❌ Global teardown failed:", error);
    throw error;
  }
}

export default globalTeardown;