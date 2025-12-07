#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Script to analyze the current translation structure
 * This script analyzes vi.json and en.json files to understand their size,
 * structure, and identify the largest namespaces for priority migration.
 */

// Configuration
const MESSAGES_DIR = path.join(__dirname, '..', 'messages');
const OUTPUT_DIR = path.join(__dirname, '..', 'docs');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'translation-analysis.json');

/**
 * Recursively count all keys in a nested object
 * @param {Object} obj - The object to count keys in
 * @returns {number} - Total number of keys
 */
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

/**
 * Extract route-based keys and their key counts
 * @param {Object} obj - The translation object
 * @param {string} prefix - Current key prefix
 * @param {number} depth - Current depth level
 * @returns {Object} - Object with route names as keys and their stats
 */
function extractRouteKeys(obj, prefix = '', depth = 0) {
  const routes = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        const keyCount = countKeys(obj[key]);

        // Check if this looks like a route/namespace
        if (isRouteNamespace(key, fullKey, depth)) {
          routes[key] = {
            keyCount,
            path: fullKey,
            depth,
            // Sample some keys to understand the content
            sampleKeys: getSampleKeys(obj[key], key, 5),
            // Also extract direct children if this is a large namespace
            children: keyCount > 50 ? Object.keys(obj[key])
              .filter(k => typeof obj[key][k] === 'object' && obj[key][k] !== null)
              .slice(0, 10) : []
          };
        }

        // Always process nested objects for deeper analysis
        const nestedRoutes = extractRouteKeys(obj[key], fullKey, depth + 1);
        Object.assign(routes, nestedRoutes);
      }
    }
  }

  return routes;
}

/**
 * Determine if a key represents a route/namespace
 * @param {string} key - The key name
 * @param {string} fullKey - The full key path
 * @param {number} depth - Current depth level
 * @returns {boolean} - Whether this is likely a route namespace
 */
function isRouteNamespace(key, fullKey, depth = 0) {
  // Top-level keys that are likely route namespaces
  const topLevelRoutes = [
    'pages', 'components', 'common', 'layout', 'tools',
    'auth', 'errors', 'navigation', 'forms', 'modal',
    'validation', 'menu', 'admin'
  ];

  // Common route patterns
  const routePatterns = [
    /Page$/,            // Ends with Page (e.g., homePage, creditCard)
    /Page$/,            // Ends with Page
    /^admin/,           // Admin related
    /^tools/,           // Tools related
    /^common/,          // Common/shared
    /^components/,      // Components
    /^layout/,          // Layout
    /^forms/,           // Forms
    /^navigation/,      // Navigation
    /^modal/,           // Modal
    /^validation/,      // Validation
    /^errors/,          // Errors
    /^menu/,            // Menu
    /^tutorials/,       // Tutorials
    /^articles/,        // Articles
    /^calculator/,      // Calculator
    /Calculator$/,      // Ends with Calculator
    /ekyc/,             // eKYC related
    /insurance/,        // Insurance related
    /creditCard/,       // Credit card related
    /loan/,             // Loan related
    /savings/,          // Savings related
  ];

  // Special handling for 'pages' - it's a container, not a route itself
  if (key === 'pages' && depth === 0) {
    return false; // Don't treat 'pages' as a route namespace, process its children
  }

  // At depth 0 (top level), check if it's a known route type
  if (depth === 0) {
    return topLevelRoutes.includes(key) || routePatterns.some(pattern => pattern.test(key));
  }

  // At deeper levels, check route patterns
  if (depth >= 1) {
    return routePatterns.some(pattern => pattern.test(key)) ||
           // Page identifiers typically have specific patterns
           (/[A-Z]/.test(key) && /Page$/.test(key)) ||
           // Tools pages
           /tools/.test(fullKey) ||
           // Admin pages
           /admin/.test(fullKey) ||
           // Financial calculators
           /(grossToNet|netToGross|loan|savings)Calculator/.test(key) ||
           // Feature modules
           (key.length > 3 && typeof key === 'string');
  }

  return false;
}

/**
 * Get sample keys from a namespace
 * @param {Object} obj - The namespace object
 * @param {string} prefix - Key prefix
 * @param {number} maxSamples - Maximum number of samples
 * @returns {Array} - Array of sample keys
 */
function getSampleKeys(obj, prefix, maxSamples = 5) {
  const samples = [];
  const keys = Object.keys(obj).slice(0, maxSamples);

  for (const key of keys) {
    if (typeof obj[key] === 'string') {
      samples.push(`${prefix}.${key}`);
    } else if (typeof obj[key] === 'object') {
      // Get first nested key if it's a string
      const nestedKeys = Object.keys(obj[key]);
      if (nestedKeys.length > 0 && typeof obj[key][nestedKeys[0]] === 'string') {
        samples.push(`${prefix}.${key}.${nestedKeys[0]}`);
      }
    }
  }

  return samples;
}

/**
 * Get file size in bytes
 * @param {string} filePath - Path to the file
 * @returns {Object} - Size info with human readable format
 */
function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    const bytes = stats.size;

    return {
      bytes,
      kb: Math.round(bytes / 1024 * 100) / 100,
      mb: Math.round(bytes / (1024 * 1024) * 100) / 100,
      human: bytes < 1024 ? `${bytes} B` :
             bytes < 1024 * 1024 ? `${Math.round(bytes / 1024 * 100) / 100} KB` :
             `${Math.round(bytes / (1024 * 1024) * 100) / 100} MB`
    };
  } catch (error) {
    return {
      bytes: 0,
      kb: 0,
      mb: 0,
      human: '0 B'
    };
  }
}

/**
 * Analyze a single translation file
 * @param {string} filePath - Path to the translation file
 * @returns {Object} - Analysis result
 */
function analyzeFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return {
        exists: false,
        error: 'File does not exist',
        size: getFileSize(filePath),
        keyCount: 0,
        routes: {}
      };
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const translations = JSON.parse(content);

    const keyCount = countKeys(translations);

    // Special handling for the "pages" structure
    let routes = {};
    let topLevelStructure = {};

    if (translations.pages) {
      // Analyze the pages structure specially
      topLevelStructure = {
        pages: {
          keyCount: countKeys(translations.pages),
          children: {}
        }
      };

      // Analyze each top-level item under pages
      for (const [key, value] of Object.entries(translations.pages)) {
        if (typeof value === 'object' && value !== null) {
          const keyCount = countKeys(value);
          topLevelStructure.pages.children[key] = {
            keyCount,
            hasNestedObjects: Object.values(value).some(v => typeof v === 'object' && v !== null),
            sampleKeys: getSampleKeys(value, key, 3)
          };
        }
      }

      // Extract routes from within pages
      routes = extractRouteKeys(translations.pages, 'pages');
    } else {
      // If no pages structure, use regular extraction
      routes = extractRouteKeys(translations);
    }

    // Sort routes by key count to identify largest sections
    const sortedRoutes = Object.entries(routes)
      .sort(([, a], [, b]) => b.keyCount - a.keyCount)
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});

    return {
      exists: true,
      size: getFileSize(filePath),
      keyCount,
      routeCount: Object.keys(routes).length,
      routes: sortedRoutes,
      topLevelStructure,
      // Calculate what percentage each route contributes to total
      routeDistribution: Object.entries(routes).reduce((acc, [route, data]) => {
        acc[route] = {
          ...data,
          percentage: Math.round((data.keyCount / keyCount) * 100 * 100) / 100
        };
        return acc;
      }, {})
    };

  } catch (error) {
    return {
      exists: fs.existsSync(filePath),
      error: error.message,
      size: getFileSize(filePath),
      keyCount: 0,
      routes: {},
      topLevelStructure: {}
    };
  }
}

/**
 * Compare two translation files for consistency
 * @param {Object} viAnalysis - Analysis of vi.json
 * @param {Object} enAnalysis - Analysis of en.json
 * @returns {Object} - Comparison results
 */
function compareFiles(viAnalysis, enAnalysis) {
  const comparison = {
    bothExist: viAnalysis.exists && enAnalysis.exists,
    sizeDifference: null,
    keyCountDifference: null,
    missingRoutes: {
      inEn: [],
      inVi: []
    },
    commonRoutes: {},
    largestRouteDiscrepancies: []
  };

  if (comparison.bothExist) {
    comparison.sizeDifference = {
      bytes: viAnalysis.size.bytes - enAnalysis.size.bytes,
      kb: Math.round((viAnalysis.size.bytes - enAnalysis.size.bytes) / 1024 * 100) / 100,
      percentage: Math.round(((viAnalysis.size.bytes - enAnalysis.size.bytes) / enAnalysis.size.bytes) * 100 * 100) / 100
    };

    comparison.keyCountDifference = {
      count: viAnalysis.keyCount - enAnalysis.keyCount,
      percentage: Math.round(((viAnalysis.keyCount - enAnalysis.keyCount) / enAnalysis.keyCount) * 100 * 100) / 100
    };

    // Find missing routes
    const viRoutes = new Set(Object.keys(viAnalysis.routes));
    const enRoutes = new Set(Object.keys(enAnalysis.routes));

    viRoutes.forEach(route => {
      if (!enRoutes.has(route)) {
        comparison.missingRoutes.inEn.push(route);
      }
    });

    enRoutes.forEach(route => {
      if (!viRoutes.has(route)) {
        comparison.missingRoutes.inVi.push(route);
      }
    });

    // Find common routes and compare their sizes
    viRoutes.forEach(route => {
      if (enRoutes.has(route)) {
        const viRoute = viAnalysis.routes[route];
        const enRoute = enAnalysis.routes[route];
        const keyDiff = viRoute.keyCount - enRoute.keyCount;

        comparison.commonRoutes[route] = {
          viKeyCount: viRoute.keyCount,
          enKeyCount: enRoute.keyCount,
          keyDifference: keyDiff,
          keyDifferencePercentage: Math.round((Math.abs(keyDiff) / Math.max(viRoute.keyCount, enRoute.keyCount)) * 100 * 100) / 100
        };

        // Track largest discrepancies
        if (Math.abs(keyDiff) > 5) {
          comparison.largestRouteDiscrepancies.push({
            route,
            viKeyCount: viRoute.keyCount,
            enKeyCount: enRoute.keyCount,
            difference: keyDiff,
            percentage: comparison.commonRoutes[route].keyDifferencePercentage
          });
        }
      }
    });

    // Sort discrepancies by absolute difference
    comparison.largestRouteDiscrepancies.sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference));
  }

  return comparison;
}

/**
 * Generate priority migration recommendations
 * @param {Object} viAnalysis - Analysis of vi.json
 * @param {Object} enAnalysis - Analysis of en.json
 * @returns {Object} - Priority recommendations
 */
function generatePriorities(viAnalysis, enAnalysis) {
  const priorities = {
    largestNamespaces: [],
    topLevelPages: [],
    migrationOrder: [],
    recommendations: []
  };

  if (viAnalysis.exists) {
    // Prioritize top-level pages structure first
    if (viAnalysis.topLevelStructure.pages) {
      priorities.topLevelPages = Object.entries(viAnalysis.topLevelStructure.pages.children)
        .sort(([, a], [, b]) => b.keyCount - a.keyCount)
        .map(([key, data]) => ({
          route: key,
          keyCount: data.keyCount,
          percentage: Math.round((data.keyCount / viAnalysis.keyCount) * 100 * 100) / 100,
          priority: data.keyCount > 100 ? 'HIGH' :
                   data.keyCount > 50 ? 'MEDIUM' : 'LOW',
          type: 'page',
          hasNestedObjects: data.hasNestedObjects
        }));
    }

    // Get route-level namespaces
    priorities.largestNamespaces = Object.entries(viAnalysis.routeDistribution)
      .slice(0, 10)
      .map(([route, data]) => ({
        route,
        keyCount: data.keyCount,
        percentage: data.percentage,
        priority: data.percentage > 10 ? 'HIGH' :
                 data.percentage > 5 ? 'MEDIUM' : 'LOW',
        type: 'component'
      }));

    // Create migration order combining both
    const allItems = [
      ...priorities.topLevelPages.map(p => ({ ...p, source: 'top-level' })),
      ...priorities.largestNamespaces.filter(ns =>
        !priorities.topLevelPages.some(page => page.route === ns.route)
      ).map(p => ({ ...p, source: 'route-level' }))
    ];

    // Sort by key count for priority
    allItems.sort((a, b) => b.keyCount - a.keyCount);

    // Suggest migration order with phases
    priorities.migrationOrder = allItems.map(item => ({
      ...item,
      estimatedComplexity: item.keyCount > 100 ? 'HIGH' :
                         item.keyCount > 50 ? 'MEDIUM' : 'LOW',
      suggestedPhase: item.keyCount > 150 ? 'Phase 1' :
                     item.keyCount > 50 ? 'Phase 2' : 'Phase 3',
      migrationApproach: item.type === 'page' ? 'Migrate entire page at once' :
                         item.keyCount > 50 ? 'Break into sub-modules' : 'Direct migration'
    }));
  }

  // Generate general recommendations
  priorities.recommendations = [
    'Start migration with largest pages (insurance, creditCard) to see immediate impact',
    'Migrate pages in phases: high-traffic pages first, then supporting pages',
    'Common/shared translations (common.*) should be migrated last as they affect all pages',
    'Financial calculators can be migrated independently as they are self-contained',
    'Consider using automated tools for bulk key extraction and validation',
    'Plan for validation testing after each page/component migration',
    'For large pages like insurance, consider breaking into feature sub-modules',
    'Admin pages can be migrated last as they are not customer-facing'
  ];

  return priorities;
}

/**
 * Main analysis function
 */
async function main() {
  console.log('🔍 Analyzing translation structure...\n');

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Analyze Vietnamese file
  const viPath = path.join(MESSAGES_DIR, 'vi.json');
  console.log('📄 Analyzing vi.json...');
  const viAnalysis = analyzeFile(viPath);

  // Analyze English file
  const enPath = path.join(MESSAGES_DIR, 'en.json');
  console.log('📄 Analyzing en.json...');
  const enAnalysis = analyzeFile(enPath);

  // Compare files
  const comparison = compareFiles(viAnalysis, enAnalysis);

  // Generate priorities
  const priorities = generatePriorities(viAnalysis, enAnalysis);

  // Build complete report
  const report = {
    timestamp: new Date().toISOString(),
    analysis: {
      vietnamese: viAnalysis,
      english: enAnalysis
    },
    comparison,
    priorities,
    summary: {
      totalFiles: (viAnalysis.exists ? 1 : 0) + (enAnalysis.exists ? 1 : 0),
      totalKeys: (viAnalysis.keyCount || 0) + (enAnalysis.keyCount || 0),
      totalSize: {
        bytes: viAnalysis.size.bytes + enAnalysis.size.bytes,
        human: viAnalysis.size.human + ' + ' + enAnalysis.size.human
      },
      largestNamespace: priorities.largestNamespaces[0] || null,
      migrationComplexity: viAnalysis.keyCount > 500 ? 'HIGH' :
                          viAnalysis.keyCount > 200 ? 'MEDIUM' : 'LOW'
    }
  };

  // Save report
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(report, null, 2));

  // Print summary to console
  console.log('\n✅ Analysis complete!\n');
  console.log('📊 Summary:');
  console.log(`  - Vietnamese file: ${viAnalysis.exists ? '✓ Found' : '✗ Missing'}`);
  if (viAnalysis.exists) {
    console.log(`    Size: ${viAnalysis.size.human}`);
    console.log(`    Keys: ${viAnalysis.keyCount.toLocaleString()}`);
    console.log(`    Routes: ${viAnalysis.routeCount}`);
  }

  console.log(`  - English file: ${enAnalysis.exists ? '✓ Found' : '✗ Missing'}`);
  if (enAnalysis.exists) {
    console.log(`    Size: ${enAnalysis.size.human}`);
    console.log(`    Keys: ${enAnalysis.keyCount.toLocaleString()}`);
    console.log(`    Routes: ${enAnalysis.routeCount}`);
  }

  if (viAnalysis.topLevelStructure.pages) {
    console.log('\n📁 Top-level Structure under "pages":');
    const pagesChildren = Object.entries(viAnalysis.topLevelStructure.pages.children)
      .sort(([, a], [, b]) => b.keyCount - a.keyCount)
      .slice(0, 10);

    pagesChildren.forEach(([key, data], idx) => {
      const percentage = Math.round((data.keyCount / viAnalysis.keyCount) * 100 * 100) / 100;
      console.log(`  ${idx + 1}. ${key}: ${data.keyCount} keys (${percentage}%)`);
    });
  }

  if (priorities.largestNamespaces.length > 0) {
    console.log('\n🎯 Largest Route-level Namespaces:');
    priorities.largestNamespaces.slice(0, 5).forEach((ns, idx) => {
      console.log(`  ${idx + 1}. ${ns.route}: ${ns.keyCount} keys (${ns.percentage}%)`);
    });
  }

  console.log(`\n📄 Detailed report saved to: ${OUTPUT_FILE}`);

  // Return for potential programmatic use
  return report;
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Error during analysis:', error);
    process.exit(1);
  });
}

module.exports = {
  countKeys,
  extractRouteKeys,
  analyzeFile,
  compareFiles,
  generatePriorities,
  main
};