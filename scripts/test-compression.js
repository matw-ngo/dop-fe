#!/usr/bin/env node

/**
 * Translation Compression Test Script
 *
 * Demonstrates the compression system functionality and validates results.
 * This script runs a complete test of the translation compression system.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧪 Translation Compression Test Suite');
console.log('');

// Test configuration
const tests = [
  {
    name: 'Production Compression',
    command: 'node scripts/compress-translations.js --mode=production --output-dir=test-compressed',
    expectedFiles: ['en.json.gz', 'en.json.br', 'vi.json.gz', 'vi.json.br']
  },
  {
    name: 'Gzip Only',
    command: 'node scripts/compress-translations.js --gzip-only --mode=production --output-dir=test-gzip',
    expectedFiles: ['en.json.gz', 'vi.json.gz']
  },
  {
    name: 'Brotli Only',
    command: 'node scripts/compress-translations.js --brotli-only --mode=production --output-dir=test-brotli',
    expectedFiles: ['en.json.br', 'vi.json.br']
  },
  {
    name: 'Development Mode',
    command: 'node scripts/compress-translations.js --mode=development --output-dir=test-dev --min-size=512',
    expectedFiles: ['en.json.gz', 'en.json.br', 'vi.json.gz', 'vi.json.br']
  }
];

// Run tests
let passedTests = 0;
const totalTests = tests.length;

for (const test of tests) {
  console.log(`📋 Running: ${test.name}`);
  console.log(`   Command: ${test.command}`);

  try {
    // Clean up any existing test directory
    const outputDir = test.command.match(/--output-dir=(\S+)/)?.[1] || 'test-compressed';
    if (fs.existsSync(outputDir)) {
      fs.rmSync(outputDir, { recursive: true, force: true });
    }

    // Run the compression command
    const output = execSync(test.command, {
      encoding: 'utf8',
      stdio: 'pipe'
    });

    // Check if expected files exist
    const missingFiles = [];
    for (const file of test.expectedFiles) {
      const filePath = path.join(outputDir, file);
      if (!fs.existsSync(filePath)) {
        missingFiles.push(file);
      }
    }

    if (missingFiles.length === 0) {
      console.log(`   ✅ Passed - All ${test.expectedFiles.length} files created`);
      passedTests++;
    } else {
      console.log(`   ❌ Failed - Missing files: ${missingFiles.join(', ')}`);
    }

    // Clean up test directory
    if (fs.existsSync(outputDir)) {
      fs.rmSync(outputDir, { recursive: true, force: true });
    }

  } catch (error) {
    console.log(`   ❌ Failed - Error: ${error.message}`);
  }

  console.log('');
}

// Test npm scripts
console.log('📦 Testing NPM Scripts');
console.log('');

const npmTests = [
  {
    name: 'compress:translations',
    script: 'pnpm compress:translations',
    description: 'Production compression via npm'
  },
  {
    name: 'compress:translations:gzip',
    script: 'pnpm compress:translations:gzip',
    description: 'Gzip-only compression via npm'
  },
  {
    name: 'compress:translations:brotli',
    script: 'pnpm compress:translations:brotli',
    description: 'Brotli-only compression via npm'
  }
];

for (const npmTest of npmTests) {
  console.log(`🔧 Testing: ${npmTest.name}`);
  console.log(`   Description: ${npmTest.description}`);

  try {
    const output = execSync(npmTest.script, {
      encoding: 'utf8',
      stdio: 'pipe'
    });

    if (output.includes('✅ Compression completed')) {
      console.log(`   ✅ Passed - Script executed successfully`);
      passedTests++;
    } else {
      console.log(`   ❌ Failed - Unexpected output`);
    }

  } catch (error) {
    console.log(`   ❌ Failed - Error: ${error.message}`);
  }

  console.log('');
}

// Verify compression report generation
console.log('📊 Verifying Compression Reports');
console.log('');

const reportFiles = [
  'docs/compression-report.json',
  'docs/compression-report.md'
];

let reportsGenerated = 0;
for (const reportFile of reportFiles) {
  if (fs.existsSync(reportFile)) {
    const stats = fs.statSync(reportFile);
    console.log(`   ✅ ${reportFile} (${formatBytes(stats.size)})`);
    reportsGenerated++;
  } else {
    console.log(`   ❌ ${reportFile} - Not found`);
  }
}

// Summary
console.log('');
console.log('📈 Test Summary');
console.log('');
console.log(`Total Tests: ${totalTests + npmTests.length + reportFiles.length}`);
console.log(`Passed: ${passedTests + reportsGenerated}`);
console.log(`Failed: ${totalTests + npmTests.length + reportFiles.length - passedTests - reportsGenerated}`);

const successRate = ((passedTests + reportsGenerated) / (totalTests + npmTests.length + reportFiles.length)) * 100;
console.log(`Success Rate: ${successRate.toFixed(1)}%`);

if (successRate >= 90) {
  console.log('');
  console.log('🎉 Compression system is working correctly!');
} else {
  console.log('');
  console.log('⚠️  Some tests failed. Please check the compression system.');
}

// Helper function to format bytes
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}