#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Simple migration script to split translation files
 */

const MESSAGES_DIR = path.join(__dirname, '..', 'messages');
const LOCALES = ['vi', 'en'];

// Create directory structure
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Count keys in object
function countKeys(obj) {
  let count = 0;
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      count++;
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        count += countKeys(obj[key]);
      }
    }
  }
  return count;
}

// Migrate translations
function migrate(locale) {
  console.log(`\n🌍 Migrating ${locale.toUpperCase()} translations...`);

  const sourceFile = path.join(MESSAGES_DIR, `${locale}.json`);
  if (!fs.existsSync(sourceFile)) {
    console.error(`❌ Source file not found: ${sourceFile}`);
    return;
  }

  // Read original file
  const translations = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));
  const originalKeys = countKeys(translations);

  // Create backup
  const backupFile = path.join(MESSAGES_DIR, 'backup', `${locale}-${Date.now()}.json`);
  ensureDir(path.dirname(backupFile));
  fs.copyFileSync(sourceFile, backupFile);
  console.log(`💾 Backed up to ${backupFile}`);

  // Extract pages content
  const pages = translations.pages || {};

  // Group by namespace
  const namespaces = {
    features: {
      insurance: {},
      'credit-cards': {},
      tools: {},
      admin: {}
    },
    pages: {},
    common: {}
  };

  // Process each namespace
  for (const [namespace, content] of Object.entries(pages)) {
    if (namespace.startsWith('insurance')) {
      namespaces.features.insurance[namespace.replace('insurance', '') || 'main'] = content;
    } else if (namespace.startsWith('creditCard')) {
      namespaces.features['credit-cards'][namespace.replace('creditCard', '') || 'main'] = content;
    } else if (namespace.startsWith('tools')) {
      namespaces.features.tools[namespace.replace('tools', '') || 'main'] = content;
    } else if (namespace.startsWith('admin')) {
      namespaces.features.admin[namespace.replace('admin', '') || 'main'] = content;
    } else if (namespace.startsWith('common') || ['actions', 'errors', 'navigation'].includes(namespace)) {
      namespaces.common[namespace] = content;
    } else {
      namespaces.pages[namespace] = content;
    }
  }

  // Write files
  const localeDir = path.join(MESSAGES_DIR, locale);
  ensureDir(localeDir);

  let totalMigrated = 0;
  const filesCreated = [];

  // Write features
  for (const [feature, content] of Object.entries(namespaces.features)) {
    const featureDir = path.join(localeDir, 'features', feature);
    ensureDir(featureDir);

    for (const [fileName, fileContent] of Object.entries(content)) {
      if (Object.keys(fileContent).length > 0) {
        const filePath = path.join(featureDir, `${fileName || 'main'}.json`);
        fs.writeFileSync(filePath, JSON.stringify(fileContent, null, 2));
        const keyCount = countKeys(fileContent);
        totalMigrated += keyCount;
        filesCreated.push(filePath);
        console.log(`  ✓ ${path.relative(process.cwd(), filePath)} - ${keyCount} keys`);
      }
    }
  }

  // Write pages
  const pagesDir = path.join(localeDir, 'pages');
  ensureDir(pagesDir);
  for (const [fileName, content] of Object.entries(namespaces.pages)) {
    if (Object.keys(content).length > 0) {
      const filePath = path.join(pagesDir, `${fileName}.json`);
      fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
      const keyCount = countKeys(content);
      totalMigrated += keyCount;
      filesCreated.push(filePath);
      console.log(`  ✓ ${path.relative(process.cwd(), filePath)} - ${keyCount} keys`);
    }
  }

  // Write common
  if (Object.keys(namespaces.common).length > 0) {
    const commonDir = path.join(localeDir, 'common');
    ensureDir(commonDir);

    for (const [fileName, content] of Object.entries(namespaces.common)) {
      if (Object.keys(content).length > 0) {
        const filePath = path.join(commonDir, `${fileName}.json`);
        fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
        const keyCount = countKeys(content);
        totalMigrated += keyCount;
        filesCreated.push(filePath);
        console.log(`  ✓ ${path.relative(process.cwd(), filePath)} - ${keyCount} keys`);
      }
    }
  }

  console.log(`\n📊 Migration Summary for ${locale.toUpperCase()}:`);
  console.log(`  Original keys: ${originalKeys}`);
  console.log(`  Migrated keys: ${totalMigrated}`);
  console.log(`  Files created: ${filesCreated.length}`);
  console.log(`  Key difference: ${originalKeys - totalMigrated}`);
}

// Main execution
console.log('🚀 Simple Translation Migration');
console.log('===============================\n');

for (const locale of LOCALES) {
  migrate(locale);
}

console.log('\n✅ Migration complete!');
console.log('\nNext steps:');
console.log('1. Review the split files in messages/[locale]/');
console.log('2. Update your i18n configuration to load from namespaces');
console.log('3. Test the application');
console.log('4. Remove original files when ready');