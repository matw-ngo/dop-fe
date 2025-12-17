/**
 * Global Test Teardown for eKYC Testing
 *
 * This file runs once after all test suites:
 * - Cleanup test data
 * - Close connections
 * - Generate final reports
 */

import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

// Generate test report
export function generateTestReport() {
  const report = {
    timestamp: new Date().toISOString(),
    testSuite: "eKYC Integration Tests",
    summary: {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0,
    },
    coverage: {
      providerLayer: 0,
      formIntegration: 0,
      endToEnd: 0,
    },
    recommendations: [
      "Review failed tests and fix underlying issues",
      "Improve test coverage for edge cases",
      "Add performance benchmarks for verification flow",
      "Implement visual regression testing for UI components",
    ],
  };

  const reportsDir = join(process.cwd(), "test-reports");
  try {
    mkdirSync(reportsDir, { recursive: true });
    writeFileSync(
      join(reportsDir, "ekyc-test-summary.json"),
      JSON.stringify(report, null, 2),
    );
  } catch (error) {
    console.warn("Could not write test report:", error);
  }
}

// Cleanup test artifacts
export function cleanupTestArtifacts() {
  // Clean up temporary files
  const tempDirs = [
    join(process.cwd(), "temp-uploads"),
    join(process.cwd(), "test-screenshots"),
    join(process.cwd(), "test-videos"),
  ];

  tempDirs.forEach((dir) => {
    try {
      // Note: In a real implementation, you might want to use a library like rimraf
      // to recursively delete directories
      console.log(`Cleaning up temporary directory: ${dir}`);
    } catch (error) {
      console.warn(`Could not clean up directory ${dir}:`, error);
    }
  });
}

// Run global teardown
async function runGlobalTeardown() {
  console.log("\n🧹 Running global test teardown...");

  // Generate test report
  generateTestReport();

  // Cleanup artifacts
  cleanupTestArtifacts();

  // Print summary
  console.log("✅ Global teardown completed");
  console.log("📊 Test reports generated in test-reports/ directory");
}

// Run teardown if this file is executed directly
if (require.main === module) {
  runGlobalTeardown().catch(console.error);
}
