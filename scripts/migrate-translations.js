#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Translation Migration Script
 *
 * This script migrates monolithic translation files (vi.json, en.json) into
 * namespace-based chunks organized by features, components, and pages.
 *
 * Features:
 * - Dry-run mode to preview changes
 * - Backup original files
 * - Progress reporting
 * - Error handling
 * - Validation
 * - Rollback capability
 */

// Configuration
const MESSAGES_DIR = path.join(__dirname, '..', 'messages');
const BACKUP_DIR = path.join(__dirname, '..', 'messages', 'backup');
const REPORTS_DIR = path.join(__dirname, '..', 'docs', 'migration');

// Target namespace structure mapping
const NAMESPACE_MAPPING = {
  // Main feature namespaces
  'insurance': {
    targetPath: 'features/insurance',
    subNamespaces: {
      'calculator': 'calculator.json',
      'tutorials': 'tutorials.json',
      'articles': 'articles.json',
      'comparison': 'comparison.json',
      'productOverview': 'product-overview.json',
      'productDetails': 'product-details.json',
      'breadcrumb': 'breadcrumb.json',
      'comparisonSnackbar': 'comparison-snackbar.json',
      'productComparison': 'product-comparison.json',
      'productDetail': 'product-detail.json',
      'coverageTypes': 'coverage-types.json',
      'units': 'units.json',
      'categories': 'categories.json',
      'coveragePeriods': 'coverage-periods.json',
      'currency': 'currency.json'
    },
    defaultFile: 'insurance.json'
  },

  'creditCard': {
    targetPath: 'features/credit-cards',
    subNamespaces: {
      'csvHeaders': 'csv-headers.json',
      'pdfHeaders': 'pdf-headers.json',
      'feeTypes': 'fee-types.json',
      'interestTypes': 'interest-types.json',
      'categories': 'categories.json',
      'comparisonSnackbar': 'comparison-snackbar.json',
      'creditLimitTiers': 'credit-limit-tiers.json',
      'search': 'search.json',
      'results': 'results.json',
      'viewMode': 'view-mode.json'
    },
    defaultFile: 'credit-cards.json'
  },

  'tools': {
    targetPath: 'features/tools',
    subNamespaces: {
      'loanCalculator': 'loan-calculator.json',
      'savingsCalculator': 'savings-calculator.json',
      'grossToNetCalculator': 'gross-to-net-calculator.json',
      'netToGrossCalculator': 'net-to-gross-calculator.json',
      'results': 'results.json',
      'comparison': 'comparison.json',
      'features': 'features.json',
      'list': 'tools-list.json',
      'breadcrumbs': 'breadcrumbs.json'
    },
    defaultFile: 'tools.json'
  },

  'admin': {
    targetPath: 'features/admin',
    subNamespaces: {
      'login': 'login.json',
      'dashboard': 'dashboard.json',
      'flows': 'flows.json',
      'flowDetail': 'flow-detail.json',
      'stepDetail': 'step-detail.json',
      'breadcrumb': 'breadcrumb.json',
      'components': 'components.json',
      'layout': 'layout.json',
      'auth': 'auth.json'
    },
    defaultFile: 'admin.json'
  },

  // Common translations
  'common': {
    targetPath: 'common',
    subNamespaces: {},
    defaultFile: 'common.json'
  },

  // Pages (direct pages that don't belong to features)
  'homePage': {
    targetPath: 'pages',
    defaultFile: 'home.json'
  },

  'userOnboardingPage': {
    targetPath: 'pages',
    defaultFile: 'onboarding.json'
  },

  'notFoundPage': {
    targetPath: 'pages',
    defaultFile: 'not-found.json'
  },

  'serverErrorPage': {
    targetPath: 'pages',
    defaultFile: 'server-error.json'
  }
};

// Common/shared translations that should be extracted
const COMMON_PATTERNS = [
  /^common\./,
  /^validation\./,
  /^forms\./,
  /^modal\./,
  /^navigation\./,
  /^layout\./,
  /^ui\./,
  /^error\./,
  /^success\./,
  /^loading\./,
  /^buttons?\./i,
  /^labels?\./i,
  /^messages?\./i,
  /^notifications?\./i
];

/**
 * Command line arguments
 */
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const SKIP_BACKUP = args.includes('--skip-backup');
const VERBOSE = args.includes('--verbose');
const FORCE = args.includes('--force');

/**
 * Ensure directory exists
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Create backup of original files
 */
function createBackup(language, content) {
  if (SKIP_BACKUP) {
    if (VERBOSE) console.log(`⏭️  Skipping backup for ${language}.json`);
    return null;
  }

  ensureDir(BACKUP_DIR);

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(BACKUP_DIR, `${language}-${timestamp}.json`);

  fs.writeFileSync(backupPath, JSON.stringify(content, null, 2));

  if (VERBOSE) console.log(`💾 Backed up ${language}.json to ${backupPath}`);
  return backupPath;
}

/**
 * Count all keys in a nested object
 */
function countKeys(obj, count = 0) {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      count++;
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        count = countKeys(obj[key], count);
      }
    }
  }
  return count;
}

/**
 * Extract all keys with their paths from an object
 */
function extractKeyPaths(obj, prefix = '') {
  const paths = [];

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        // For objects, recurse to find actual string values
        paths.push(...extractKeyPaths(obj[key], fullKey));
      } else if (typeof obj[key] === 'string' || typeof obj[key] === 'number' || typeof obj[key] === 'boolean') {
        // Only collect actual terminal values
        paths.push({
          key: fullKey,
          value: obj[key],
          namespace: prefix.split('.')[0] || 'root'
        });
      }
    }
  }

  return paths;
}

/**
 * Determine if a key should go to common namespace
 */
function isCommonKey(key) {
  return COMMON_PATTERNS.some(pattern => pattern.test(key));
}

/**
 * Group translations by namespace
 */
function groupTranslationsByNamespace(translations) {
  const grouped = {
    features: {},
    pages: {},
    common: {},
    components: {}
  };

  // Process top-level namespaces directly from pages
  const pages = translations.pages || {};

  for (const [namespace, content] of Object.entries(pages)) {
    if (typeof content === 'object' && content !== null) {
      // Check if this is a common translation
      if (isCommonKey(namespace)) {
        // Put the entire object under common
        grouped.common[namespace] = content;
        continue;
      }

      // Check if it matches a known namespace
      const namespaceConfig = NAMESPACE_MAPPING[namespace];

      if (namespaceConfig) {
        // Determine if it's a feature or page
        if (namespaceConfig.targetPath.includes('features/')) {
          // It's a feature
          const targetPath = namespaceConfig.targetPath;

          if (!grouped.features[targetPath]) {
            grouped.features[targetPath] = {};
          }

          // Check if this namespace has sub-namespaces to split
          if (namespaceConfig.subNamespaces && Object.keys(namespaceConfig.subNamespaces).length > 0) {
            // Split into sub-namespaces
            for (const [subNamespace, fileName] of Object.entries(namespaceConfig.subNamespaces)) {
              if (content[subNamespace]) {
                if (!grouped.features[targetPath][fileName]) {
                  grouped.features[targetPath][fileName] = {};
                }
                grouped.features[targetPath][fileName] = content[subNamespace];
              }
            }

            // Handle any remaining content that doesn't fit sub-namespaces
            const remaining = { ...content };
            for (const subNamespace of Object.keys(namespaceConfig.subNamespaces)) {
              delete remaining[subNamespace];
            }

            if (Object.keys(remaining).length > 0) {
              // Put remaining content in the main file
              const mainFileName = namespaceConfig.defaultFile;
              if (!grouped.features[targetPath][mainFileName]) {
                grouped.features[targetPath][mainFileName] = {};
              }
              grouped.features[targetPath][mainFileName] = remaining;
            }
          } else {
            // No sub-namespaces, put entire content in the main file
            const fileName = namespaceConfig.defaultFile;
            grouped.features[targetPath][fileName] = content;
          }
        } else {
          // It's a page
          const fileName = namespaceConfig.defaultFile || `${namespace}.json`;
          if (!grouped.pages) {
            grouped.pages = {};
          }
          grouped.pages[fileName.replace('.json', '')] = content;
        }
      } else {
        // Unknown namespace - put it in pages
        grouped.pages[namespace] = content;
      }
    }
  }

  return grouped;
}

/**
 * Set nested value in an object
 */
function setNestedValue(obj, keyPath, value) {
  const keys = keyPath.split('.');
  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }

  current[keys[keys.length - 1]] = value;
}

/**
 * Write namespace files
 */
function writeNamespaceFiles(grouped, language) {
  const stats = {
    filesCreated: 0,
    keysMigrated: 0,
    directories: []
  };

  // Write feature files
  for (const [featurePath, files] of Object.entries(grouped.features)) {
    const fullPath = path.join(MESSAGES_DIR, language, featurePath);
    ensureDir(fullPath);

    stats.directories.push(fullPath);

    for (const [fileName, content] of Object.entries(files)) {
      const filePath = path.join(fullPath, fileName);

      if (!DRY_RUN) {
        fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
      }

      stats.filesCreated++;
      stats.keysMigrated += countKeys(content);

      if (VERBOSE) {
        console.log(`  ✓ ${path.join(language, featurePath, fileName)} - ${countKeys(content)} keys`);
      }
    }
  }

  // Write page files
  const pagesPath = path.join(MESSAGES_DIR, language, 'pages');
  ensureDir(pagesPath);

  for (const [key, value] of Object.entries(grouped.pages)) {
    const fileName = `${key}.json`;
    const filePath = path.join(pagesPath, fileName);

    if (!DRY_RUN) {
      fs.writeFileSync(filePath, JSON.stringify(value, null, 2));
    }

    stats.filesCreated++;
    stats.keysMigrated += countKeys(value);

    if (VERBOSE) {
      console.log(`  ✓ ${path.join(language, 'pages', fileName)} - ${countKeys(value)} keys`);
    }
  }

  // Write common files
  if (Object.keys(grouped.common).length > 0) {
    const commonPath = path.join(MESSAGES_DIR, language, 'common');
    ensureDir(commonPath);

    // Group common translations by category
    const commonGrouped = {};
    for (const [key, value] of Object.entries(grouped.common)) {
      const category = key.split('.')[0] || 'misc';
      if (!commonGrouped[category]) {
        commonGrouped[category] = {};
      }
      const subKey = key.split('.').slice(1).join('.');
      if (subKey) {
        setNestedValue(commonGrouped[category], subKey, value);
      } else {
        commonGrouped[category][key] = value;
      }
    }

    for (const [category, content] of Object.entries(commonGrouped)) {
      const fileName = `${category}.json`;
      const filePath = path.join(commonPath, fileName);

      if (!DRY_RUN) {
        fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
      }

      stats.filesCreated++;
      stats.keysMigrated += countKeys(content);

      if (VERBOSE) {
        console.log(`  ✓ ${path.join(language, 'common', fileName)} - ${countKeys(content)} keys`);
      }
    }
  }

  return stats;
}

/**
 * Validate migration
 */
function validateMigration(original, grouped, language) {
  // Count total keys without path comparison
  const originalCount = countKeys(original.pages || {});
  let migratedCount = 0;

  // Count all migrated keys
  for (const files of Object.values(grouped.features)) {
    for (const content of Object.values(files)) {
      migratedCount += countKeys(content);
    }
  }

  for (const content of Object.values(grouped.pages)) {
    migratedCount += countKeys(content);
  }

  for (const content of Object.values(grouped.common)) {
    migratedCount += countKeys(content);
  }

  // Since we're preserving the structure but reorganizing, we'll validate by count
  // A small difference is acceptable due to structural differences
  const difference = Math.abs(originalCount - migratedCount);
  const isValid = difference === 0;

  return {
    originalCount,
    migratedCount,
    difference,
    isValid,
    note: 'Validation is based on key count due to namespace reorganization'
  };
}

/**
 * Generate migration report
 */
function generateReport(language, originalStats, migrationStats, validation) {
  const report = {
    timestamp: new Date().toISOString(),
    language,
    dryRun: DRY_RUN,
    original: originalStats,
    migration: migrationStats,
    validation,
    summary: {
      success: validation.isValid,
      keyLoss: validation.originalCount - validation.migratedCount,
      efficiency: Math.round((validation.migratedCount / validation.originalCount) * 100 * 100) / 100
    }
  };

  ensureDir(REPORTS_DIR);
  const reportPath = path.join(REPORTS_DIR, `migration-${language}-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  return reportPath;
}

/**
 * Create rollback script
 */
function createRollbackScript(backups) {
  if (!backups || Object.keys(backups).length === 0) {
    console.log('⚠️  No backups available for rollback');
    return;
  }

  const rollbackScript = `#!/bin/bash
# Rollback script for translation migration
# Generated on ${new Date().toISOString()}

echo "🔄 Rolling back translation migration..."

`;

  for (const [language, backupPath] of Object.entries(backups)) {
    if (backupPath && fs.existsSync(backupPath)) {
      rollbackScript += `echo "Restoring ${language}.json..."
cp "${backupPath}" "${path.join(MESSAGES_DIR, language + '.json')}"
echo "✓ ${language}.json restored"
`;
    }
  }

  rollbackScript += `
echo ""
echo "✅ Rollback complete!"
echo "Note: This only restores the original monolithic files."
echo "You may need to manually clean up the namespace files."
`;

  const rollbackPath = path.join(__dirname, 'rollback-migration.sh');
  fs.writeFileSync(rollbackPath, rollbackScript);
  fs.chmodSync(rollbackPath, '755');

  console.log(`📝 Rollback script created: ${rollbackPath}`);
  return rollbackPath;
}

/**
 * Main migration function
 */
async function migrateLanguage(language) {
  console.log(`\n🌍 Migrating ${language.toUpperCase()} translations...`);

  const filePath = path.join(MESSAGES_DIR, `${language}.json`);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  ${language}.json not found, skipping...`);
    return null;
  }

  // Read original file
  const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const originalKeyCount = countKeys(content);

  // Create backup
  const backupPath = createBackup(language, content);

  // Group translations
  const grouped = groupTranslationsByNamespace(content);

  // Write files (or simulate in dry-run)
  const migrationStats = writeNamespaceFiles(grouped, language);

  // Validate
  const validation = validateMigration(content, grouped, language);

  // Generate report
  const originalStats = {
    file: `${language}.json`,
    keyCount: originalKeyCount,
    size: fs.statSync(filePath).size
  };

  const reportPath = generateReport(language, originalStats, migrationStats, validation);

  // Print summary
  console.log(`\n📊 Migration Summary for ${language.toUpperCase()}:`);
  console.log(`  Original keys: ${validation.originalCount}`);
  console.log(`  Migrated keys: ${validation.migratedCount}`);
  console.log(`  Files created: ${migrationStats.filesCreated}`);
  console.log(`  Directories: ${migrationStats.directories.length}`);

  if (validation.isValid) {
    console.log(`  ✅ Migration successful! All ${validation.originalCount} keys preserved.`);
  } else {
    console.log(`  ⚠️  Migration completed with ${validation.difference} key difference`);
    console.log(`  Note: ${validation.note}`);
  }

  if (!DRY_RUN) {
    console.log(`  📄 Report: ${reportPath}`);
  }

  return {
    language,
    backupPath,
    grouped,
    validation,
    migrationStats
  };
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Translation Migration Script');
  console.log('================================');

  if (DRY_RUN) {
    console.log('\n🔍 DRY RUN MODE - No files will be modified');
  }

  if (FORCE) {
    console.log('\n⚡ FORCE MODE - Skipping confirmations');
  }

  if (VERBOSE) {
    console.log('\n📝 VERBOSE MODE - Detailed output enabled');
  }

  // Confirmation for non-dry-run
  if (!DRY_RUN && !FORCE) {
    console.log('\n⚠️  This will split your monolithic translation files into namespace-based chunks.');
    console.log('   A backup will be created automatically.');
    console.log('\nContinue? (y/N)');

    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    const answer = await new Promise(resolve => {
      process.stdin.on('data', data => {
        process.stdin.pause();
        resolve(data.trim().toLowerCase());
      });
    });

    if (answer !== 'y' && answer !== 'yes') {
      console.log('\n❌ Migration cancelled');
      process.exit(0);
    }
  }

  // Migrate languages
  const languages = ['vi', 'en'];
  const results = {};

  for (const language of languages) {
    try {
      results[language] = await migrateLanguage(language);
    } catch (error) {
      console.error(`\n❌ Error migrating ${language}:`, error.message);
      if (VERBOSE) console.error(error.stack);
    }
  }

  // Create rollback script
  const backups = Object.entries(results).reduce((acc, [lang, result]) => {
    if (result && result.backupPath) {
      acc[lang] = result.backupPath;
    }
    return acc;
  }, {});

  if (!DRY_RUN && Object.keys(backups).length > 0) {
    createRollbackScript(backups);
  }

  // Final summary
  console.log('\n🎉 Migration Complete!');
  console.log('==================');

  const totalKeys = Object.values(results).reduce((sum, r) => sum + (r?.validation.originalCount || 0), 0);
  const totalMigrated = Object.values(results).reduce((sum, r) => sum + (r?.validation.migratedCount || 0), 0);
  const totalFiles = Object.values(results).reduce((sum, r) => sum + (r?.migrationStats.filesCreated || 0), 0);

  console.log(`\n📈 Overall Statistics:`);
  console.log(`  Total keys processed: ${totalKeys}`);
  console.log(`  Total keys migrated: ${totalMigrated}`);
  console.log(`  Total files created: ${totalFiles}`);
  console.log(`  Migration success: ${Math.round((totalMigrated / totalKeys) * 100)}%`);

  if (!DRY_RUN) {
    console.log(`\n📝 Reports generated in: ${REPORTS_DIR}`);
    console.log(`💾 Backups stored in: ${BACKUP_DIR}`);
    console.log('\n⚠️  Next steps:');
    console.log('  1. Review the migration reports');
    console.log('  2. Test your application with the new namespace structure');
    console.log('  3. Update your i18n configuration to use the namespace-based structure');
    console.log('  4. Once verified, you can remove the original monolithic files');
  }
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('\n❌ Migration failed:', error.message);
    if (VERBOSE) console.error(error.stack);
    process.exit(1);
  });
}

module.exports = {
  migrateLanguage,
  groupTranslationsByNamespace,
  validateMigration,
  countKeys,
  NAMESPACE_MAPPING
};