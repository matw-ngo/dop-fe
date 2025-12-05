"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import FilterSidebar from "./FilterSidebar";
import { DEFAULT_FILTERS } from "@/constants/insurance";
import type { InsuranceFilters } from "@/types/insurance";

/**
 * Example usage of the FilterSidebar component
 * Demonstrates both desktop and mobile implementations
 */
export const FilterSidebarExample = () => {
  const [filters, setFilters] = useState<InsuranceFilters>(DEFAULT_FILTERS);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const handleFiltersChange = (newFilters: Partial<InsuranceFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
  };

  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  // Mock available options
  const availableOptions = {
    issuers: ["Bảo Việt", "Bảo Minh", "PVI", "MIC", "AAA"],
    vehicleTypes: ["car", "motorcycle", "scooter"],
    features: ["roadside-assistance", "worldwide-coverage", "medical-hotline"],
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Sản phẩm bảo hiểm</h1>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMobile(!isMobile)}
              >
                Toggle Mobile View
              </Button>
              {isMobile && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setIsMobileOpen(true)}
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <aside className="flex-shrink-0">
            <FilterSidebar
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
              availableOptions={availableOptions}
              isMobile={false}
            />
          </aside>
        )}

        {/* Mobile Sidebar Drawer */}
        {isMobile && (
          <FilterSidebar
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
            availableOptions={availableOptions}
            isMobile={true}
            isOpen={isMobileOpen}
            onClose={() => setIsMobileOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            {/* Active Filters Display */}
            <div className="mb-6 p-4 bg-muted/30 rounded-lg">
              <h2 className="text-lg font-semibold mb-3">Bộ lọc đang áp dụng:</h2>
              <pre className="text-sm bg-background p-3 rounded border overflow-x-auto">
                {JSON.stringify(filters, null, 2)}
              </pre>
            </div>

            {/* Content Placeholder */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-background border border-border rounded-lg p-6"
                >
                  <div className="h-4 bg-muted rounded w-3/4 mb-4" />
                  <div className="h-3 bg-muted rounded w-full mb-2" />
                  <div className="h-3 bg-muted rounded w-5/6 mb-2" />
                  <div className="h-3 bg-muted rounded w-4/6" />
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

// Import icons
import { SlidersHorizontal } from "lucide-react";

export default FilterSidebarExample;