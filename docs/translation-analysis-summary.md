# Translation Structure Analysis

This document provides a summary of the current translation structure analysis.

## Overview

- **Vietnamese (vi.json)**: 113.83 KB, 2,023 keys
- **English (en.json)**: 74.1 KB, 1,493 keys
- **Total**: 3516 keys across both locales
- **Migration Complexity**: HIGH

## Top-Level Structure (under "pages")

The translations are organized under a main "pages" object with the following top-level sections:

### Phase 1 - High Priority ( > 100 keys )

1. **insurance** - 726 keys (35.89%)
   - Largest namespace, includes insurance products, tutorials, and comparison
   - Migration approach: Consider breaking into sub-modules for better management

2. **creditCard** - 431 keys (21.3%)
   - Credit card listings, comparisons, and details
   - Migration approach: Migrate entire page at once

3. **admin** - 280 keys (13.84%)
   - Admin dashboard and management features
   - Migration approach: Can be migrated later as it's not customer-facing

4. **tools** - 277 keys (13.69%)
   - Financial calculators and tools
   - Migration approach: Self-contained, can be migrated independently

### Phase 2 - Medium Priority (50-100 keys)

5. **common** - 62 keys (3.06%)
   - Shared/common translations used across pages
   - Migration approach: Migrate last as it affects all pages

6. **userOnboardingPage** - 55 keys (2.72%)
   - User registration and onboarding flow
   - Migration approach: Critical user journey, migrate early

### Phase 3 - Low Priority ( < 50 keys )

7. **grossToNetCalculator** - 44 keys (2.17%)
   - Salary calculation tool
   - Migration approach: Self-contained utility

8. **netToGrossCalculator** - 44 keys (2.17%)
   - Reverse salary calculation
   - Migration approach: Self-contained utility

9. **loanCalculator** - 27 keys (1.33%)
   - Loan calculation tool
   - Migration approach: Self-contained utility

10. **savingsCalculator** - 27 keys (1.33%)
    - Savings calculation tool
    - Migration approach: Self-contained utility

## Migration Recommendations

1. **Start with high-traffic pages** (insurance, creditCard) to see immediate impact
2. **Migrate financial calculators** independently as they are self-contained
3. **Handle common translations** last as they affect all pages
4. **Consider automated tools** for bulk key extraction and validation
5. **Plan validation testing** after each page/component migration
6. **Break down large pages** like insurance into feature sub-modules for better management

## Key Insights

- Vietnamese file is significantly larger (530 more keys) than English
- Most translations are customer-facing (pages.*) structure
- Financial tools are well-separated and can be migrated independently
- Common/shared components are relatively small (62 keys)
- Admin section is substantial but can be prioritized lower

## Next Steps

1. Review the full analysis in `translation-analysis.json` for detailed breakdowns
2. Create migration plan based on the identified priorities
3. Set up automated extraction tools for the identified namespaces
4. Plan validation strategy for each migration phase

---
*Generated on: 2025-12-07T00:27:49.879Z*
*Script: scripts/analyze-translations.js*