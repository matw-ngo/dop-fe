/**
 * Vietnamese Market Indicators and Economic Data
 *
 * This module provides comprehensive market indicators, economic data,
 * and financial market analysis for Vietnam.
 */

export interface MarketIndicator {
  date: string;
  consumerPriceIndex: number; // CPI
  inflationRate: number; // Annual inflation rate
  baseInterestRate: number; // SBV base rate
  refinancingRate: number; // SBV refinancing rate
  discountRate: number; // SBV discount rate
  gdpGrowthRate: number; // GDP growth rate
  averageDepositRate: number; // Average bank deposit rate
  averageLendingRate: number; // Average bank lending rate
  exchangeRate: number; // USD/VND exchange rate
  moneySupply: number; // M2 money supply
  creditGrowth: number; // Credit growth rate
  unemploymentRate: number; // Unemployment rate
}

export interface MarketTrend {
  indicator: string;
  currentValue: number;
  previousValue: number;
  change: number;
  changePercent: number;
  direction: "up" | "down" | "stable";
  trend: "increasing" | "decreasing" | "stable" | "volatile";
  significance: "high" | "medium" | "low";
}

export interface EconomicOutlook {
  gdpGrowthForecast: number;
  inflationForecast: number;
  interestRateOutlook: "rising" | "stable" | "falling";
  riskFactors: string[];
  opportunities: string[];
  recommendations: string[];
}

export interface RegionalData {
  region: string;
  gdpContribution: number; // % of national GDP
  averageIncome: number; // Monthly average income (VND)
  unemploymentRate: number;
  propertyPriceIndex: number;
  businessConfidence: number;
  creditDemand: number; // % increase/decrease
}

/**
 * Current Vietnamese Market Indicators (2024)
 */
export const CURRENT_MARKET_INDICATORS: MarketIndicator = {
  date: "2024-12-01",
  consumerPriceIndex: 113.47, // Base year 2016 = 100
  inflationRate: 3.89, // Annual inflation rate
  baseInterestRate: 4.5, // SBV base rate
  refinancingRate: 5.0, // SBV refinancing rate
  discountRate: 3.0, // SBV discount rate
  gdpGrowthRate: 6.3, // Annual GDP growth rate
  averageDepositRate: 5.2, // Average across major banks
  averageLendingRate: 9.8, // Average across major banks
  exchangeRate: 25455, // USD/VND
  moneySupply: 15900000000000000, // M2 in VND (approx 15.9 quadrillion)
  creditGrowth: 14.2, // Year-on-year credit growth
  unemploymentRate: 2.27, // National unemployment rate
};

/**
 * Historical Market Indicators (2020-2024)
 */
export const HISTORICAL_MARKET_INDICATORS: MarketIndicator[] = [
  {
    date: "2020-12-01",
    consumerPriceIndex: 103.23,
    inflationRate: 3.19,
    baseInterestRate: 4.0,
    refinancingRate: 4.5,
    discountRate: 2.5,
    gdpGrowthRate: 2.9,
    averageDepositRate: 4.5,
    averageLendingRate: 8.7,
    exchangeRate: 23152,
    moneySupply: 11800000000000000,
    creditGrowth: 13.1,
    unemploymentRate: 2.48,
  },
  {
    date: "2021-12-01",
    consumerPriceIndex: 108.26,
    inflationRate: 1.84,
    baseInterestRate: 4.0,
    refinancingRate: 4.5,
    discountRate: 2.5,
    gdpGrowthRate: 2.6,
    averageDepositRate: 4.8,
    averageLendingRate: 8.9,
    exchangeRate: 23615,
    moneySupply: 12900000000000000,
    creditGrowth: 12.8,
    unemploymentRate: 2.43,
  },
  {
    date: "2022-12-01",
    consumerPriceIndex: 110.62,
    inflationRate: 4.55,
    baseInterestRate: 6.0,
    refinancingRate: 6.5,
    discountRate: 4.5,
    gdpGrowthRate: 8.0,
    averageDepositRate: 5.8,
    averageLendingRate: 10.2,
    exchangeRate: 24385,
    moneySupply: 14200000000000000,
    creditGrowth: 13.5,
    unemploymentRate: 2.32,
  },
  {
    date: "2023-12-01",
    consumerPriceIndex: 111.94,
    inflationRate: 3.25,
    baseInterestRate: 4.5,
    refinancingRate: 5.0,
    discountRate: 3.0,
    gdpGrowthRate: 5.1,
    averageDepositRate: 5.0,
    averageLendingRate: 9.5,
    exchangeRate: 24975,
    moneySupply: 15200000000000000,
    creditGrowth: 13.8,
    unemploymentRate: 2.28,
  },
  CURRENT_MARKET_INDICATORS,
];

/**
 * Regional Economic Data
 */
export const REGIONAL_DATA: RegionalData[] = [
  {
    region: "Miền Bắc (Red River Delta)",
    gdpContribution: 35.2,
    averageIncome: 8500000,
    unemploymentRate: 2.1,
    propertyPriceIndex: 118.5,
    businessConfidence: 72.3,
    creditDemand: 8.2,
  },
  {
    region: "Miền Trung (Central Coast)",
    gdpContribution: 18.7,
    averageIncome: 7200000,
    unemploymentRate: 2.4,
    propertyPriceIndex: 95.8,
    businessConfidence: 68.7,
    creditDemand: 12.5,
  },
  {
    region: "Miền Nam (Southeast)",
    gdpContribution: 41.3,
    averageIncome: 9200000,
    unemploymentRate: 2.0,
    propertyPriceIndex: 125.7,
    businessConfidence: 75.8,
    creditDemand: 6.8,
  },
  {
    region: "Tây Nguyên (Central Highlands)",
    gdpContribution: 4.8,
    averageIncome: 6800000,
    unemploymentRate: 2.6,
    propertyPriceIndex: 78.9,
    businessConfidence: 65.2,
    creditDemand: 15.3,
  },
];

/**
 * Current Economic Outlook
 */
export const ECONOMIC_OUTLOOK: EconomicOutlook = {
  gdpGrowthForecast: 6.5, // 2025 forecast
  inflationForecast: 3.5, // 2025 forecast
  interestRateOutlook: "stable",
  riskFactors: [
    "Global economic uncertainty",
    "Supply chain disruptions",
    "Exchange rate volatility",
    "Property market concerns",
    "External debt risks",
  ],
  opportunities: [
    "Digital transformation acceleration",
    "Export growth potential",
    "Foreign investment inflows",
    "Domestic consumption recovery",
    "Infrastructure development",
  ],
  recommendations: [
    "Maintain diversified investment portfolio",
    "Consider fixed-rate loans before potential rate increases",
    "Monitor inflation-protected investment opportunities",
    "Focus on high-quality creditworthy borrowers",
    "Maintain adequate liquidity reserves",
  ],
};

/**
 * Get market trends analysis
 */
export const getMarketTrends = (): MarketTrend[] => {
  const current = CURRENT_MARKET_INDICATORS;
  const previous =
    HISTORICAL_MARKET_INDICATORS[HISTORICAL_MARKET_INDICATORS.length - 2];

  return [
    {
      indicator: "Lạm phát",
      currentValue: current.inflationRate,
      previousValue: previous.inflationRate,
      change: current.inflationRate - previous.inflationRate,
      changePercent:
        ((current.inflationRate - previous.inflationRate) /
          previous.inflationRate) *
        100,
      direction:
        current.inflationRate > previous.inflationRate
          ? "up"
          : current.inflationRate < previous.inflationRate
            ? "down"
            : "stable",
      trend: "stable",
      significance: "medium",
    },
    {
      indicator: "Lãi suất cơ bản",
      currentValue: current.baseInterestRate,
      previousValue: previous.baseInterestRate,
      change: current.baseInterestRate - previous.baseInterestRate,
      changePercent:
        ((current.baseInterestRate - previous.baseInterestRate) /
          previous.baseInterestRate) *
        100,
      direction:
        current.baseInterestRate > previous.baseInterestRate
          ? "up"
          : current.baseInterestRate < previous.baseInterestRate
            ? "down"
            : "stable",
      trend: "stable",
      significance: "high",
    },
    {
      indicator: "Tăng trưởng GDP",
      currentValue: current.gdpGrowthRate,
      previousValue: previous.gdpGrowthRate,
      change: current.gdpGrowthRate - previous.gdpGrowthRate,
      changePercent:
        ((current.gdpGrowthRate - previous.gdpGrowthRate) /
          previous.gdpGrowthRate) *
        100,
      direction:
        current.gdpGrowthRate > previous.gdpGrowthRate
          ? "up"
          : current.gdpGrowthRate < previous.gdpGrowthRate
            ? "down"
            : "stable",
      trend: "increasing",
      significance: "high",
    },
    {
      indicator: "Tỷ giá USD/VND",
      currentValue: current.exchangeRate,
      previousValue: previous.exchangeRate,
      change: current.exchangeRate - previous.exchangeRate,
      changePercent:
        ((current.exchangeRate - previous.exchangeRate) /
          previous.exchangeRate) *
        100,
      direction:
        current.exchangeRate > previous.exchangeRate
          ? "up"
          : current.exchangeRate < previous.exchangeRate
            ? "down"
            : "stable",
      trend: "increasing",
      significance: "medium",
    },
    {
      indicator: "Tín dụng toàn ngành",
      currentValue: current.creditGrowth,
      previousValue: previous.creditGrowth,
      change: current.creditGrowth - previous.creditGrowth,
      changePercent:
        ((current.creditGrowth - previous.creditGrowth) /
          previous.creditGrowth) *
        100,
      direction:
        current.creditGrowth > previous.creditGrowth
          ? "up"
          : current.creditGrowth < previous.creditGrowth
            ? "down"
            : "stable",
      trend: "increasing",
      significance: "high",
    },
  ];
};

/**
 * Get regional market comparison
 */
export const getRegionalComparison = (): {
  highestGdp: RegionalData;
  lowestUnemployment: RegionalData;
  highestIncome: RegionalData;
  fastestCreditGrowth: RegionalData;
} => {
  const highestGdp = REGIONAL_DATA.reduce((prev, current) =>
    prev.gdpContribution > current.gdpContribution ? prev : current,
  );

  const lowestUnemployment = REGIONAL_DATA.reduce((prev, current) =>
    prev.unemploymentRate < current.unemploymentRate ? prev : current,
  );

  const highestIncome = REGIONAL_DATA.reduce((prev, current) =>
    prev.averageIncome > current.averageIncome ? prev : current,
  );

  const fastestCreditGrowth = REGIONAL_DATA.reduce((prev, current) =>
    prev.creditDemand > current.creditDemand ? prev : current,
  );

  return {
    highestGdp,
    lowestUnemployment,
    highestIncome,
    fastestCreditGrowth,
  };
};

/**
 * Calculate inflation-adjusted returns
 */
export const calculateRealReturns = (
  nominalRate: number,
  inflationRate: number = CURRENT_MARKET_INDICATORS.inflationRate,
): number => {
  // Fisher equation: (1 + nominal) / (1 + inflation) - 1
  return ((1 + nominalRate / 100) / (1 + inflationRate / 100) - 1) * 100;
};

/**
 * Calculate purchasing power impact
 */
export const calculatePurchasingPowerImpact = (
  amount: number,
  inflationRate: number = CURRENT_MARKET_INDICATORS.inflationRate,
  years: number = 1,
): {
  futureValue: number;
  purchasingPower: number;
  loss: number;
  lossPercentage: number;
} => {
  const inflationMultiplier = (1 + inflationRate / 100) ** years;
  const futureValue = amount * inflationMultiplier;
  const purchasingPower = amount / inflationMultiplier;
  const loss = amount - purchasingPower;
  const lossPercentage = (loss / amount) * 100;

  return {
    futureValue,
    purchasingPower,
    loss,
    lossPercentage,
  };
};

/**
 * Get market risk assessment
 */
export const getMarketRiskAssessment = (): {
  overallRisk: "low" | "medium" | "high";
  factors: Array<{
    factor: string;
    risk: "low" | "medium" | "high";
    impact: string;
    mitigation: string;
  }>;
  recommendations: string[];
} => {
  const factors = [
    {
      factor: "Inflation volatility",
      risk: "medium" as const,
      impact: "Erodes real returns on savings and fixed-income investments",
      mitigation: "Diversify into inflation-protected assets",
    },
    {
      factor: "Interest rate changes",
      risk: "medium" as const,
      impact: "Affects borrowing costs and bond prices",
      mitigation: "Consider fixed-rate loans and duration management",
    },
    {
      factor: "Exchange rate risk",
      risk: "medium" as const,
      impact: "Affects foreign currency-denominated assets and liabilities",
      mitigation: "Natural hedging and forward contracts",
    },
    {
      factor: "Property market correction",
      risk: "high" as const,
      impact: "Could impact loan collateral values and bank stability",
      mitigation: "Conservative LTV ratios and stress testing",
    },
    {
      factor: "External debt vulnerability",
      risk: "medium" as const,
      impact: "Vulnerability to global financial conditions",
      mitigation: "Maintain adequate foreign exchange reserves",
    },
  ];

  const highRiskFactors = factors.filter((f) => f.risk === "high").length;
  const overallRisk =
    highRiskFactors >= 2 ? "high" : highRiskFactors >= 1 ? "medium" : "low";

  const recommendations = [
    "Maintain diversified portfolio across asset classes",
    "Monitor central bank policy changes closely",
    "Consider both fixed and floating rate loan options",
    "Maintain adequate liquidity reserves",
    "Regular stress testing of loan portfolios",
    "Stay informed about global economic developments",
  ];

  return {
    overallRisk,
    factors,
    recommendations,
  };
};

/**
 * Format percentage display
 */
export const formatPercentage = (
  value: number,
  decimals: number = 2,
): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format large numbers with appropriate units
 */
export const formatLargeNumber = (value: number): string => {
  if (value >= 1000000000000) {
    return `${(value / 1000000000000).toFixed(1)} nghìn tỷ VND`;
  } else if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)} tỷ VND`;
  } else if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)} triệu VND`;
  } else {
    return `${value.toLocaleString("vi-VN")} VND`;
  }
};

/**
 * Get market sentiment indicator
 */
export const getMarketSentiment = (): {
  overall: "positive" | "neutral" | "negative";
  score: number; // -100 to 100
  factors: Array<{
    name: string;
    weight: number;
    score: number;
    impact: string;
  }>;
} => {
  const factors = [
    {
      name: "GDP Growth",
      weight: 0.3,
      score:
        CURRENT_MARKET_INDICATORS.gdpGrowthRate > 6
          ? 80
          : CURRENT_MARKET_INDICATORS.gdpGrowthRate > 5
            ? 50
            : 20,
      impact: "Strong economic growth supports positive sentiment",
    },
    {
      name: "Inflation",
      weight: 0.2,
      score:
        CURRENT_MARKET_INDICATORS.inflationRate < 4
          ? 80
          : CURRENT_MARKET_INDICATORS.inflationRate < 6
            ? 50
            : 20,
      impact: "Moderate inflation supports stable economic environment",
    },
    {
      name: "Interest Rates",
      weight: 0.25,
      score:
        CURRENT_MARKET_INDICATORS.baseInterestRate <= 5
          ? 70
          : CURRENT_MARKET_INDICATORS.baseInterestRate <= 7
            ? 40
            : 10,
      impact: "Reasonable interest rates support borrowing and investment",
    },
    {
      name: "Credit Growth",
      weight: 0.15,
      score:
        CURRENT_MARKET_INDICATORS.creditGrowth > 12 &&
        CURRENT_MARKET_INDICATORS.creditGrowth < 16
          ? 75
          : 40,
      impact: "Healthy credit expansion indicates economic activity",
    },
    {
      name: "Unemployment",
      weight: 0.1,
      score:
        CURRENT_MARKET_INDICATORS.unemploymentRate < 3
          ? 80
          : CURRENT_MARKET_INDICATORS.unemploymentRate < 4
            ? 50
            : 20,
      impact: "Low unemployment supports consumer confidence",
    },
  ];

  const weightedScore = factors.reduce(
    (sum, factor) => sum + factor.score * factor.weight,
    0,
  );

  let overall: "positive" | "neutral" | "negative";
  if (weightedScore >= 60) {
    overall = "positive";
  } else if (weightedScore >= 40) {
    overall = "neutral";
  } else {
    overall = "negative";
  }

  return {
    overall,
    score: weightedScore,
    factors,
  };
};

export default {
  CURRENT_MARKET_INDICATORS,
  HISTORICAL_MARKET_INDICATORS,
  REGIONAL_DATA,
  ECONOMIC_OUTLOOK,
  getMarketTrends,
  getRegionalComparison,
  calculateRealReturns,
  calculatePurchasingPowerImpact,
  getMarketRiskAssessment,
  formatPercentage,
  formatLargeNumber,
  getMarketSentiment,
};
