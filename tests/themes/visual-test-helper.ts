/**
 * Visual Test Helper Utilities
 *
 * Provides utilities for managing visual regression tests
 * including screenshot comparison and baseline management.
 *
 * @fileoverview Helper utilities for visual testing
 * @version 1.0.0
 *
 * NOTE: This file requires the 'pngjs' package to be installed.
 * Run: npm install --save-dev pngjs @types/pngjs
 */

import fs from "node:fs";
import path from "node:path";
// import { PNG } from "pngjs"; // Commented out - install pngjs package to use

/**
 * Configuration for visual regression testing
 */
export interface VisualTestConfig {
  threshold: number;
  allowMismatchingPixels: number;
  createDiffImage: boolean;
  baselineDir: string;
  currentDir: string;
  diffDir: string;
}

/**
 * Result of screenshot comparison
 */
export interface ComparisonResult {
  passed: boolean;
  numDiffPixels: number;
  diffRatio: number;
  diffImagePath?: string;
  error?: string;
}

/**
 * Default configuration
 */
export const DEFAULT_CONFIG: VisualTestConfig = {
  threshold: 0.02,
  allowMismatchingPixels: 100,
  createDiffImage: true,
  baselineDir: path.join(process.cwd(), "tests/themes/baseline"),
  currentDir: path.join(process.cwd(), "test-results/screenshots"),
  diffDir: path.join(process.cwd(), "test-results/diffs"),
};

/**
 * Compare two screenshots
 *
 * @deprecated This function requires pngjs package. Install it first or use Playwright's built-in screenshot comparison.
 */
export async function compareScreenshots(
  baselinePath: string,
  currentPath: string,
  config: Partial<VisualTestConfig> = {},
): Promise<ComparisonResult> {
  return {
    passed: false,
    numDiffPixels: -1,
    diffRatio: 1,
    error:
      "pngjs package not installed. Run: npm install --save-dev pngjs @types/pngjs",
  };

  /* Uncomment when pngjs is installed:
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  try {
    // Ensure directories exist
    await ensureDirectoryExists(finalConfig.diffDir);

    // Read images
    const baselineImage = await readPNG(baselinePath);
    const currentImage = await readPNG(currentPath);

    // Validate image dimensions match
    if (
      baselineImage.width !== currentImage.width ||
      baselineImage.height !== currentImage.height
    ) {
      return {
        passed: false,
        numDiffPixels: -1,
        diffRatio: 1,
        error: `Image dimensions mismatch: baseline (${baselineImage.width}x${baselineImage.height}) vs current (${currentImage.width}x${currentImage.height})`,
      };
    }

    // Create diff buffers
    const diff = new Uint8Array(baselineImage.width * baselineImage.height * 4);

    // Compare images
    const numDiffPixels = compareImages(
      baselineImage.data,
      currentImage.data,
      diff,
      baselineImage.width,
      baselineImage.height,
      {
        threshold: finalConfig.threshold,
        includeAA: true,
      },
    );

    const totalPixels = baselineImage.width * baselineImage.height;
    const diffRatio = numDiffPixels / totalPixels;
    const passed = numDiffPixels <= finalConfig.allowMismatchingPixels;

    let diffImagePath: string | undefined;

    // Create diff image if needed
    if (finalConfig.createDiffImage && !passed) {
      const diffImage = new PNG({
        width: baselineImage.width,
        height: baselineImage.height,
      });
      diffImage.data = diff;

      diffImagePath = path.join(
        finalConfig.diffDir,
        `${path.basename(currentPath, ".png")}-diff.png`,
      );

      await writePNG(diffImage, diffImagePath);
    }

    return {
      passed,
      numDiffPixels,
      diffRatio,
      diffImagePath,
    };
  } catch (error) {
    return {
      passed: false,
      numDiffPixels: -1,
      diffRatio: 1,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
  */
}

/**
 * Update baseline with current screenshot
 */
export async function updateBaseline(
  currentPath: string,
  baselinePath: string,
): Promise<void> {
  await ensureDirectoryExists(path.dirname(baselinePath));
  fs.copyFileSync(currentPath, baselinePath);
}

/**
 * Read PNG file
 * @deprecated Requires pngjs package
 */
async function readPNG(filePath: string): Promise<any> {
  throw new Error("pngjs package not installed");
  /* Uncomment when pngjs is installed:
  return new Promise((resolve, reject) => {
    const data = fs.readFileSync(filePath);
    const png = new PNG();
    png.parse(data, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
  */
}

/**
 * Write PNG file
 * @deprecated Requires pngjs package
 */
async function writePNG(png: any, filePath: string): Promise<void> {
  throw new Error("pngjs package not installed");
  /* Uncomment when pngjs is installed:
  return new Promise((resolve, reject) => {
    const buffer = PNG.sync.write(png);
    fs.writeFile(filePath, buffer, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
  */
}

/**
 * Compare image data (simplified pixelmatch wrapper)
 */
function compareImages(
  img1: Uint8Array,
  img2: Uint8Array,
  diff: Uint8Array,
  _width: number,
  _height: number,
  options: { threshold: number; includeAA: boolean },
): number {
  let diffCount = 0;
  const threshold = Math.floor(options.threshold * 255);

  for (let i = 0; i < img1.length; i += 4) {
    const r1 = img1[i];
    const g1 = img1[i + 1];
    const b1 = img1[i + 2];
    const a1 = img1[i + 3];

    const r2 = img2[i];
    const g2 = img2[i + 1];
    const b2 = img2[i + 2];
    const a2 = img2[i + 3];

    // Simple difference calculation
    const diffR = Math.abs(r1 - r2);
    const diffG = Math.abs(g1 - g2);
    const diffB = Math.abs(b1 - b2);
    const diffA = Math.abs(a1 - a2);

    // Check if difference exceeds threshold
    if (
      diffR > threshold ||
      diffG > threshold ||
      diffB > threshold ||
      diffA > threshold
    ) {
      diffCount++;

      // Set diff pixel (red channel for visibility)
      diff[i] = 255; // R
      diff[i + 1] = 0; // G
      diff[i + 2] = 0; // B
      diff[i + 3] = 255; // A
    } else {
      // No difference, copy from original
      diff[i] = r2;
      diff[i + 1] = g2;
      diff[i + 2] = b2;
      diff[i + 3] = a2;
    }
  }

  return diffCount;
}

/**
 * Ensure directory exists
 */
async function ensureDirectoryExists(dirPath: string): Promise<void> {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Generate visual test report
 */
export function generateVisualTestReport(
  results: Array<{
    testName: string;
    theme: string;
    mode: string;
    result: ComparisonResult;
  }>,
): string {
  const passedTests = results.filter((r) => r.result.passed).length;
  const totalTests = results.length;
  const passRate = ((passedTests / totalTests) * 100).toFixed(1);

  let report = `# Visual Regression Test Report\n\n`;
  report += `**Total Tests**: ${totalTests}\n`;
  report += `**Passed**: ${passedTests}\n`;
  report += `**Failed**: ${totalTests - passedTests}\n`;
  report += `**Pass Rate**: ${passRate}%\n\n`;

  report += `## Failed Tests\n\n`;

  const failedTests = results.filter((r) => !r.result.passed);
  if (failedTests.length === 0) {
    report += `✅ All visual tests passed!\n\n`;
  } else {
    failedTests.forEach((test) => {
      report += `### ${test.testName}\n`;
      report += `- **Theme**: ${test.theme}\n`;
      report += `- **Mode**: ${test.mode}\n`;
      report += `- **Diff Pixels**: ${test.result.numDiffPixels}\n`;
      report += `- **Diff Ratio**: ${(test.result.diffRatio * 100).toFixed(2)}%\n`;
      if (test.result.diffImagePath) {
        report += `- **Diff Image**: ${test.result.diffImagePath}\n`;
      }
      if (test.result.error) {
        report += `- **Error**: ${test.result.error}\n`;
      }
      report += `\n`;
    });
  }

  report += `## Test Summary by Theme\n\n`;

  // Group results by theme
  const resultsByTheme = new Map<string, typeof results>();
  results.forEach((r) => {
    if (!resultsByTheme.has(r.theme)) {
      resultsByTheme.set(r.theme, []);
    }
    resultsByTheme.get(r.theme)?.push(r);
  });

  resultsByTheme.forEach((themeResults, theme) => {
    const themePassed = themeResults.filter((r) => r.result.passed).length;
    const themeTotal = themeResults.length;
    const themePassRate = ((themePassed / themeTotal) * 100).toFixed(1);

    report += `### ${theme}\n`;
    report += `- Tests: ${themePassed}/${themeTotal} (${themePassRate}%)\n`;
    report += `- Light: ${themeResults.filter((r) => r.mode === "light" && r.result.passed).length}/${themeResults.filter((r) => r.mode === "light").length}\n`;
    report += `- Dark: ${themeResults.filter((r) => r.mode === "dark" && r.result.passed).length}/${themeResults.filter((r) => r.mode === "dark").length}\n\n`;
  });

  return report;
}

/**
 * CLI helper to update all baselines
 */
export async function updateAllBaselines(): Promise<void> {
  const config = DEFAULT_CONFIG;
  const currentFiles = fs.readdirSync(config.currentDir);

  console.log("Updating baseline screenshots...");

  for (const file of currentFiles) {
    if (file.endsWith(".png")) {
      const currentPath = path.join(config.currentDir, file);
      const baselinePath = path.join(config.baselineDir, file);

      console.log(`Updating baseline: ${file}`);
      await updateBaseline(currentPath, baselinePath);
    }
  }

  console.log("All baselines updated successfully!");
}

/**
 * Run this script directly with npm run visual-test:update
 */
if (require.main === module) {
  updateAllBaselines().catch(console.error);
}
