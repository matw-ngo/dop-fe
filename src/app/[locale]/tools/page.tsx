"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Calculator,
  TrendingUp,
  DollarSign,
  FileText,
  PiggyBank,
  CalculatorIcon,
  CheckCircle2,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { ToolsPageLayout } from "@/components/features/tools/ToolsPageLayout";
import { ToolsThemeProvider } from "@/components/features/tools/ToolsThemeProvider";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function ToolsPage() {
  const t = useTranslations("features.tools.list");
  const locale = useLocale();

  // State for filtering and searching
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedComplexity, setSelectedComplexity] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list" | "compact">("grid");

  const tools = [
    {
      id: "loan-calculator",
      title: t("loanCalculator.title"),
      description: t("loanCalculator.description"),
      icon: Calculator,
      category: "calculators",
      status: "available",
      complexity: "advanced",
      badge: "Popular",
      gradient: "from-blue-500 to-cyan-500",
      features: ["Monthly payments", "Interest rates", "Repayment schedule"],
      href: `/${locale}/tools/loan-calculator`,
    },
    {
      id: "savings-calculator",
      title: t("savingsCalculator.title"),
      description: t("savingsCalculator.description"),
      icon: TrendingUp,
      category: "calculators",
      status: "available",
      complexity: "basic",
      badge: "New",
      gradient: "from-emerald-500 to-teal-500",
      features: ["Compare rates", "Future value", "Growth projection"],
      href: `/${locale}/tools/savings-calculator`,
    },
    {
      id: "gross-to-net-calculator",
      title: t("grossToNetCalculator.title") || "Gross sang Net",
      description:
        t("grossToNetCalculator.description") ||
        "Tính lương thực nhận từ lương gộp",
      icon: DollarSign,
      category: "converters",
      status: "available",
      complexity: "advanced",
      badge: "Essential",
      gradient: "from-violet-500 to-purple-500",
      features: ["Gross to Net", "Tax calculation", "Insurance deduction"],
      href: `/${locale}/tools/gross-to-net-calculator`,
    },
    {
      id: "net-to-gross-calculator",
      title: t("netToGrossCalculator.title") || "Net sang Gross",
      description:
        t("netToGrossCalculator.description") ||
        "Tính lương cần đàm phán từ mong muốn",
      icon: DollarSign,
      category: "converters",
      status: "available",
      complexity: "advanced",
      badge: "Essential",
      gradient: "from-indigo-500 to-purple-500",
      features: ["Net to Gross", "Tax optimization", "Salary negotiation"],
      href: `/${locale}/tools/net-to-gross-calculator`,
    },
  ];

  const comingSoon = [
    {
      id: "roi-calculator",
      title: t("roiCalculator.title"),
      description: t("roiCalculator.description"),
      icon: PiggyBank,
      category: "analyzers",
      status: "coming-soon",
      complexity: "advanced",
      gradient: "from-orange-500 to-amber-500",
      features: ["ROI analysis", "Investment comparison", "Profit projection"],
    },
    {
      id: "tax-calculator",
      title: t("taxCalculator.title"),
      description: t("taxCalculator.description"),
      icon: FileText,
      category: "analyzers",
      status: "coming-soon",
      complexity: "basic",
      gradient: "from-rose-500 to-pink-500",
      features: ["VAT calculator", "Income tax", "Corporate tax"],
    },
  ];

  // Filter and search logic
  const filteredTools = useMemo(() => {
    let filtered = [...tools];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (tool) =>
          tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tool.description.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Category filter
    if (selectedCategory && selectedCategory !== "all") {
      filtered = filtered.filter((tool) => tool.category === selectedCategory);
    }

    // Status filter
    if (selectedStatus && selectedStatus !== "all") {
      if (selectedStatus === "available") {
        filtered = filtered.filter((tool) => tool.status === "available");
      } else if (selectedStatus === "coming-soon") {
        filtered = [];
      }
    }

    // Complexity filter
    if (selectedComplexity && selectedComplexity !== "all") {
      filtered = filtered.filter(
        (tool) => tool.complexity === selectedComplexity,
      );
    }

    return filtered;
  }, [searchQuery, selectedCategory, selectedStatus, selectedComplexity]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedStatus("all");
    setSelectedComplexity("all");
  };

  const activeFiltersCount = [
    selectedCategory,
    selectedStatus,
    selectedComplexity,
    searchQuery,
  ].filter((value) => value && value !== "all").length;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
    hover: {
      y: -8,
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  const renderToolCard = (
    tool: (typeof tools)[0],
    isComingSoon = false,
    index = 0,
  ) => {
    const IconComponent = tool.icon;
    const cardContent = (
      <motion.div
        initial="hidden"
        animate="visible"
        whileHover="hover"
        custom={index}
        className={cn(
          "group relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border transition-all duration-300 cursor-pointer overflow-hidden",
          isComingSoon
            ? "border-gray-200/60 opacity-75 hover:opacity-100"
            : "border-gray-200/60 hover:border-blue-200/60 hover:shadow-2xl hover:shadow-blue-500/10",
        )}
      >
        {/* Gradient Background on Hover */}
        {!isComingSoon && (
          <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-blue-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-blue-950/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        )}

        {/* Badge */}
        {tool.badge && !isComingSoon && (
          <div className="absolute top-4 right-4">
            <Badge
              className={cn(
                "bg-gradient-to-r text-white border-0",
                tool.gradient,
              )}
            >
              {tool.badge}
            </Badge>
          </div>
        )}

        <div className="relative">
          {/* Icon */}
          <div
            className={cn(
              "w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center mb-6",
              isComingSoon
                ? "opacity-50"
                : "group-hover:scale-110 transition-transform duration-300",
              tool.gradient,
            )}
          >
            <IconComponent className="w-7 h-7 text-white" />
          </div>

          {/* Category */}
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            {tool.category}
          </p>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
            {tool.title}
          </h3>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 leading-relaxed">
            {tool.description}
          </p>

          {/* Features */}
          <div className="space-y-2 mb-6">
            {tool.features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2">
                {isComingSoon ? (
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                )}
                <span
                  className={cn(
                    "text-sm",
                    isComingSoon
                      ? "text-gray-700 dark:text-gray-400"
                      : "text-gray-700 dark:text-gray-300",
                  )}
                >
                  {feature}
                </span>
              </div>
            ))}
          </div>

          {/* CTA or Coming Soon */}
          {isComingSoon ? (
            <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 font-semibold">
              <Clock className="w-4 h-4" />
              <span>{t("comingSoonBadge") || "Sắp ra mắt"}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-200">
              <span>{t("useTool") || "Sử dụng"}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          )}
        </div>
      </motion.div>
    );

    if (isComingSoon) {
      return (
        <motion.div
          key={tool.id}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          {cardContent}
        </motion.div>
      );
    }

    return (
      <motion.div
        key={tool.id}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
      >
        <Link href={tool.href} className="block">
          {cardContent}
        </Link>
      </motion.div>
    );
  };

  return (
    <ToolsThemeProvider>
      <ToolsPageLayout
        title={t("title")}
        description={t("subtitle")}
        showHero={true}
        showControls={true}
        showFilters={true}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        selectedStatus={selectedStatus}
        selectedComplexity={selectedComplexity}
        onCategoryChange={setSelectedCategory}
        onStatusChange={setSelectedStatus}
        onComplexityChange={setSelectedComplexity}
        activeFiltersCount={activeFiltersCount}
        onClearFilters={clearFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        toolsCount={filteredTools.length}
      >
        {/* Available Tools */}
        <div className="my-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {t("availableTools") || "Công cụ có sẵn"}
            </h2>
            {/* <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Sparkles className="w-4 h-4" />
              <span>{t("poweredByRealtimeData") || "Được cung cấp bởi dữ liệu thời gian thực"}</span>
            </div> */}
          </div>

          {filteredTools.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className={cn(
                "grid gap-6",
                viewMode === "grid" &&
                  "grid-cols-1 lg:grid-cols-2 xl:grid-cols-3",
                viewMode === "compact" &&
                  "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
                viewMode === "list" && "grid-cols-1",
              )}
            >
              <AnimatePresence>
                {filteredTools.map((tool, index) =>
                  renderToolCard(tool, false, index),
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="text-center py-12">
              <CalculatorIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                {t("noToolsFound") || "Không tìm thấy công cụ phù hợp"}
              </p>
            </div>
          )}
        </div>

        {/* Coming Soon */}
        {/* <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {t("comingSoon") || "Sắp ra mắt"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {comingSoon.map((tool) => renderToolCard(tool, true))}
          </div>
        </div> */}
      </ToolsPageLayout>
    </ToolsThemeProvider>
  );
}
