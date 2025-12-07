#!/usr/bin/env node

/**
 * I18n Management Wrapper Script
 *
 * A shorter, more convenient wrapper for the translation management CLI.
 */

const { spawn } = require('child_process');
const path = require('path');

// Get the command from command line arguments
const args = process.argv.slice(2);
const command = args[0];

if (!command) {
  console.log(`
I18n Management CLI

Usage: node scripts/i18n.js <command> [options]

Commands:
  extract     - Extract translation keys from source code
  validate    - Validate translation files
  duplicates  - Find duplicate translation values
  add         - Add new translation keys
  missing     - Find missing translations
  stats       - Show translation statistics

Examples:
  node scripts/i18n.js extract
  node scripts/i18n.js validate --strict
  node scripts/i18n.js duplicates --ignore-case
  node scripts/i18n.js missing --add
  node scripts/i18n.js stats --detailed

Or use npm scripts:
  pnpm run translations:extract
  pnpm run translations:validate
  pnpm run translations:duplicates
  pnpm run translations:add
  pnpm run translations:missing
  pnpm run translations:stats
`);
  process.exit(0);
}

// Run the main CLI with the provided arguments
const cliPath = path.join(__dirname, 'translation-cli.js');
const child = spawn('node', [cliPath, ...args], {
  stdio: 'inherit',
  shell: true
});

child.on('exit', (code) => {
  process.exit(code);
});