"use client";

import { ReactNode, useState } from "react";
import { useTranslations } from "next-intl";
import { useTheme } from "@/components/renderer/theme/context";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Calculator, TrendingUp, Filter } from "lucide-react";
import ToolsFilterPanel from "./ToolsFilterPanel";
import ToolsPageControls from "./ToolsPageControls";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

interface ToolsPageLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  showHero?: boolean;
  showFilters?: boolean;
  showControls?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  selectedCategory?: string;
  selectedStatus?: string;
  selectedComplexity?: string;
  onCategoryChange?: (category: string) => void;
  onStatusChange?: (status: string) => void;
  onComplexityChange?: (complexity: string) => void;
  activeFiltersCount?: number;
  onClearFilters?: () => void;
  viewMode?: "grid" | "list" | "compact";
  onViewModeChange?: (mode: "grid" | "list" | "compact") => void;
  toolsCount?: number;
}

export function ToolsPageLayout({
  children,
  title,
  description,
  showHero = false,
  showFilters = true,
  showControls = true,
  searchQuery = "",
  onSearchChange = () => {},
  selectedCategory = "all",
  selectedStatus = "all",
  selectedComplexity = "all",
  onCategoryChange = () => {},
  onStatusChange = () => {},
  onComplexityChange = () => {},
  activeFiltersCount = 0,
  onClearFilters = () => {},
  viewMode = "grid",
  onViewModeChange = () => {},
  toolsCount = 0,
}: ToolsPageLayoutProps) {
  const t = useTranslations("features.tools.list");
  const { themeConfig } = useTheme();
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  const isFinanceTheme = themeConfig?.id === "finance";

  const handleFilterChange = (
    type: "category" | "status" | "complexity",
    value: string,
  ) => {
    switch (type) {
      case "category":
        onCategoryChange(value);
        break;
      case "status":
        onStatusChange(value);
        break;
      case "complexity":
        onComplexityChange(value);
        break;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      {/* Hero Section - Only show on main tools page */}
      {showHero && (
        <div
          className={`relative overflow-hidden bg-gradient-to-br ${
            isFinanceTheme
              ? "from-blue-50/50 via-emerald-50/30 to-sky-50/50 dark:from-blue-950/50 dark:via-emerald-950/30 dark:to-sky-950/50"
              : "from-background to-muted/20"
          }`}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-200/20 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-200/10 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 py-16 relative">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex justify-center mb-6">
                <div
                  className={`p-4 rounded-2xl ${
                    isFinanceTheme
                      ? "bg-gradient-to-br from-blue-500 to-emerald-600 text-white"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  <Calculator className="w-12 h-12" />
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                {title || t("hero.title")}
              </h1>

              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                {description || t("hero.description")}
              </p>

              {/* Stats */}
              {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                <div className="bg-card/80 backdrop-blur-sm rounded-xl p-6 border">
                  <div className="flex items-center justify-center mb-2">
                    <Calculator className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-3xl font-bold text-foreground">{t("stats.toolsCount")}</div>
                  <div className="text-sm text-muted-foreground">{t("stats.toolsLabel")}</div>
                </div>

                <div className="bg-card/80 backdrop-blur-sm rounded-xl p-6 border">
                  <div className="flex items-center justify-center mb-2">
                    <TrendingUp className="w-8 h-8 text-emerald-600" />
                  </div>
                  <div className="text-3xl font-bold text-foreground">98%</div>
                  <div className="text-sm text-muted-foreground">{t("stats.accuracyLabel")}</div>
                </div>

                <div className="bg-card/80 backdrop-blur-sm rounded-xl p-6 border">
                  <div className="flex items-center justify-center mb-2">
                    <Badge variant="outline" className="text-lg px-3 py-1">
                      24/7
                    </Badge>
                  </div>
                  <div className="text-3xl font-bold text-foreground">{t("stats.availabilityLabel")}</div>
                  <div className="text-sm text-muted-foreground">{t("stats.availabilityText")}</div>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      )}

      {/* Controls Bar */}
      {showControls && (
        <ToolsPageControls
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          selectedCategory={selectedCategory}
          selectedStatus={selectedStatus}
          selectedComplexity={selectedComplexity}
          onCategoryChange={(value) => handleFilterChange("category", value)}
          onStatusChange={(value) => handleFilterChange("status", value)}
          onComplexityChange={(value) =>
            handleFilterChange("complexity", value)
          }
          activeFiltersCount={activeFiltersCount}
          onClearFilters={onClearFilters}
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
          toolsCount={toolsCount}
        />
      )}

      {/* Main Content */}
      <div className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="flex gap-8">
            {/* Sidebar - Desktop */}
            {showFilters && (
              <aside className="hidden lg:block w-80 flex-shrink-0">
                <div
                  className={`sticky top-24 rounded-lg border p-4 ${
                    isFinanceTheme
                      ? "bg-primary/5 border-primary/20"
                      : "bg-card"
                  }`}
                >
                  <ToolsFilterPanel
                    selectedCategory={selectedCategory}
                    selectedStatus={selectedStatus}
                    selectedComplexity={selectedComplexity}
                    onCategoryChange={(value) =>
                      handleFilterChange("category", value)
                    }
                    onStatusChange={(value) =>
                      handleFilterChange("status", value)
                    }
                    onComplexityChange={(value) =>
                      handleFilterChange("complexity", value)
                    }
                    onClearAll={onClearFilters}
                  />
                </div>
              </aside>
            )}

            {/* Main Content Area */}
            <div className="flex-1 min-w-0">
              {/* Mobile Filter Trigger */}
              {showFilters && (
                <div className="lg:hidden mb-4">
                  <Sheet
                    open={isFilterSheetOpen}
                    onOpenChange={setIsFilterSheetOpen}
                  >
                    <SheetTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <Filter className="w-4 h-4 mr-2" />
                        {t("filters.title")}
                        {activeFiltersCount > 0 && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {activeFiltersCount}
                          </Badge>
                        )}
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-80">
                      <div className="mt-8">
                        <ToolsFilterPanel
                          selectedCategory={selectedCategory}
                          selectedStatus={selectedStatus}
                          selectedComplexity={selectedComplexity}
                          onCategoryChange={(value) =>
                            handleFilterChange("category", value)
                          }
                          onStatusChange={(value) =>
                            handleFilterChange("status", value)
                          }
                          onComplexityChange={(value) =>
                            handleFilterChange("complexity", value)
                          }
                          onClearAll={() => {
                            onClearFilters();
                            setIsFilterSheetOpen(false);
                          }}
                        />
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              )}

              {/* Page Content */}
              {children}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
