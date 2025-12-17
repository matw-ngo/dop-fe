/**
 * Vietnamese Tax Calculations
 *
 * Comprehensive tax calculation functions for Vietnamese individuals and businesses,
 * including personal income tax, corporate tax, VAT, and other relevant taxes.
 */

import type {
  TaxCalculationParams,
  TaxCalculationResult,
} from "../financial-data/tax-brackets";
import {
  FAMILY_DEDUCTIONS,
  REGIONAL_MINIMUM_WAGE,
  SOCIAL_INSURANCE_RATES,
} from "../financial-data/vietnamese-financial-data";

export interface CorporateTaxCalculation {
  revenue: number;
  deductibleExpenses: number;
  taxableIncome: number;
  corporateTaxRate: number;
  corporateTax: number;
  netProfit: number;
  effectiveTaxRate: number;
}

export interface VatCalculation {
  grossAmount: number;
  vatRate: number;
  vatAmount: number;
  netAmount: number;
  isInputVatDeductible: boolean;
  inputVatAmount?: number;
}

export interface PropertyTaxCalculation {
  propertyValue: number;
  propertyType: "land" | "house" | "apartment";
  location: "urban" | "rural";
  taxRate: number;
  annualTax: number;
}

export interface CapitalGainsTaxCalculation {
  salePrice: number;
  purchasePrice: number;
  sellingCosts: number;
  capitalGain: number;
  taxRate: number;
  taxAmount: number;
  netProceeds: number;
}

export interface SpecializedTaxCalculation {
  freightTransportTax?: {
    vehicleType: string;
    capacity: number;
    taxAmount: number;
  };
  environmentalProtectionTax?: {
    fuelType: string;
    volume: number;
    taxAmount: number;
  };
  importExportTax?: {
    productValue: number;
    importTaxRate: number;
    exportTaxRate: number;
    taxAmount: number;
  };
}

/**
 * Calculate comprehensive personal income tax with Vietnamese specifics
 */
export const calculateComprehensivePersonalTax = (
  params: TaxCalculationParams,
): TaxCalculationResult & {
  additionalInsights: {
    isHighIncomeEarner: boolean;
    taxOptimizationOpportunities: string[];
    recommendedFilingMethod: "standard" | "itemized";
    pensionContributionLimit: number;
    healthInsuranceLimit: number;
  };
  regionalComparison: {
    regionAverageTax: number;
    taxDifferenceFromAverage: number;
    percentileRank: number;
  };
} => {
  // Basic tax calculation (reuse from tax-brackets module)
  const baseCalculation = {
    grossIncome: params.grossMonthlyIncome,
    socialInsurance: 0,
    healthInsurance: 0,
    unemploymentInsurance: 0,
    totalInsurance: 0,
    familyDeductions: 0,
    taxableIncome: 0,
    incomeTax: 0,
    netIncome: 0,
    effectiveTaxRate: 0,
    breakdown: {} as any,
  };

  // Calculate social insurance with regional minimum wage caps
  const regionalMinWage =
    [
      REGIONAL_MINIMUM_WAGE.region1,
      REGIONAL_MINIMUM_WAGE.region2,
      REGIONAL_MINIMUM_WAGE.region3,
      REGIONAL_MINIMUM_WAGE.region4,
    ][params.region - 1] || REGIONAL_MINIMUM_WAGE.region1;

  const maxSocialInsuranceBase = regionalMinWage * 20; // 20 times minimum wage
  const maxHealthInsuranceBase = regionalMinWage * 20;
  const maxUnemploymentInsuranceBase = regionalMinWage * 20;

  const socialInsurance = Math.min(
    params.grossMonthlyIncome * SOCIAL_INSURANCE_RATES.socialInsuranceEmployee,
    maxSocialInsuranceBase * SOCIAL_INSURANCE_RATES.socialInsuranceEmployee,
  );

  const healthInsurance = Math.min(
    params.grossMonthlyIncome * SOCIAL_INSURANCE_RATES.healthInsuranceEmployee,
    maxHealthInsuranceBase * SOCIAL_INSURANCE_RATES.healthInsuranceEmployee,
  );

  const unemploymentInsurance = Math.min(
    params.grossMonthlyIncome *
      SOCIAL_INSURANCE_RATES.unemploymentInsuranceEmployee,
    maxUnemploymentInsuranceBase *
      SOCIAL_INSURANCE_RATES.unemploymentInsuranceEmployee,
  );

  const totalInsurance =
    socialInsurance + healthInsurance + unemploymentInsurance;

  // Calculate family deductions
  const familyDeductionsAmount =
    FAMILY_DEDUCTIONS.taxpayerDeduction +
    params.numberOfDependents * FAMILY_DEDUCTIONS.dependentDeduction;

  // Calculate taxable income
  const taxableIncome = Math.max(
    0,
    params.grossMonthlyIncome - totalInsurance - familyDeductionsAmount,
  );

  // Calculate income tax using progressive rates
  let incomeTax = 0;
  const taxBrackets = [
    { minIncome: 0, maxIncome: 5000000, taxRate: 5, quickCalc: 0 },
    { minIncome: 5000001, maxIncome: 10000000, taxRate: 10, quickCalc: 250000 },
    {
      minIncome: 10000001,
      maxIncome: 18000000,
      taxRate: 15,
      quickCalc: 750000,
    },
    {
      minIncome: 18000001,
      maxIncome: 32000000,
      taxRate: 20,
      quickCalc: 1950000,
    },
    {
      minIncome: 32000001,
      maxIncome: 52000000,
      taxRate: 25,
      quickCalc: 4750000,
    },
    {
      minIncome: 52000001,
      maxIncome: 80000000,
      taxRate: 30,
      quickCalc: 9750000,
    },
    { minIncome: 80000001, taxRate: 35, quickCalc: 18150000 },
  ];

  if (taxableIncome > 0) {
    for (const bracket of taxBrackets) {
      if (taxableIncome <= bracket.minIncome) break;

      const taxableInBracket = Math.min(
        taxableIncome - bracket.minIncome,
        bracket.maxIncome ? bracket.maxIncome - bracket.minIncome : Infinity,
      );

      incomeTax += taxableInBracket * (bracket.taxRate / 100);
    }
  }

  const netIncome = params.grossMonthlyIncome - totalInsurance - incomeTax;
  const effectiveTaxRate =
    params.grossMonthlyIncome > 0
      ? (incomeTax / params.grossMonthlyIncome) * 100
      : 0;

  // Additional insights
  const isHighIncomeEarner = params.grossMonthlyIncome > 50000000; // 50 triệu VND/month
  const taxOptimizationOpportunities: string[] = [];

  if (params.grossMonthlyIncome > 20000000 && params.numberOfDependents === 0) {
    taxOptimizationOpportunities.push(
      "Consider registering family members as dependents if eligible",
    );
  }

  if (socialInsurance < 2380000 && params.grossMonthlyIncome >= 29750000) {
    taxOptimizationOpportunities.push(
      "Consider optimizing social insurance contributions",
    );
  }

  if (effectiveTaxRate > 25) {
    taxOptimizationOpportunities.push(
      "High tax rate detected - consider professional tax advice",
    );
  }

  // Regional comparison
  const regionAverageTax = 12.5; // Average tax rate for the region
  const taxDifferenceFromAverage = effectiveTaxRate - regionAverageTax;
  const percentileRank = Math.max(
    0,
    Math.min(100, (1 - (effectiveTaxRate - 5) / 25) * 100),
  );

  return {
    ...baseCalculation,
    socialInsurance,
    healthInsurance,
    unemploymentInsurance,
    totalInsurance,
    familyDeductions: familyDeductionsAmount,
    taxableIncome,
    incomeTax,
    netIncome,
    effectiveTaxRate,
    additionalInsights: {
      isHighIncomeEarner,
      taxOptimizationOpportunities,
      recommendedFilingMethod: effectiveTaxRate > 20 ? "itemized" : "standard",
      pensionContributionLimit: maxSocialInsuranceBase,
      healthInsuranceLimit: maxHealthInsuranceBase,
    },
    regionalComparison: {
      regionAverageTax,
      taxDifferenceFromAverage,
      percentileRank,
    },
  };
};

/**
 * Calculate corporate income tax
 */
export const calculateCorporateTax = (
  revenue: number,
  deductibleExpenses: number,
  hasTaxIncentives: boolean = false,
  incentiveRate: number = 17,
): CorporateTaxCalculation => {
  const standardTaxRate = 20; // 20% standard corporate tax in Vietnam
  const taxRate = hasTaxIncentives ? incentiveRate : standardTaxRate;

  const taxableIncome = Math.max(0, revenue - deductibleExpenses);
  const corporateTax = taxableIncome * (taxRate / 100);
  const netProfit = taxableIncome - corporateTax;
  const effectiveTaxRate =
    taxableIncome > 0 ? (corporateTax / taxableIncome) * 100 : 0;

  return {
    revenue,
    deductibleExpenses,
    taxableIncome,
    corporateTaxRate: taxRate,
    corporateTax,
    netProfit,
    effectiveTaxRate,
  };
};

/**
 * Calculate VAT (Value Added Tax)
 */
export const calculateVAT = (
  amount: number,
  isInputVat: boolean = false,
  goodsType: "standard" | "essential" | "export" = "standard",
): VatCalculation => {
  let vatRate: number;

  switch (goodsType) {
    case "essential":
      vatRate = 5; // Essential goods 5%
      break;
    case "export":
      vatRate = 0; // Exported goods 0%
      break;
    default:
      vatRate = 10; // Standard rate 10%
  }

  if (isInputVat) {
    // Input VAT calculation
    const vatAmount = amount * (vatRate / 100);
    const netAmount = amount; // Gross amount for input VAT
    const grossAmount = amount + vatAmount;

    return {
      grossAmount,
      vatRate,
      vatAmount,
      netAmount,
      isInputVatDeductible: true,
      inputVatAmount: vatAmount,
    };
  } else {
    // Output VAT calculation
    const vatAmount = amount * (vatRate / 100);
    const grossAmount = amount + vatAmount;
    const netAmount = amount;

    return {
      grossAmount,
      vatRate,
      vatAmount,
      netAmount,
      isInputVatDeductible: false,
    };
  }
};

/**
 * Calculate property tax
 */
export const calculatePropertyTax = (
  propertyValue: number,
  propertyType: "land" | "house" | "apartment",
  location: "urban" | "rural",
  landArea?: number,
): PropertyTaxCalculation => {
  let taxRate: number;

  // Property tax rates in Vietnam (simplified)
  if (propertyType === "land") {
    taxRate = location === "urban" ? 0.03 : 0.02; // 0.03% for urban, 0.02% for rural
  } else if (propertyType === "house") {
    taxRate = location === "urban" ? 0.05 : 0.03; // 0.05% for urban, 0.03% for rural
  } else {
    taxRate = location === "urban" ? 0.04 : 0.025; // 0.04% for urban apartments, 0.025% for rural
  }

  const annualTax = propertyValue * (taxRate / 100);

  return {
    propertyValue,
    propertyType,
    location,
    taxRate,
    annualTax,
  };
};

/**
 * Calculate capital gains tax on property sales
 */
export const calculateCapitalGainsTax = (
  salePrice: number,
  purchasePrice: number,
  sellingCosts: number = 0,
  holdingPeriod: number = 0, // in months
  isPrimaryResidence: boolean = false,
): CapitalGainsTaxCalculation => {
  let taxRate = 20; // Standard capital gains tax rate in Vietnam

  // Exemptions and reductions
  if (isPrimaryResidence && holdingPeriod >= 24) {
    taxRate = 0; // Tax exemption for primary residence held > 2 years
  } else if (isPrimaryResidence && holdingPeriod >= 12) {
    taxRate = 10; // Reduced rate for primary residence held > 1 year
  }

  const capitalGain = Math.max(0, salePrice - purchasePrice - sellingCosts);
  const taxAmount = capitalGain * (taxRate / 100);
  const netProceeds = salePrice - taxAmount - sellingCosts;

  return {
    salePrice,
    purchasePrice,
    sellingCosts,
    capitalGain,
    taxRate,
    taxAmount,
    netProceeds,
  };
};

/**
 * Calculate specialized taxes for specific industries/activities
 */
export const calculateSpecializedTaxes = (
  type: "freight" | "environmental" | "import_export",
  details: any,
): SpecializedTaxCalculation => {
  const result: SpecializedTaxCalculation = {};

  switch (type) {
    case "freight":
      if (details.vehicleType && details.capacity) {
        let taxRate = 0;
        if (details.vehicleType === "truck") {
          if (details.capacity <= 1000) taxRate = 300000;
          else if (details.capacity <= 2000) taxRate = 450000;
          else taxRate = 600000;
        } else if (details.vehicleType === "container_truck") {
          taxRate = 800000;
        }

        result.freightTransportTax = {
          vehicleType: details.vehicleType,
          capacity: details.capacity,
          taxAmount: taxRate * 12, // Annual tax
        };
      }
      break;

    case "environmental":
      if (details.fuelType && details.volume) {
        let taxRate = 0;
        switch (details.fuelType) {
          case "gasoline":
            taxRate = 3800; // VND per liter
            break;
          case "diesel":
            taxRate = 2000; // VND per liter
            break;
          case "kerosene":
            taxRate = 1000; // VND per liter
            break;
        }

        result.environmentalProtectionTax = {
          fuelType: details.fuelType,
          volume: details.volume,
          taxAmount: details.volume * taxRate,
        };
      }
      break;

    case "import_export":
      if (details.productValue) {
        const importTaxRate = details.importTaxRate || 0;
        const exportTaxRate = details.exportTaxRate || 0;
        const taxAmount =
          details.productValue * ((importTaxRate + exportTaxRate) / 100);

        result.importExportTax = {
          productValue: details.productValue,
          importTaxRate,
          exportTaxRate,
          taxAmount,
        };
      }
      break;
  }

  return result;
};

/**
 * Calculate tax implications of different compensation structures
 */
export const analyzeCompensationTax = (
  baseSalary: number,
  bonus: number = 0,
  allowances: number = 0,
  stockOptions: number = 0,
  numberOfDependents: number = 0,
  region: number = 1,
): {
  baseSalaryTax: TaxCalculationResult;
  withBonusTax: TaxCalculationResult;
  withAllowancesTax: TaxCalculationResult;
  totalCompensationTax: TaxCalculationResult;
  taxEfficiency: {
    mostEfficientStructure: string;
    taxSavingsOpportunity: number;
    recommendations: string[];
  };
} => {
  const baseParams = {
    grossMonthlyIncome: baseSalary,
    numberOfDependents,
    region,
  };

  // Calculate tax for base salary only
  const baseSalaryTax = calculateComprehensivePersonalTax(baseParams);

  // Calculate tax with bonus
  const withBonusParams = {
    ...baseParams,
    grossMonthlyIncome: baseSalary + bonus,
  };
  const withBonusTax = calculateComprehensivePersonalTax(withBonusParams);

  // Calculate tax with allowances (assuming non-taxable allowances)
  const withAllowancesParams = {
    ...baseParams,
    grossMonthlyIncome: baseSalary + allowances,
  };
  const withAllowancesTax =
    calculateComprehensivePersonalTax(withAllowancesParams);

  // Calculate total compensation tax
  const totalParams = {
    ...baseParams,
    grossMonthlyIncome: baseSalary + bonus + allowances + stockOptions / 12, // Annual stock options
  };
  const totalCompensationTax = calculateComprehensivePersonalTax(totalParams);

  // Tax efficiency analysis
  const recommendations: string[] = [];
  let mostEfficientStructure = "base_salary";

  if (bonus > 0) {
    const bonusTaxRate =
      ((withBonusTax.incomeTax - baseSalaryTax.incomeTax) / bonus) * 100;
    if (bonusTaxRate > 25) {
      recommendations.push(
        "Consider converting bonus to allowances or performance-based compensation",
      );
    }
  }

  if (allowances > 0) {
    const allowanceTaxRate =
      ((withAllowancesTax.incomeTax - baseSalaryTax.incomeTax) / allowances) *
      100;
    if (allowanceTaxRate < 15) {
      mostEfficientStructure = "allowances_heavy";
      recommendations.push(
        "Focus on non-taxable allowances for better tax efficiency",
      );
    }
  }

  const taxSavingsOpportunity = Math.max(
    0,
    totalCompensationTax.incomeTax - baseSalaryTax.incomeTax * 1.2,
  );

  return {
    baseSalaryTax,
    withBonusTax,
    withAllowancesTax,
    totalCompensationTax,
    taxEfficiency: {
      mostEfficientStructure,
      taxSavingsOpportunity,
      recommendations,
    },
  };
};

/**
 * Generate tax compliance checklist
 */
export const generateTaxComplianceChecklist = (
  taxpayerType: "individual" | "corporate" | "freelancer",
  annualIncome: number,
): {
  filingRequirements: string[];
  deadlines: Array<{ type: string; deadline: string; frequency: string }>;
  requiredDocuments: string[];
  commonMistakes: string[];
  tips: string[];
} => {
  const checklist = {
    filingRequirements: [] as string[],
    deadlines: [] as Array<{
      type: string;
      deadline: string;
      frequency: string;
    }>,
    requiredDocuments: [] as string[],
    commonMistakes: [] as string[],
    tips: [] as string[],
  };

  switch (taxpayerType) {
    case "individual":
      checklist.filingRequirements = [
        "Register for personal income tax",
        "File annual tax reconciliation",
        "Declare income from all sources",
        "Report changes in personal circumstances",
      ];

      checklist.deadlines = [
        {
          type: "Annual tax filing",
          deadline: "March 31",
          frequency: "Yearly",
        },
        {
          type: "Quarterly tax payment",
          deadline: "Last day of quarter",
          frequency: "Quarterly",
        },
        {
          type: "Tax registration",
          deadline: "Within 10 days of starting work",
          frequency: "Once",
        },
      ];

      checklist.requiredDocuments = [
        "Personal ID card/Passport",
        "Tax identification code",
        "Income statements from employer",
        "Proof of deductions and allowances",
        "Supporting documents for dependents",
      ];

      checklist.commonMistakes = [
        "Not declaring all income sources",
        "Missing deduction opportunities",
        "Incorrect calculation of taxable income",
        "Late filing or payment",
      ];

      checklist.tips = [
        "Keep detailed records of all income and expenses",
        "File for all eligible deductions",
        "Consider quarterly tax payments to avoid penalties",
        "Stay updated on tax law changes",
      ];

      if (annualIncome > 120000000) {
        // 120 triệu VND/year
        checklist.filingRequirements.push("File quarterly tax declarations");
      }

      break;

    case "corporate":
      checklist.filingRequirements = [
        "Register for corporate income tax",
        "File monthly/quarterly VAT declarations",
        "Submit annual corporate tax return",
        "Maintain proper accounting records",
      ];

      checklist.deadlines = [
        {
          type: "Monthly VAT filing",
          deadline: "20th of following month",
          frequency: "Monthly",
        },
        {
          type: "Quarterly CIT filing",
          deadline: "30th of following month",
          frequency: "Quarterly",
        },
        {
          type: "Annual CIT filing",
          deadline: "April 30",
          frequency: "Yearly",
        },
      ];

      checklist.requiredDocuments = [
        "Business registration certificate",
        "Tax identification certificate",
        "Financial statements",
        "Invoice and receipt records",
        "Bank statements",
      ];

      checklist.commonMistakes = [
        "Incorrect expense categorization",
        "Missing input VAT claims",
        "Improper revenue recognition",
        "Late filing penalties",
      ];

      checklist.tips = [
        "Implement proper accounting system",
        "Regular VAT reconciliation",
        "Maintain organized expense records",
        "Consider professional tax advice",
      ];

      break;

    case "freelancer":
      checklist.filingRequirements = [
        "Register as individual business household",
        "File quarterly tax declarations",
        "Pay quarterly advance tax",
        "Maintain income and expense records",
      ];

      checklist.deadlines = [
        {
          type: "Quarterly tax filing",
          deadline: "20th of following month",
          frequency: "Quarterly",
        },
        {
          type: "Annual tax reconciliation",
          deadline: "March 31",
          frequency: "Yearly",
        },
      ];

      checklist.requiredDocuments = [
        "Personal identification",
        "Business registration (if applicable)",
        "Income records and invoices",
        "Expense receipts",
        "Bank statements",
      ];

      checklist.commonMistakes = [
        "Underreporting income",
        "Missing deductible expenses",
        "Improper expense classification",
        "Not making quarterly payments",
      ];

      checklist.tips = [
        "Separate business and personal finances",
        "Track all business expenses",
        "Make quarterly tax payments",
        "Consider tax deduction method choice",
      ];

      break;
  }

  return checklist;
};

export default {
  calculateComprehensivePersonalTax,
  calculateCorporateTax,
  calculateVAT,
  calculatePropertyTax,
  calculateCapitalGainsTax,
  calculateSpecializedTaxes,
  analyzeCompensationTax,
  generateTaxComplianceChecklist,
};
