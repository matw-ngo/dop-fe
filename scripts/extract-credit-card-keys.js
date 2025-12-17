#!/usr/bin/env node

/**
 * Extract and categorize credit-cards translation keys from monolithic files
 * Usage: node scripts/extract-credit-card-keys.js
 */

const fs = require("fs");
const path = require("path");

// Configuration
const MESSAGES_DIR = path.join(process.cwd(), "messages");
const OUTPUT_DIR = path.join(MESSAGES_DIR, "vi/features/credit-cards");
const OUTPUT_DIR_EN = path.join(MESSAGES_DIR, "en/features/credit-cards");

// Categories for organizing keys
const CATEGORIES = {
  main: ["creditCards", "creditCardsDescription", "loading", "error", "retry"],
  listing: [
    // Search
    "searchCreditCards",
    "searchPlaceholder",

    // Results
    "showingResults",
    "noResults",
    "noResultsDescription",

    // Filters
    "filters.",
    "clearAll",
    "networks.",
    "categories.",
    "rewardsTypes.",
    "annualFeeRange.",
    "incomeRequired.",

    // Sort
    "sortBy.",
    "recommended",
    "annualFeeLow",
    "cashbackHigh",

    // Pagination
    "showing",
    "previous",
    "next",
    "page",
    "of",

    // Grid view
    "cardsSelected",
    "compareCards",
    "viewDetails",
    "applyNow",
  ],
  detail: [
    // Page header
    "cardDetails",
    "cardDetailsDescription",
    "backToCards",

    // Overview
    "overview",
    "cardProvider",
    "cardNetwork",
    "annualFee",
    "interestRate",

    // Benefits
    "benefits.",
    "welcomeBonus",
    "travelBenefits",
    "lifestyleBenefits",
    "diningPrivileges",
    "shoppingPrivileges",
    "entertainmentPrivileges",
    "welBenefit",
    "travelBenefit",
    "lifestyleBenefit",
    "diningBenefit",
    "shoppingBenefit",
    "entertainmentBenefit",

    // Fees
    "fees.",
    "primaryFee",
    "supplementaryFee",
    "replacementFee",
    "lateFee",
    "overLimitFee",
    "cashAdvanceFee",
    "foreignTransactionFee",

    // Features
    "features.",
    "installmentPlans",
    "insuranceCoverage",
    "emergencyAssistance",
    "conciergeService",
    "mobilePayment",
    "contactlessPayment",

    // Requirements
    "requirements.",
    "minimumIncome",
    "minimumAge",
    "documentsRequired",
    "creditScore",
    "employmentStatus",

    // Reviews
    "reviews.",
    "customerRating",
    "recommendedBy",
    "userReviews",
    "expertReview",

    // Apply section
    "howToApply",
    "applyOnline",
    "applyAtBranch",
    "requiredDocuments",
  ],
  comparison: [
    // Comparison page
    "comparison.",
    "comparisonTitle",
    "comparisonSubtitle",
    "maxCardsToCompare",

    // Comparison actions
    "addToCompare",
    "removeFromCompare",
    "clearAllComparisons",
    "compareSelected",

    // Comparison criteria
    "criteria",
    "annualFeeComparison",
    "cashbackRate",
    "welcomeBonusComparison",
    "travelBenefitsComparison",
    "diningBenefitsComparison",

    // Export
    "exportComparison",
    "downloadPDF",
    "shareComparison",

    // Empty states
    "noCardsSelected",
    "selectCardsToCompare",
  ],
};

// Empty states category
const EMPTY_STATES = ["emptyState."];

// Helper function to check if key matches any pattern in array
function matchesPattern(key, patterns) {
  return patterns.some((pattern) => {
    if (pattern.endsWith(".")) {
      return key.startsWith(pattern);
    }
    return key === pattern;
  });
}

// Helper function to categorize a key
function categorizeKey(key) {
  // Check main category first
  if (matchesPattern(key, CATEGORIES.main)) {
    return "main";
  }

  // Check empty states
  if (matchesPattern(key, EMPTY_STATES)) {
    return "listing"; // Empty states belong to listing
  }

  // Check specific categories
  if (matchesPattern(key, CATEGORIES.listing)) {
    return "listing";
  }

  if (matchesPattern(key, CATEGORIES.detail)) {
    return "detail";
  }

  if (matchesPattern(key, CATEGORIES.comparison)) {
    return "comparison";
  }

  // Check for nested comparison keys
  if (key.includes("compare") || key.includes("comparison")) {
    return "comparison";
  }

  // Check for detail-specific keys
  if (
    key.includes("benefit") ||
    key.includes("fee") ||
    key.includes("feature") ||
    key.includes("requirement")
  ) {
    return "detail";
  }

  // Default to listing for general keys
  return "listing";
}

// Load translations from file
function loadTranslations(locale) {
  const filePath = path.join(MESSAGES_DIR, `${locale}.json`);
  if (!fs.existsSync(filePath)) {
    console.error(`Translation file not found: ${filePath}`);
    return {};
  }

  const content = fs.readFileSync(filePath, "utf-8");
  const translations = JSON.parse(content);

  // Extract pages.creditCard namespace
  const creditCardKeys = translations["pages"]?.["creditCard"] || {};
  const creditCardStandalone = translations["creditCard"] || {};

  // Merge both sources
  const allKeys = { ...creditCardKeys, ...creditCardStandalone };

  return allKeys;
}

// Save categorized translations
function saveCategorizedTranslations(categorized, locale, outputDir) {
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Save each category
  Object.entries(categorized).forEach(([category, translations]) => {
    if (Object.keys(translations).length > 0) {
      const filePath = path.join(outputDir, `${category}.json`);
      fs.writeFileSync(
        filePath,
        JSON.stringify(translations, null, 2),
        "utf-8",
      );
      console.log(
        `✅ Saved ${locale}/${category}.json with ${Object.keys(translations).length} keys`,
      );
    }
  });
}

// Main extraction function
function extractKeys() {
  console.log("🔍 Extracting credit-cards translation keys...\n");

  const locales = ["vi", "en"];

  locales.forEach((locale) => {
    console.log(`\n📂 Processing ${locale.toUpperCase()} translations:`);

    // Load existing translations
    const translations = loadTranslations(locale);
    const allKeys = Object.keys(translations);

    console.log(`Found ${allKeys.length} keys in creditCard namespace`);

    // Categorize keys
    const categorized = {
      main: {},
      listing: {},
      detail: {},
      comparison: {},
    };

    const uncategorized = [];

    allKeys.forEach((key) => {
      const category = categorizeKey(key);
      if (categorized[category]) {
        categorized[category][key] = translations[key];
      } else {
        uncategorized.push({ key, value: translations[key] });
      }
    });

    // Print statistics
    console.log("\n📊 Categorization results:");
    Object.entries(categorized).forEach(([cat, keys]) => {
      console.log(`  ${cat}: ${Object.keys(keys).length} keys`);
    });

    if (uncategorized.length > 0) {
      console.log(`  ⚠️  Uncategorized: ${uncategorized.length} keys`);

      // Save uncategorized keys for review
      const outputDir = locale === "vi" ? OUTPUT_DIR : OUTPUT_DIR_EN;
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const uncategorizedPath = path.join(outputDir, "uncategorized.json");
      fs.writeFileSync(
        uncategorizedPath,
        JSON.stringify(uncategorized, null, 2),
        "utf-8",
      );
      console.log(`    Saved to: ${uncategorizedPath}`);
    }

    // Save categorized translations
    const outputDir = locale === "vi" ? OUTPUT_DIR : OUTPUT_DIR_EN;
    saveCategorizedTranslations(categorized, locale, outputDir);

    // Show sample keys for each category
    console.log("\n📝 Sample keys by category:");
    Object.entries(categorized).forEach(([cat, keys]) => {
      const sampleKeys = Object.keys(keys).slice(0, 3);
      console.log(
        `  ${cat}: ${sampleKeys.join(", ")}${Object.keys(keys).length > 3 ? "..." : ""}`,
      );
    });
  });

  console.log("\n✅ Extraction complete!");
  console.log("\nNext steps:");
  console.log(
    "1. Review uncategorized.json files and manually categorize any remaining keys",
  );
  console.log("2. Check that all translations are present in both locales");
  console.log("3. Update component imports to use new namespaces");
  console.log("4. Test all components thoroughly");
}

// Create sample files with proper structure
function createSampleFiles() {
  console.log("\n📁 Creating sample file structure...");

  const samples = {
    main: {
      title: "Credit Cards",
      description: "Compare and find the best credit cards for your needs",
      loading: "Loading...",
      error: "Failed to load credit cards",
      retry: "Retry",
    },
    listing: {
      title: "Credit Cards",
      search: {
        placeholder: "Search credit cards...",
        noResults: "No cards found",
      },
      filters: {
        title: "Filters",
        clearAll: "Clear all",
      },
      pagination: {
        showing: "Showing {start}-{end} of {total} cards",
        previous: "Previous",
        next: "Next",
      },
    },
    detail: {
      title: "Card Details",
      applyNow: "Apply Now",
      back: "Back to cards",
      benefits: {
        title: "Benefits",
        welcome: "Welcome Bonus",
      },
      fees: {
        title: "Fees",
        annual: "Annual Fee",
      },
    },
    comparison: {
      title: "Compare Cards",
      subtitle: "Select cards to compare",
      add: "Add to Compare",
      remove: "Remove",
      export: "Export",
    },
  };

  // Create sample for Vietnamese
  const sampleDirVi = OUTPUT_DIR;
  if (!fs.existsSync(sampleDirVi)) {
    fs.mkdirSync(sampleDirVi, { recursive: true });
  }

  Object.entries(samples).forEach(([category, content]) => {
    const filePath = path.join(sampleDirVi, `${category}.json`);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(content, null, 2), "utf-8");
      console.log(
        `  Created sample: vi/features/credit-cards/${category}.json`,
      );
    }
  });

  // Create sample for English
  const sampleDirEn = OUTPUT_DIR_EN;
  if (!fs.existsSync(sampleDirEn)) {
    fs.mkdirSync(sampleDirEn, { recursive: true });
  }

  Object.entries(samples).forEach(([category, content]) => {
    const filePath = path.join(sampleDirEn, `${category}.json`);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(content, null, 2), "utf-8");
      console.log(
        `  Created sample: en/features/credit-cards/${category}.json`,
      );
    }
  });
}

// Run the extraction
if (require.main === module) {
  // Create sample files first
  createSampleFiles();

  // Extract and categorize keys
  extractKeys();
}

module.exports = {
  extractKeys,
  categorizeKey,
  CATEGORIES,
};
