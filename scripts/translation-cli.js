#!/usr/bin/env node

/**
 * Translation Management CLI Tool
 *
 * A comprehensive command-line interface for managing translations in the application.
 * Supports extraction, validation, duplicate detection, and more.
 */

const { Command } = require("commander");
const fs = require("fs");
const fsPromises = require("fs/promises");
const path = require("path");
const { globSync } = require("glob");
const { default: chalk } = require("chalk");
const { default: inquirer } = require("inquirer");
const { default: ora } = require("ora");

const program = new Command();

// Configuration
const CONFIG = {
  localesDir: path.join(process.cwd(), "messages"),
  srcDir: path.join(process.cwd(), "src"),
  defaultLocales: ["vi", "en"],
  patterns: {
    tsFiles: "**/*.{ts,tsx}",
    translationCalls:
      /(?:useTranslations|getTranslations|t)\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
    translationKeys: /['"`]([^'"`]+)['"`]/g,
    dynamicTranslations: /t\s*\(\s*['"`]([^'"`]+)['"`]/g,
  },
};

// Utility functions
const color = {
  success: (text) => chalk.green.bold(text),
  error: (text) => chalk.red.bold(text),
  warning: (text) => chalk.yellow.bold(text),
  info: (text) => chalk.blue.bold(text),
  muted: (text) => chalk.gray(text),
  highlight: (text) => chalk.cyan.bold(text),
};

const success = (message) => console.log(color.success("✓"), message);
const error = (message) => console.log(color.error("✗"), message);
const warning = (message) => console.log(color.warning("⚠"), message);
const info = (message) => console.log(color.info("ℹ"), message);

// Load translation files (supports both split and flat structure)
const loadTranslations = async (locale) => {
  try {
    // First try to load from split structure
    const localeDir = path.join(CONFIG.localesDir, locale);

    if (fs.existsSync(localeDir)) {
      const translations = {};

      // Load features
      const featuresDir = path.join(localeDir, "features");
      if (fs.existsSync(featuresDir)) {
        const features = fs.readdirSync(featuresDir);
        for (const feature of features) {
          const featureDir = path.join(featuresDir, feature);
          const featureFiles = fs
            .readdirSync(featureDir)
            .filter((f) => f.endsWith(".json"));

          translations[feature] = {};
          for (const file of featureFiles) {
            const filePath = path.join(featureDir, file);
            const content = JSON.parse(fs.readFileSync(filePath, "utf8"));
            translations[feature][file.replace(".json", "")] = content;
          }
        }
      }

      // Load pages
      const pagesDir = path.join(localeDir, "pages");
      if (fs.existsSync(pagesDir)) {
        const pages = fs
          .readdirSync(pagesDir)
          .filter((f) => f.endsWith(".json"));
        for (const file of pages) {
          const filePath = path.join(pagesDir, file);
          const content = JSON.parse(fs.readFileSync(filePath, "utf8"));
          translations[file.replace(".json", "")] = content;
        }
      }

      // Load common
      const commonDir = path.join(localeDir, "common");
      if (fs.existsSync(commonDir)) {
        const common = fs
          .readdirSync(commonDir)
          .filter((f) => f.endsWith(".json"));
        for (const file of common) {
          const filePath = path.join(commonDir, file);
          const content = JSON.parse(fs.readFileSync(filePath, "utf8"));
          translations[file.replace(".json", "")] = content;
        }
      }

      // If we found split files, return them
      if (Object.keys(translations).length > 0) {
        return translations;
      }
    }

    // Fallback to flat file
    const filePath = path.join(CONFIG.localesDir, `${locale}.json`);
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, "utf8"));
    }

    return {};
  } catch (err) {
    error(`Failed to load translations for locale "${locale}": ${err.message}`);
    return {};
  }
};

// Save translation file
const saveTranslations = async (locale, translations) => {
  try {
    const filePath = path.join(CONFIG.localesDir, `${locale}.json`);
    fs.writeFileSync(filePath, JSON.stringify(translations, null, 2), "utf-8");
    success(`Saved translations for locale "${locale}"`);
  } catch (err) {
    error(`Failed to save translations for locale "${locale}": ${err.message}`);
  }
};

// Flatten nested object keys
const flattenObject = (obj, prefix = "") => {
  const flattened = {};

  for (const key in obj) {
    if (Object.hasOwn(obj, key)) {
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (
        typeof obj[key] === "object" &&
        obj[key] !== null &&
        !Array.isArray(obj[key])
      ) {
        Object.assign(flattened, flattenObject(obj[key], newKey));
      } else {
        flattened[newKey] = obj[key];
      }
    }
  }

  return flattened;
};

// Unflatten keys to nested object
const unflattenObject = (flattened) => {
  const result = {};

  for (const key in flattened) {
    if (Object.hasOwn(flattened, key)) {
      const keys = key.split(".");
      let current = result;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = flattened[key];
    }
  }

  return result;
};

// Get all translation keys from an object
const getAllKeys = (obj, prefix = "") => {
  const keys = new Set();

  const traverse = (current, path) => {
    for (const key in current) {
      if (Object.hasOwn(current, key)) {
        const fullPath = path ? `${path}.${key}` : key;

        if (
          typeof current[key] === "object" &&
          current[key] !== null &&
          !Array.isArray(current[key])
        ) {
          traverse(current[key], fullPath);
        } else {
          keys.add(fullPath);
        }
      }
    }
  };

  traverse(obj, prefix);
  return keys;
};

// Extract command
program
  .command("extract")
  .description("Extract translation keys from source code")
  .option("-o, --output <path>", "Output file path", "extracted-keys.json")
  .option(
    "-p, --pattern <pattern>",
    "File pattern to search",
    CONFIG.patterns.tsFiles,
  )
  .option("--namespace <namespace>", "Filter by namespace")
  .option("--json", "Output as JSON")
  .option("--verbose", "Show detailed extraction info")
  .action(async (options) => {
    const spinner = ora("Extracting translation keys...").start();

    try {
      const files = globSync(path.join(CONFIG.srcDir, options.pattern), {
        cwd: process.cwd(),
      });
      const extractedKeys = new Map();
      const namespaceCounts = new Map();

      spinner.text = `Processing ${files.length} files...`;

      for (const file of files) {
        const content = await fs.readFile(file, "utf8");
        const matches = content.matchAll(CONFIG.patterns.translationCalls);

        for (const match of matches) {
          const namespace = match[1];

          if (options.namespace && !namespace.startsWith(options.namespace)) {
            continue;
          }

          // Extract actual t() calls within this namespace
          const namespaceContent = content.substring(match.index);
          const tMatches = namespaceContent.matchAll(
            CONFIG.patterns.dynamicTranslations,
          );

          for (const tMatch of tMatches) {
            const key = tMatch[1];
            const fullKey = namespace ? `${namespace}.${key}` : key;

            extractedKeys.set(fullKey, {
              namespace,
              key,
              file: path.relative(process.cwd(), file),
              line:
                (content.substring(0, tMatch.index).match(/\n/g) || []).length +
                1,
            });

            namespaceCounts.set(
              namespace,
              (namespaceCounts.get(namespace) || 0) + 1,
            );
          }
        }
      }

      spinner.succeed();

      if (options.json || options.output.endsWith(".json")) {
        fs.writeFileSync(
          options.output,
          JSON.stringify(
            {
              keys: Array.from(extractedKeys.entries()).map(([key, info]) => ({
                key,
                ...info,
              })),
              summary: {
                totalKeys: extractedKeys.size,
                namespaces: Object.fromEntries(namespaceCounts),
                filesProcessed: files.length,
              },
            },
            null,
            2,
          ),
          "utf-8",
        );
        success(`Extracted ${extractedKeys.size} keys to ${options.output}`);
      } else {
        console.log("\n" + color.info("Extracted Translation Keys:"));
        console.log(color.muted("─".repeat(50)));

        for (const [key, info] of extractedKeys) {
          console.log(`${color.highlight(key)}`);
          if (options.verbose) {
            console.log(`  ${color.muted(`Namespace: ${info.namespace}`)}`);
            console.log(`  ${color.muted(`File: ${info.file}:${info.line}`)}`);
          }
        }

        console.log("\n" + color.info("Summary:"));
        console.log(`  Total keys: ${color.highlight(extractedKeys.size)}`);
        console.log(`  Files processed: ${color.highlight(files.length)}`);

        if (namespaceCounts.size > 0) {
          console.log("\n" + color.info("Namespaces:"));
          for (const [ns, count] of namespaceCounts) {
            console.log(`  ${color.highlight(ns)}: ${count} keys`);
          }
        }
      }
    } catch (err) {
      spinner.fail();
      error(`Failed to extract keys: ${err.message}`);
      process.exit(1);
    }
  });

// Validate command
program
  .command("validate")
  .description("Validate translation files for consistency and completeness")
  .option(
    "-l, --locales <locales>",
    "Comma-separated list of locales",
    CONFIG.defaultLocales.join(","),
  )
  .option("--namespace <namespace>", "Validate specific namespace only")
  .option("--json", "Output as JSON")
  .option("--strict", "Treat warnings as errors")
  .action(async (options) => {
    const spinner = ora("Validating translations...").start();
    const locales = options.locales.split(",").map((l) => l.trim());
    const errors = [];
    const warnings = [];
    const stats = {
      totalKeys: 0,
      missingKeys: 0,
      emptyValues: 0,
      duplicateKeys: 0,
    };

    try {
      // Load base translations (first locale as reference)
      const baseLocale = locales[0];
      const baseTranslations = await loadTranslations(baseLocale);
      const baseFlattened = flattenObject(baseTranslations);
      const baseKeys = getAllKeys(baseTranslations);
      stats.totalKeys = baseKeys.size;

      spinner.text = `Validating ${locales.length} locales...`;

      for (const locale of locales) {
        const translations = await loadTranslations(locale);
        const flattened = flattenObject(translations);
        const keys = getAllKeys(translations);

        // Check for missing keys
        for (const key of baseKeys) {
          if (!keys.has(key)) {
            errors.push({
              type: "missing_key",
              locale,
              key,
              message: `Missing key "${key}" in locale "${locale}"`,
            });
            stats.missingKeys++;
          }
        }

        // Check for empty values
        for (const [key, value] of Object.entries(flattened)) {
          if (!value || (typeof value === "string" && value.trim() === "")) {
            const severity = options.strict ? "error" : "warning";
            const issue = {
              type: "empty_value",
              locale,
              key,
              message: `Empty value for key "${key}" in locale "${locale}"`,
            };

            if (severity === "error") {
              errors.push(issue);
            } else {
              warnings.push(issue);
            }
            stats.emptyValues++;
          }
        }

        // Check for extra keys (not in base)
        for (const key of keys) {
          if (!baseKeys.has(key)) {
            warnings.push({
              type: "extra_key",
              locale,
              key,
              message: `Extra key "${key}" in locale "${locale}" (not in base locale)`,
            });
          }
        }
      }

      spinner.succeed();

      if (options.json) {
        fs.writeFileSync(
          "docs/i18n/validation-report.json",
          JSON.stringify(
            {
              errors,
              warnings,
              stats,
              isValid:
                errors.length === 0 &&
                (!options.strict || warnings.length === 0),
            },
            null,
            2,
          ),
          "utf-8",
        );
      }

      // Display results
      console.log("\n" + color.info("Validation Results:"));
      console.log(color.muted("─".repeat(50)));

      if (errors.length > 0) {
        console.log("\n" + color.error(`Errors (${errors.length}):`));
        errors.forEach((err) => {
          console.log(`  ${color.error("✗")} ${err.message}`);
        });
      }

      if (warnings.length > 0) {
        console.log("\n" + color.warning(`Warnings (${warnings.length}):`));
        warnings.forEach((warn) => {
          console.log(`  ${color.warning("⚠")} ${warn.message}`);
        });
      }

      console.log("\n" + color.info("Statistics:"));
      console.log(`  Total keys: ${color.highlight(stats.totalKeys)}`);
      console.log(`  Missing keys: ${color.error(stats.missingKeys)}`);
      console.log(`  Empty values: ${color.warning(stats.emptyValues)}`);

      if (errors.length > 0 || (options.strict && warnings.length > 0)) {
        console.log("\n" + color.error("Validation failed!"));
        process.exit(1);
      } else {
        console.log(
          "\n" + color.success("All translations validated successfully!"),
        );
      }
    } catch (err) {
      spinner.fail();
      error(`Failed to validate translations: ${err.message}`);
      process.exit(1);
    }
  });

// Find duplicates command
program
  .command("duplicates")
  .description("Find duplicate translation values")
  .option(
    "-l, --locales <locales>",
    "Comma-separated list of locales",
    CONFIG.defaultLocales.join(","),
  )
  .option("--namespace <namespace>", "Check specific namespace only")
  .option("--json", "Output as JSON")
  .option("--ignore-case", "Ignore case when comparing")
  .option("--trim-whitespace", "Trim whitespace before comparing")
  .action(async (options) => {
    const spinner = ora("Searching for duplicates...").start();
    const locales = options.locales.split(",").map((l) => l.trim());
    const duplicates = [];

    try {
      for (const locale of locales) {
        spinner.text = `Checking locale "${locale}"...`;
        const translations = await loadTranslations(locale);
        const flattened = flattenObject(translations);

        // Create value to keys mapping
        const valueMap = new Map();

        for (const [key, value] of Object.entries(flattened)) {
          if (typeof value !== "string") continue;

          let compareValue = value;
          if (options.trimWhitespace) {
            compareValue = compareValue.trim();
          }
          if (options.ignoreCase) {
            compareValue = compareValue.toLowerCase();
          }

          if (!valueMap.has(compareValue)) {
            valueMap.set(compareValue, []);
          }
          valueMap.get(compareValue).push(key);
        }

        // Find duplicates
        for (const [value, keys] of valueMap) {
          if (keys.length > 1) {
            duplicates.push({
              locale,
              value: flattened[keys[0]],
              keys,
              count: keys.length,
            });
          }
        }
      }

      spinner.succeed();

      if (options.json) {
        fs.writeFileSync(
          "docs/i18n/duplicates-report.json",
          JSON.stringify(duplicates, null, 2),
          "utf-8",
        );
      }

      console.log("\n" + color.info("Duplicate Translation Values:"));
      console.log(color.muted("─".repeat(50)));

      if (duplicates.length === 0) {
        success("No duplicate translations found!");
      } else {
        console.log(
          `\nFound ${color.warning(duplicates.length)} duplicate sets:\n`,
        );

        duplicates.forEach((dup, index) => {
          console.log(
            `${color.warning(`${index + 1}. Duplicate value in "${dup.locale}"`)} (${dup.count} occurrences):`,
          );
          console.log(`  ${color.muted(`Value: "${dup.value}"`)}`);
          console.log(`  ${color.info("Keys:")}`);
          dup.keys.forEach((key) => {
            console.log(`    - ${color.highlight(key)}`);
          });
          console.log("");
        });
      }
    } catch (err) {
      spinner.fail();
      error(`Failed to find duplicates: ${err.message}`);
      process.exit(1);
    }
  });

// Add translation command
program
  .command("add")
  .description("Add new translation keys interactively")
  .option(
    "-l, --locales <locales>",
    "Comma-separated list of locales",
    CONFIG.defaultLocales.join(","),
  )
  .option("--key <key>", "Translation key (skip interactive mode)")
  .option("--namespace <namespace>", "Namespace for the key")
  .option("--interactive", "Force interactive mode")
  .action(async (options) => {
    try {
      const locales = options.locales.split(",").map((l) => l.trim());

      if (!options.interactive && !options.key) {
        // Interactive mode
        const answers = await inquirer.prompt([
          {
            type: "input",
            name: "key",
            message: "Enter translation key:",
            validate: (input) => input.trim() !== "" || "Key is required",
          },
          {
            type: "input",
            name: "namespace",
            message: "Enter namespace (optional):",
            default: "common",
          },
        ]);

        options.key = answers.key;
        options.namespace = answers.namespace;
      }

      if (!options.key) {
        error("Translation key is required");
        process.exit(1);
      }

      const fullKey = options.namespace
        ? `${options.namespace}.${options.key}`
        : options.key;
      const translations = {};

      // Get translation values for each locale
      for (const locale of locales) {
        const existingTranslations = await loadTranslations(locale);
        const flattened = flattenObject(existingTranslations);

        if (flattened[fullKey]) {
          warning(`Key "${fullKey}" already exists in locale "${locale}"`);
          continue;
        }

        if (options.interactive || process.stdin.isTTY) {
          const answer = await inquirer.prompt([
            {
              type: "input",
              name: "value",
              message: `Enter translation for "${locale}":`,
              default: `[${locale}] ${fullKey}`,
              validate: (input) =>
                input.trim() !== "" || "Translation is required",
            },
          ]);
          translations[locale] = answer.value;
        } else {
          // Skip interactive for non-TTY environments
          translations[locale] = `[${locale}] ${fullKey}`;
        }
      }

      // Save translations
      for (const locale of locales) {
        if (translations[locale]) {
          const existingTranslations = await loadTranslations(locale);
          const unflattened = unflattenObject({
            [fullKey]: translations[locale],
          });

          // Merge with existing translations
          const merged = deepMerge(existingTranslations, unflattened);
          await saveTranslations(locale, merged);
        }
      }

      success(
        `Added translation key "${fullKey}" for ${locales.length} locales`,
      );
    } catch (err) {
      error(`Failed to add translation: ${err.message}`);
      process.exit(1);
    }
  });

// Find missing translations command
program
  .command("missing")
  .description("Find missing translations across locales")
  .option(
    "-l, --locales <locales>",
    "Comma-separated list of locales",
    CONFIG.defaultLocales.join(","),
  )
  .option("--base <locale>", "Base locale to compare against", "vi")
  .option("--json", "Output as JSON")
  .option("--add", "Interactively add missing translations")
  .action(async (options) => {
    const spinner = ora("Finding missing translations...").start();
    const locales = options.locales.split(",").map((l) => l.trim());
    const missing = {};

    try {
      // Load base translations
      const baseTranslations = await loadTranslations(options.base);
      const baseFlattened = flattenObject(baseTranslations);
      const baseKeys = Object.keys(baseFlattened);

      spinner.text = `Checking ${locales.length} locales...`;

      // Check each locale
      for (const locale of locales) {
        if (locale === options.base) continue;

        const translations = await loadTranslations(locale);
        const flattened = flattenObject(translations);
        const missingKeys = [];

        for (const key of baseKeys) {
          if (
            !flattened[key] ||
            (typeof flattened[key] === "string" && flattened[key].trim() === "")
          ) {
            missingKeys.push({
              key,
              baseValue: baseFlattened[key],
            });
          }
        }

        if (missingKeys.length > 0) {
          missing[locale] = missingKeys;
        }
      }

      spinner.succeed();

      if (Object.keys(missing).length === 0) {
        success("No missing translations found!");
      } else {
        console.log("\n" + color.info("Missing Translations:"));
        console.log(color.muted("─".repeat(50)));

        const totalMissing = Object.values(missing).reduce(
          (sum, keys) => sum + keys.length,
          0,
        );
        console.log(
          `\nFound ${color.warning(totalMissing)} missing translations across ${Object.keys(missing).length} locales:\n`,
        );

        for (const [locale, keys] of Object.entries(missing)) {
          console.log(color.error(`${locale} (${keys.length} missing):`));
          keys.forEach(({ key, baseValue }) => {
            console.log(`  - ${color.highlight(key)}`);
            console.log(`    ${color.muted(`Base value: "${baseValue}"`)}`);
          });
          console.log("");
        }

        if (options.json) {
          fs.writeFileSync(
            "docs/i18n/missing-translations.json",
            JSON.stringify(missing, null, 2),
            "utf-8",
          );
        }

        if (options.add && process.stdin.isTTY) {
          // Interactive mode to add missing translations
          console.log(
            color.info("Adding missing translations interactively...\n"),
          );

          for (const [locale, keys] of Object.entries(missing)) {
            const translations = await loadTranslations(locale);

            for (const { key, baseValue } of keys) {
              const answer = await inquirer.prompt([
                {
                  type: "input",
                  name: "value",
                  message: `[${locale}] ${key}:`,
                  default: baseValue,
                },
              ]);

              const unflattened = unflattenObject({ [key]: answer.value });
              const merged = deepMerge(translations, unflattened);
              await saveTranslations(locale, merged);
            }
          }

          success("Added all missing translations!");
        }
      }
    } catch (err) {
      spinner.fail();
      error(`Failed to find missing translations: ${err.message}`);
      process.exit(1);
    }
  });

// Statistics command
program
  .command("stats")
  .description("Show translation statistics")
  .option(
    "-l, --locales <locales>",
    "Comma-separated list of locales",
    CONFIG.defaultLocales.join(","),
  )
  .option("--json", "Output as JSON")
  .option("--detailed", "Show detailed breakdown by namespace")
  .action(async (options) => {
    const spinner = ora("Calculating statistics...").start();
    const locales = options.locales.split(",").map((l) => l.trim());
    const stats = {};

    try {
      for (const locale of locales) {
        spinner.text = `Analyzing locale "${locale}"...`;

        const translations = await loadTranslations(locale);
        const flattened = flattenObject(translations);

        const localeStats = {
          locale,
          totalKeys: Object.keys(flattened).length,
          totalCharacters: Object.values(flattened)
            .filter((v) => typeof v === "string")
            .join("").length,
          averageLength: 0,
          namespaces: {},
          emptyValues: 0,
          longestKey: "",
          longestValue: "",
        };

        // Analyze each key
        for (const [key, value] of Object.entries(flattened)) {
          // Namespace analysis
          const namespace = key.split(".")[0];
          if (!localeStats.namespaces[namespace]) {
            localeStats.namespaces[namespace] = {
              count: 0,
              characters: 0,
            };
          }
          localeStats.namespaces[namespace].count++;
          localeStats.namespaces[namespace].characters += (
            typeof value === "string" ? value : ""
          ).length;

          // Empty values
          if (!value || (typeof value === "string" && value.trim() === "")) {
            localeStats.emptyValues++;
          }

          // Longest key and value
          if (key.length > localeStats.longestKey.length) {
            localeStats.longestKey = key;
          }
          if (
            typeof value === "string" &&
            value &&
            value.length > localeStats.longestValue.length
          ) {
            localeStats.longestValue = value;
          }
        }

        // Calculate average length
        const nonEmptyValues = Object.values(flattened).filter(
          (v) => typeof v === "string" && v && v.trim() !== "",
        );
        localeStats.averageLength =
          nonEmptyValues.length > 0
            ? Math.round(
                nonEmptyValues.reduce((sum, v) => sum + v.length, 0) /
                  nonEmptyValues.length,
              )
            : 0;

        // File size
        const filePath = path.join(CONFIG.localesDir, `${locale}.json`);
        if (fs.existsSync(filePath)) {
          const fileStat = fs.statSync(filePath);
          localeStats.fileSizeBytes = fileStat.size;
          localeStats.fileSizeKB =
            Math.round((fileStat.size / 1024) * 100) / 100;
        }

        stats[locale] = localeStats;
      }

      spinner.succeed();

      if (options.json) {
        fs.writeFileSync(
          "docs/i18n/translation-stats.json",
          JSON.stringify(stats, null, 2),
          "utf-8",
        );
      }

      // Display statistics
      console.log("\n" + color.info("Translation Statistics:"));
      console.log(color.muted("─".repeat(50)));

      for (const locale of locales) {
        const localeStats = stats[locale];
        if (!localeStats) continue;

        console.log(`\n${color.highlight(locale.toUpperCase())}:`);
        console.log(
          `  Total keys: ${color.highlight(localeStats.totalKeys.toLocaleString())}`,
        );
        console.log(
          `  File size: ${color.highlight(localeStats.fileSizeKB + " KB")}`,
        );
        console.log(
          `  Total characters: ${color.highlight(localeStats.totalCharacters.toLocaleString())}`,
        );
        console.log(
          `  Average length: ${color.highlight(localeStats.averageLength + " chars")}`,
        );
        console.log(`  Empty values: ${color.error(localeStats.emptyValues)}`);

        if (
          options.detailed &&
          Object.keys(localeStats.namespaces).length > 0
        ) {
          console.log(`\n  ${color.info("Namespaces:")}`);
          const sortedNamespaces = Object.entries(localeStats.namespaces).sort(
            ([, a], [, b]) => b.count - a.count,
          );

          for (const [ns, nsStats] of sortedNamespaces) {
            const percentage = Math.round(
              (nsStats.count / localeStats.totalKeys) * 100,
            );
            console.log(
              `    ${color.highlight(ns)}: ${nsStats.count} keys (${percentage}%)`,
            );
          }
        }

        if (localeStats.longestKey) {
          console.log(
            `\n  ${color.muted("Longest key:")} ${color.highlight(localeStats.longestKey)}`,
          );
        }
        if (localeStats.longestValue) {
          const preview =
            localeStats.longestValue.substring(0, 50) +
            (localeStats.longestValue.length > 50 ? "..." : "");
          console.log(
            `  ${color.muted("Longest value:")} "${color.highlight(preview)}"`,
          );
        }
      }

      // Comparison across locales
      if (locales.length > 1) {
        console.log("\n" + color.info("Comparison:"));
        const keySets = [];
        for (const locale of locales) {
          const translations = await loadTranslations(locale);
          keySets.push(new Set(Object.keys(flattenObject(translations))));
        }
        const commonKeys = keySets.reduce(
          (a, b) => new Set([...a].filter((x) => b.has(x))),
        );

        console.log(
          `  Common keys across all locales: ${color.highlight(commonKeys.size.toLocaleString())}`,
        );

        for (let i = 0; i < locales.length; i++) {
          const locale = locales[i];
          const missing = new Set(
            [...keySets[0]].filter((x) => !keySets[i].has(x)),
          );
          if (missing.size > 0) {
            console.log(
              `  ${locale} missing: ${color.warning(missing.size.toLocaleString())} keys`,
            );
          }
        }
      }
    } catch (err) {
      spinner.fail();
      error(`Failed to calculate statistics: ${err.message}`);
      process.exit(1);
    }
  });

// Helper function for deep merge
function deepMerge(target, source) {
  const result = { ...target };

  for (const key in source) {
    if (Object.hasOwn(source, key)) {
      if (
        typeof source[key] === "object" &&
        source[key] !== null &&
        !Array.isArray(source[key])
      ) {
        result[key] = deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
  }

  return result;
}

// Parse command line arguments
program.parse();

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
