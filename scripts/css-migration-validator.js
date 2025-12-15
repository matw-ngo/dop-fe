#!/usr/bin/env node

/**
 * CSS Migration Validation Script
 *
 * This script validates that all theme-based CSS classes have been migrated
 * to use data attributes instead of theme classes.
 *
 * Usage:
 *   npm run validate-css-migration
 *   or
 *   node scripts/css-migration-validator.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const CONFIG = {
  // Files and patterns to scan
  includePatterns: [
    'src/**/*.{tsx,ts,jsx,js}',
    'src/**/*.css'
  ],

  // Patterns to find legacy theme classes
  legacyThemePatterns: [
    /\.theme-[a-zA-Z0-9-]+/g,  // CSS selectors
    /className[^=]*=.*theme-[a-zA-Z0-9-]+/g,  // React className props
    /class[^=]*=.*theme-[a-zA-Z0-9-]+/g,  // HTML class attributes
  ],

  // Patterns that are acceptable (not legacy)
  acceptablePatterns: [
    /data-theme=/g,
    /data-color-scheme=/g,
    /data-user-group=/g,
    /theme-system/g,  // theme-system references
    /ThemeProvider/g,
    /useTheme/g,
    /theme\.config/g,
    /\.default/g,  // default export references
    /customTheme/g,  // variable names
  ],

  // Files to exclude from scanning
  excludePatterns: [
    'node_modules',
    '.next',
    'out',
    'coverage',
    '*.test.*',
    '*.spec.*',
    '**/*.stories.*',
    '**/*.config.*',
    'tailwind.config.*',
    'postcss.config.*'
  ]
};

class CSSMigrationValidator {
  constructor() {
    this.issues = [];
    this.filesScanned = 0;
    this.success = true;
  }

  /**
   * Scan a single file for legacy theme usage
   */
  scanFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      let fileIssues = [];

      lines.forEach((line, index) => {
        // Check for legacy theme patterns
        CONFIG.legacyThemePatterns.forEach(pattern => {
          const matches = line.match(pattern);
          if (matches) {
            // Filter out false positives using acceptable patterns
            const isFalsePositive = CONFIG.acceptablePatterns.some(acceptablePattern =>
              line.match(acceptablePattern)
            );

            if (!isFalsePositive) {
              fileIssues.push({
                line: index + 1,
                column: line.indexOf(matches[0]) + 1,
                match: matches[0],
                context: line.trim()
              });
            }
          }
        });
      });

      if (fileIssues.length > 0) {
        this.issues.push({
          file: filePath,
          issues: fileIssues
        });
        this.success = false;
      }

      this.filesScanned++;
    } catch (error) {
      console.error(`Error scanning file ${filePath}:`, error.message);
    }
  }

  /**
   * Scan all files in the project
   */
  async scanFiles() {
    console.log('🔍 Scanning for legacy theme class usage...\n');

    // Get all matching files
    const allFiles = [];
    for (const pattern of CONFIG.includePatterns) {
      const files = glob.sync(pattern, {
        ignore: CONFIG.excludePatterns
      });
      allFiles.push(...files);
    }

    // Remove duplicates
    const uniqueFiles = [...new Set(allFiles)];

    console.log(`Found ${uniqueFiles.length} files to scan\n`);

    // Scan each file
    for (const file of uniqueFiles) {
      this.scanFile(file);
    }
  }

  /**
   * Check for specific migration completion indicators
   */
  checkMigrationIndicators() {
    console.log('📊 Checking migration indicators...\n');

    // Check if globals.css has been updated
    const globalsCssPath = 'src/components/renderer/styles/globals.css';
    if (fs.existsSync(globalsCssPath)) {
      const content = fs.readFileSync(globalsCssPath, 'utf8');

      // Should have data-color-scheme selectors
      const hasDataColorScheme = content.includes('[data-color-scheme="dark"]');

      if (!hasDataColorScheme) {
        this.issues.push({
          file: globalsCssPath,
          issues: [{
            line: 0,
            column: 0,
            match: 'Missing data-color-scheme selectors',
            context: 'File should contain [data-color-scheme="dark"] selectors'
          }]
        });
        this.success = false;
      }
    }

    // Check if themes.css has been updated
    const themesCssPath = 'src/components/renderer/styles/themes.css';
    if (fs.existsSync(themesCssPath)) {
      const content = fs.readFileSync(themesCssPath, 'utf8');

      // Should have data-theme selectors
      const hasDataTheme = content.includes('[data-theme=');

      if (!hasDataTheme) {
        this.issues.push({
          file: themesCssPath,
          issues: [{
            line: 0,
            column: 0,
            match: 'Missing data-theme selectors',
            context: 'File should contain [data-theme=] selectors'
          }]
        });
        this.success = false;
      }
    }

    // Check if tailwind.config.ts has been updated
    const tailwindConfigPath = 'tailwind.config.ts';
    if (fs.existsSync(tailwindConfigPath)) {
      const content = fs.readFileSync(tailwindConfigPath, 'utf8');

      // Should have data-color-scheme in darkMode config
      const hasDataAttributeDarkMode = content.includes('[data-color-scheme=\'dark\']');

      if (!hasDataAttributeDarkMode) {
        this.issues.push({
          file: tailwindConfigPath,
          issues: [{
            line: 0,
            column: 0,
            match: 'Missing data-color-scheme in darkMode config',
            context: 'tailwind.config.ts should include [data-color-scheme=\'dark\'] in darkMode array'
          }]
        });
        this.success = false;
      }
    }
  }

  /**
   * Generate report
   */
  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📋 CSS MIGRATION VALIDATION REPORT');
    console.log('='.repeat(60));

    if (this.success) {
      console.log('\n✅ SUCCESS: No legacy theme class usage found!');
      console.log(`\n📈 Statistics:`);
      console.log(`   - Files scanned: ${this.filesScanned}`);
      console.log(`   - Issues found: 0`);

      console.log('\n🎉 Migration appears to be complete!');
      console.log('\nNext steps:');
      console.log('   1. Run your test suite to ensure everything works');
      console.log('   2. Test dark mode switching in your application');
      console.log('   3. Remove any commented-out legacy theme code');
    } else {
      console.log('\n❌ ISSUES FOUND: Legacy theme class usage detected');
      console.log(`\n📈 Statistics:`);
      console.log(`   - Files scanned: ${this.filesScanned}`);
      console.log(`   - Files with issues: ${this.issues.length}`);
      console.log(`   - Total issues: ${this.issues.reduce((sum, file) => sum + file.issues.length, 0)}`);

      console.log('\n📍 Issues by file:');
      this.issues.forEach(fileIssue => {
        console.log(`\n📄 ${fileIssue.file}`);
        fileIssue.issues.forEach(issue => {
          console.log(`   Line ${issue.line}:${issue.column} - ${issue.match}`);
          console.log(`   Context: ${issue.context}`);
        });
      });

      console.log('\n🔧 Recommended fixes:');
      console.log('   1. Replace .theme-dark selectors with [data-color-scheme="dark"]');
      console.log('   2. Replace .theme-light selectors with [data-color-scheme="light"]');
      console.log('   3. Replace theme- classes in JSX/TSX with data attributes');
      console.log('   4. Update any hardcoded theme references');

      console.log('\n📚 For migration guidance, see:');
      console.log('   - docs/theme-system/migration-guide.md');
      console.log('   - theme-system-migration-implementation-plan.md');
    }

    console.log('\n' + '='.repeat(60));
  }

  /**
   * Main validation method
   */
  async validate() {
    await this.scanFiles();
    this.checkMigrationIndicators();
    this.generateReport();

    // Exit with appropriate code
    process.exit(this.success ? 0 : 1);
  }
}

// Run validator if this file is executed directly
if (require.main === module) {
  const validator = new CSSMigrationValidator();
  validator.validate().catch(error => {
    console.error('Validation failed:', error);
    process.exit(1);
  });
}

module.exports = CSSMigrationValidator;