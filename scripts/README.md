# Translation Migration Scripts

This directory contains scripts for migrating and managing translation files in the DOP Frontend project.

## Scripts Overview

### 1. `analyze-translations.js`

Analyzes the current monolithic translation structure to understand size, key distribution, and identify migration priorities.

**Usage:**
```bash
node scripts/analyze-translations.js
```

**Output:**
- Analysis of `vi.json` and `en.json` files
- Key count and file size statistics
- Identification of largest namespaces
- Migration priority recommendations
- Saves detailed report to `docs/translation-analysis.json`

### 2. `migrate-translations.js`

Migrates monolithic translation files into namespace-based chunks organized by features, components, and pages.

**Features:**
- Splits large files into manageable namespace-based chunks
- Automatic backup of original files
- Validation of migration completeness
- Progress reporting
- Error handling and recovery
- Rollback capability

**Usage:**
```bash
# Preview the migration (dry run)
node scripts/migrate-translations.js --dry-run

# Execute the migration
node scripts/migrate-translations.js

# With verbose output
node scripts/migrate-translations.js --verbose

# Skip backup (not recommended)
node scripts/migrate-translations.js --skip-backup

# Force execution without confirmation
node scripts/migrate-translations.js --force
```

**Command Options:**
- `--dry-run`: Preview changes without modifying files
- `--skip-backup`: Skip creating backup files
- `--verbose`: Show detailed output during migration
- `--force`: Skip confirmation prompts

**Target Structure:**
```
messages/
├── vi/
│   ├── common.json
│   ├── features/
│   │   ├── insurance/
│   │   │   ├── calculator.json
│   │   │   ├── tutorials.json
│   │   │   ├── comparison.json
│   │   │   └── insurance.json
│   │   ├── credit-cards/
│   │   │   ├── listing.json
│   │   │   ├── detail.json
│   │   │   └── comparison.json
│   │   ├── tools/
│   │   │   ├── calculators.json
│   │   │   └── converters.json
│   │   └── admin/
│   │       └── dashboard.json
│   ├── pages/
│   │   ├── home.json
│   │   └── onboarding.json
│   └── components/
│       └── ui.json
└── en/
    [same structure as vi/]
```

### 3. `preview-migration.js`

Shows the target directory structure for the migration without performing any changes.

**Usage:**
```bash
node scripts/preview-migration.js
```

**Output:**
- Visual representation of the target namespace structure
- Key counts for each namespace file
- Helpful for understanding the migration outcome

## Migration Process

### Before Migration
1. **Analyze Current Structure**
   ```bash
   node scripts/analyze-translations.js
   ```
   Review the analysis report to understand the current state.

2. **Preview Migration**
   ```bash
   node scripts/preview-migration.js
   ```
   Understand how the files will be organized.

3. **Dry Run Migration**
   ```bash
   node scripts/migrate-translations.js --dry-run --verbose
   ```
   See exactly what will happen without making changes.

### Executing Migration
1. **Run Migration**
   ```bash
   node scripts/migrate-translations.js
   ```
   The script will:
   - Create backups of original files in `messages/backup/`
   - Generate namespace-based files
   - Create migration reports in `docs/migration/`
   - Generate a rollback script

2. **Review Results**
   - Check migration reports for any issues
   - Verify key counts match expectations
   - Test the application with new structure

3. **Update i18n Configuration**
   Update your i18n configuration to work with the namespace-based structure.

### Rollback
If needed, use the generated rollback script:
```bash
./scripts/rollback-migration.sh
```

## Important Notes

1. **Backups**: Always keep backups unless you're absolutely sure
2. **Testing**: Test thoroughly after migration in a staging environment
3. **Version Control**: Commit the migration as a single, atomic change
4. **Team Communication**: Inform your team about the structural changes

## Migration Reports

After migration, detailed reports are generated in `docs/migration/`:
- `migration-vi-{timestamp}.json`: Vietnamese migration details
- `migration-en-{timestamp}.json`: English migration details

Each report includes:
- Original vs migrated key counts
- List of created files
- Validation results
- Migration statistics

## Troubleshooting

### Common Issues

1. **Key Count Mismatch**
   - Small differences are expected due to namespace reorganization
   - Large differences may indicate migration issues

2. **Missing Keys**
   - Check if the key exists in the original file
   - Verify namespace mapping in the script

3. **Permission Errors**
   - Ensure write permissions to `messages/` directory
   - Check if files are locked by other processes

### Getting Help

1. Check the migration reports for detailed information
2. Use verbose mode for debugging: `--verbose`
3. Use dry-run mode to preview changes: `--dry-run`
4. Review the backup files if you need to restore manually

## Future Maintenance

1. **Adding New Translations**
   - Add to appropriate namespace files
   - Follow the established naming conventions
   - Keep related translations together

2. **Namespace Management**
   - Consider creating new namespaces for large features
   - Keep namespace files manageable in size
   - Regular review and cleanup of unused translations

3. **Automation**
   - Consider CI/CD integration for translation validation
   - Automate report generation for tracking
   - Set up notifications for large namespace changes