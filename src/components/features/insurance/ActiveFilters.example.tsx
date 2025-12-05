/**
 * Example usage of the InsuranceActiveFilters component
 */

import React, { useState } from "react";
import { NextIntlClientProvider } from "next-intl";
import InsuranceActiveFilters from "./ActiveFilters";
import { InsuranceFilters, InsuranceCategory, InsuranceType } from "@/types/insurance";
import { DEFAULT_FILTERS } from "@/constants/insurance";

// Example messages for next-intl
const messages = {
  pages: {
    insurance: {
      category: "Loại bảo hiểm",
      type: "Loại hình",
      filters: "Bộ lọc",
      clearAll: "Xóa tất cả",
    },
  },
};

// Example filter data
const exampleFilters: InsuranceFilters = {
  categories: [InsuranceCategory.VEHICLE, InsuranceCategory.HEALTH],
  types: [InsuranceType.COMPULSORY],
  issuers: ["Bảo Việt", "Bảo Minh", "PVI"],
  coverageRange: {
    personalAccident: { min: 100000000, max: 300000000 },
    propertyDamage: { min: 0, max: 2000000000 },
    medicalExpenses: { min: 0, max: 1000000000 },
  },
  specificCoverages: ["car", "motorcycle"],
  premiumRange: { min: 1000000, max: 3000000 },
  feeTypes: [],
  coveragePeriods: [],
  ageRange: { min: 25, max: 60 },
  includePreExistingConditions: false,
  hasRoadsideAssistance: true,
  hasWorldwideCoverage: true,
  hasMedicalHotline: true,
  hasLegalSupport: false,
  minApprovalRate: 90,
  maxProcessingTime: 7,
  provinces: ["Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Cần Thơ"],
  nationalAvailability: false,
  isNew: true,
  isRecommended: true,
  isExclusive: false,
  hasAutoRenewal: true,
  hasInstallments: false,
  minRating: 4,
};

const InsuranceActiveFiltersExample: React.FC = () => {
  const [filters, setFilters] = useState<InsuranceFilters>(exampleFilters);

  const handleFiltersChange = (newFilters: Partial<InsuranceFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleClearAll = () => {
    setFilters(DEFAULT_FILTERS);
  };

  // Example with limited display
  const [limitedFilters, setLimitedFilters] = useState<InsuranceFilters>(
    exampleFilters
  );

  const handleLimitedFiltersChange = (newFilters: Partial<InsuranceFilters>) => {
    setLimitedFilters((prev) => ({ ...prev, ...newFilters }));
  };

  // Example with few filters
  const [fewFilters, setFewFilters] = useState<InsuranceFilters>({
    ...DEFAULT_FILTERS,
    categories: [InsuranceCategory.VEHICLE],
    issuers: ["Bảo Việt"],
    isNew: true,
    hasRoadsideAssistance: true,
  });

  const handleFewFiltersChange = (newFilters: Partial<InsuranceFilters>) => {
    setFewFilters((prev) => ({ ...prev, ...newFilters }));
  };

  return (
    <NextIntlClientProvider locale="vi" messages={messages}>
      <div className="p-8 space-y-8 max-w-4xl mx-auto">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Insurance Active Filters Examples</h1>
          <p className="text-muted-foreground">
            Different configurations of the ActiveFilters component
          </p>
        </div>

        {/* Example 1: Full filters display */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">All Active Filters (Unlimited)</h2>
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-4">
              Showing all active filters without limit
            </p>
            <InsuranceActiveFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearAll={handleClearAll}
            />
          </div>
        </div>

        {/* Example 2: Limited display */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Limited Display (Max 5 filters)</h2>
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-4">
              Showing only 5 filters with overflow indicator
            </p>
            <InsuranceActiveFilters
              filters={limitedFilters}
              onFiltersChange={handleLimitedFiltersChange}
              onClearAll={handleClearAll}
              maxDisplay={5}
              className="border-2 border-dashed border-primary/20"
            />
          </div>
        </div>

        {/* Example 3: Few filters */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Few Filters</h2>
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-4">
              Example with only a few active filters
            </p>
            <InsuranceActiveFilters
              filters={fewFilters}
              onFiltersChange={handleFewFiltersChange}
              onClearAll={handleClearAll}
              maxDisplay={10}
            />
          </div>
        </div>

        {/* Example 4: No filters */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">No Active Filters</h2>
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-4">
              Component renders nothing when no filters are active
            </p>
            <InsuranceActiveFilters
              filters={DEFAULT_FILTERS}
              onFiltersChange={handleFiltersChange}
              onClearAll={handleClearAll}
            />
          </div>
        </div>

        {/* Interactive Demo */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Interactive Demo</h2>
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-4">
              Click on filter pills to remove them or use the clear all button
            </p>
            <div className="space-y-4">
              <InsuranceActiveFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onClearAll={handleClearAll}
                maxDisplay={8}
              />

              {/* Current filter state for debugging */}
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium">
                  Current Filter State (Debug)
                </summary>
                <pre className="mt-2 text-xs bg-background p-3 rounded overflow-auto">
                  {JSON.stringify(filters, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        </div>

        {/* Add Filters Buttons */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Quick Add Filters</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  categories: [...prev.categories, InsuranceCategory.LIFE],
                }))
              }
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md text-sm hover:bg-blue-200"
            >
              Add Life Insurance
            </button>
            <button
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  types: [...prev.types, InsuranceType.VOLUNTARY],
                }))
              }
              className="px-3 py-1 bg-green-100 text-green-800 rounded-md text-sm hover:bg-green-200"
            >
              Add Voluntary Type
            </button>
            <button
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  issuers: [...prev.issuers, "AAA Insurance"],
                }))
              }
              className="px-3 py-1 bg-purple-100 text-purple-800 rounded-md text-sm hover:bg-purple-200"
            >
              Add New Issuer
            </button>
            <button
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  provinces: [...prev.provinces, "Nha Trang"],
                }))
              }
              className="px-3 py-1 bg-orange-100 text-orange-800 rounded-md text-sm hover:bg-orange-200"
            >
              Add Nha Trang
            </button>
            <button
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  hasLegalSupport: !prev.hasLegalSupport,
                }))
              }
              className="px-3 py-1 bg-pink-100 text-pink-800 rounded-md text-sm hover:bg-pink-200"
            >
              Toggle Legal Support
            </button>
          </div>
        </div>
      </div>
    </NextIntlClientProvider>
  );
};

export default InsuranceActiveFiltersExample;