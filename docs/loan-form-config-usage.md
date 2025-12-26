# Loan Form Configuration - Documentation

## Overview

This document describes the loan application form configuration, demo scenarios, and how to use them for customer demonstrations.

## Table of Contents

1. [Configuration Structure](#configuration-structure)
2. [Field Definitions](#field-definitions)
3. [Conditional Logic](#conditional-logic)
4. [Demo Scenarios](#demo-scenarios)
5. [Usage Examples](#usage-examples)
6. [Best Practices](#best-practices)

---

## Configuration Structure

### Main Files

```
src/configs/forms/
├── loan-form-config.ts      # Main form configuration (390 lines)
├── loan-form-demo-cases.ts # Demo scenarios (7 scenarios)
└── SectionHeader.ts         # Custom component (51 lines)
```

### Configuration Architecture

The loan form uses a **multi-step wizard** configuration with:

```typescript
interface DynamicFormConfig {
  id: string;                    // Unique wizard identifier
  steps: FormStep[];              // Array of form steps
  navigation: NavigationConfig;     // Navigation settings
}
```

**Steps:**
1. **loan-info**: Personal information (4 fields)
2. **income-info**: Employment & income (5 fields with conditional logic)
3. **financial-info**: Financial background (2 fields)

---

## Field Definitions

### Step 1: Personal Information (`loan-info`)

| Field ID | Type | Required | Validation | Description |
|----------|------|----------|------------|-------------|
| `fullName` | TEXT | Yes | Min 2 chars | Full name (Họ và tên) |
| `idCard` | TEXT | Yes | 12 digits | Vietnamese national ID |
| `city` | SELECT | Yes | - | Province/City (Hà Nội, TP.HCM, Đà Nẵng) |
| `vehicleOwnership` | SELECT | Yes | - | Vehicle registration owner status |

### Step 2: Income Information (`income-info`)

| Field ID | Type | Conditional | Validation | Description |
|----------|------|-------------|------------|-------------|
| `jobStatus` | SELECT | Always | Required | Employment status |
| `companyName` | TEXT | salaried | Required | Company name |
| `position` | TEXT | salaried | Required | Job title/position |
| `businessType` | TEXT | self_employed | Required | Business type/field |
| `monthlyIncome` | SELECT | salaried/self_employed | Required | Income bracket |

**Conditional Logic:**
```typescript
// Shows when jobStatus === "salaried"
dependencies: [{
  conditions: [{
    fieldId: "jobStatus",
    operator: ConditionOperator.EQUALS,
    value: "salaried"
  }],
  action: "show"
}]

// Shows when jobStatus === "self_employed"
dependencies: [{
  conditions: [{
    fieldId: "jobStatus",
    operator: ConditionOperator.EQUALS,
    value: "self_employed"
  }],
  action: "show"
}]

// Shows when jobStatus IN ["salaried", "self_employed"]
dependencies: [{
  conditions: [{
    fieldId: "jobStatus",
    operator: ConditionOperator.IN,
    value: ["salaried", "self_employed"]
  }],
  action: "show"
}]
```

### Step 3: Financial Information (`financial-info`)

| Field ID | Type | Required | Options | Description |
|----------|------|----------|----------|-------------|
| `existingLoans` | SELECT | Yes | none, 1, 2, 3, >3 | Number of existing loans |
| `creditHistory` | SELECT | Yes | none, group2, group3+ | Credit history status |

---

## Conditional Logic

### How It Works

The form uses **conditional dependencies** to show/hide fields based on user selections:

1. **jobStatus** drives the visibility of income fields
2. When user selects "Đi làm hưởng lương" → Show: companyName, position, monthlyIncome
3. When user selects "Kinh doanh/Lao động tự do" → Show: businessType, monthlyIncome
4. When user selects "Không có việc làm" → Show: No income fields (only jobStatus)

### Conditional Field Examples

```typescript
// Example: Company name field (only for salaried employees)
{
  id: "companyName",
  name: "companyName",
  type: FieldType.TEXT,
  label: "Tên công ty",
  dependencies: [
    {
      conditions: [
        {
          fieldId: "jobStatus",
          operator: ConditionOperator.EQUALS,
          value: "salaried",
        },
      ],
      action: "show",
    },
  ],
  validation: [{ type: ValidationRuleType.REQUIRED }],
}
```

---

## Demo Scenarios

### Available Scenarios

| ID | Name | Category | Outcome | Description |
|----|------|----------|----------|-------------|
| `salaried-employee` | Nhân viên văn phòng - Thu nhập tốt | employment | approve | Ideal candidate, high income, good credit |
| `self-employed-business` | Chủ doanh nghiệp - Kinh doanh ổn định | employment | approve | Stable business, 1 loan, good credit |
| `unemployed-no-income` | Không có việc làm - Đang tìm kiếm | employment | reject | Unemployed, no income, likely rejection |
| `multiple-loans-good-credit` | Nhiều khoản vay - Trả đúng hạn | credit | review | High income, 3 loans, paying on time |
| `bad-credit-history` | Lịch sử tín dụng xấu - Nhóm 3+ | credit | reject | Bad credit group 3+, likely rejection |
| `self-employed-low-income` | Kinh doanh tự do - Thu nhập thấp | income | review | Self-employed, low income, marginal |
| `salaried-group2-debt` | Nhân viên - Nợ chậm trả nhóm 2 | credit | review | Salaried, medium income, group 2 debt |

### Demo Data Structure

```typescript
interface LoanFormDemoCase {
  id: string;                  // Unique identifier
  name: string;                // Display name (Vietnamese)
  description: string;         // Scenario description
  expectedOutcome: "approve" | "review" | "reject";
  category: "employment" | "credit" | "income" | "edge-cases";
  formData: {
    // Step 1: Personal Info
    fullName: string;
    idCard: string;
    city: "hanoi" | "hcm" | "danang";
    vehicleOwnership: "yes" | "no";

    // Step 2: Income Info
    jobStatus: "salaried" | "self_employed" | "unemployed";
    companyName?: string;
    position?: string;
    businessType?: string;
    monthlyIncome?: "<5m" | "5-10m" | "10-20m" | ">20m";

    // Step 3: Financial Info
    existingLoans: "none" | "1" | "2" | "3" | ">3";
    creditHistory: "none" | "group2" | "group3+";
  };
  notes?: string;
  tags: string[];
}
```

---

## Usage Examples

### 1. Basic Usage in a Component

```typescript
import { loanFormWizardConfig } from "@/configs/forms/loan-form-config";
import { StepWizard } from "@/components/form-generation";
import { FormThemeProvider, legacyLoanTheme } from "@/components/form-generation/themes";

function LoanApplicationPage() {
  const handleComplete = (data) => {
    console.log("Form submitted:", data);
  };

  return (
    <FormThemeProvider theme={legacyLoanTheme}>
      <StepWizard
        config={loanFormWizardConfig}
        onComplete={handleComplete}
      />
    </FormThemeProvider>
  );
}
```

### 2. Loading Demo Data

```typescript
import { DemoLoader } from "@/app/[locale]/loan-info/components/DemoLoader";

function LoanApplicationPage() {
  const [demoData, setDemoData] = useState(null);

  const handleLoadDemo = (demoId, formData) => {
    console.log("Loading demo:", demoId);
    setDemoData(formData);
  };

  return (
    <>
      <DemoLoader onLoadDemo={handleLoadDemo} />
      <StepWizard
        config={loanFormWizardConfig}
        initialData={demoData ?? undefined}
        onComplete={handleComplete}
      />
    </>
  );
}
```

### 3. Accessing Demo Scenarios Programmatically

```typescript
import {
  LOAN_FORM_DEMO_CASES,
  DemoHelpers,
} from "@/configs/forms/loan-form-demo-cases";

// Get all demos
const allDemos = DemoHelpers.getAllDemos();

// Get specific demo
const salariedDemo = DemoHelpers.getDemoById("salaried-employee");

// Get demos by category
const creditDemos = DemoHelpers.getDemosByCategory("credit");

// Get demos by outcome
const approvedDemos = DemoHelpers.getDemosByOutcome("approve");

// Search demos by tags
const businessDemos = DemoHelpers.searchDemosByTags("business-owner");

// Search demos by name/description
const searchResults = DemoHelpers.searchDemos("thu nhập cao");
```

### 4. Using Demo Loader for Customer Demo

When demonstrating to customers:

1. **Open the loan-info page**
2. **Click "Demo Scenarios" button** (purple gradient)
3. **Select a scenario** based on what you want to demonstrate:
   - Show ideal case → "Nhân viên văn phòng - Thu nhập tốt"
   - Show business owner → "Chủ doanh nghiệp - Kinh doanh ổn định"
   - Show rejection case → "Không có việc làm" or "Lịch sử tín dụng xấu"
4. **Click the demo card** to load data into form
5. **Walk through the form** with pre-filled data
6. **Submit** to show results

---

## Best Practices

### For Developers

1. **Maintain Separation of Concerns**
   - Keep configuration in `loan-form-config.ts`
   - Keep business logic in page components
   - Keep demo scenarios in separate file

2. **Use Realistic Demo Data**
   - Use realistic Vietnamese names and data
   - Reflect actual user demographics
   - Cover edge cases and boundary conditions

3. **Document Conditional Logic**
   - Always add comments explaining why a field is conditional
   - Include expected behavior for each condition

4. **Type Safety**
   - Use TypeScript types from `@/types/forms/loan-form.ts`
   - Avoid `any` types in form data
   - Validate demo data structure

### For Demo Presentations

1. **Start with Positive Scenarios**
   - First show an "approve" scenario to set expectations
   - Then show "review" scenarios for nuance
   - Finally show "reject" scenarios for edge cases

2. **Highlight Conditional Fields**
   - Point out when fields appear/disappear based on selections
   - Explain the logic behind the conditional fields
   - Show how the form adapts to different situations

3. **Use Tags Wisely**
   - Use tags to filter demos quickly during presentation
   - Focus on specific categories (employment, credit, income)
   - Show multiple scenarios within the same category

4. **Explain Expected Outcomes**
   - Mention the outcome badge (Duyệt dễ, Cần xem xét, Khó duyệt)
   - Explain what factors influence the outcome
   - Be transparent about scoring logic

---

## Troubleshooting

### Demo Not Loading

**Problem**: Clicking a demo doesn't populate the form.

**Solution**:
1. Check browser console for errors
2. Verify demo data structure matches field names
3. Ensure `initialData` prop is passed to StepWizard
4. Check that demo data types match field types

### Fields Not Showing

**Problem**: Conditional fields don't appear.

**Solution**:
1. Verify dependency conditions are correct
2. Check operator type (EQUALS, IN, etc.)
3. Ensure field IDs match exactly
4. Debug by logging the conditional evaluation

### TypeScript Errors

**Problem**: Type mismatches with demo data.

**Solution**:
1. Use proper types from `loan-form.ts`
2. Cast `unknown` types only when necessary
3. Run `npx tsc --noEmit` to check
4. Add proper type guards for runtime checks

---

## Additional Resources

- [DynamicFormConfig Type Definition](src/components/form-generation/types.ts)
- [Loan Form Types](src/types/forms/loan-form.ts)
- [StepWizard Component](src/components/form-generation/wizard/StepWizard.tsx)
- [Form Generation System](src/components/form-generation/README.md)

---

## Changelog

### Version 1.0.0 (2024-12-26)
- Initial configuration extraction from page component
- Created 7 demo scenarios
- Implemented DemoLoader component
- Added comprehensive documentation

---

**Last Updated**: December 26, 2024
**Maintained By**: Development Team
