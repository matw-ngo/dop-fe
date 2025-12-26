/**
 * Demo Loader Component
 *
 * A component for loading predefined demo scenarios into the loan application form.
 * Useful for customer demonstrations, testing, and validation.
 *
 * Features:
 * - List of all available demo scenarios
 * - Filtering by category and outcome
 * - Quick loading of demo data into the form
 * - Expandable/collapsible for demo mode
 *
 * Usage:
 * ```tsx
 * <DemoLoader onLoadDemo={handleLoadDemo} />
 * ```
 */

"use client";

import {
  type LoanFormDemoCase,
  DemoHelpers,
} from "@/configs/forms/loan-form-demo-cases";
import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

interface DemoLoaderProps {
  /** Callback when a demo is selected */
  onLoadDemo: (demoId: string, formData: Record<string, unknown>) => void;
  /** Whether to show the loader by default */
  defaultOpen?: boolean;
}

/**
 * Demo Outcome Badge Component
 */
function OutcomeBadge({ outcome }: { outcome: string }) {
  const styles = {
    approve: "bg-green-100 text-green-800 border-green-200",
    review: "bg-yellow-100 text-yellow-800 border-yellow-200",
    reject: "bg-red-100 text-red-800 border-red-200",
  };

  const labels = {
    approve: "Duyệt dễ",
    review: "Cần xem xét",
    reject: "Khó duyệt",
  };

  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded border ${styles[outcome as keyof typeof styles]}`}
    >
      {labels[outcome as keyof typeof labels]}
    </span>
  );
}

/**
 * Category Badge Component
 */
function CategoryBadge({ category }: { category: string }) {
  const styles = {
    employment: "bg-blue-100 text-blue-800",
    credit: "bg-purple-100 text-purple-800",
    income: "bg-orange-100 text-orange-800",
    "edge-cases": "bg-pink-100 text-pink-800",
  };

  const labels = {
    employment: "Việc làm",
    credit: "Tín dụng",
    income: "Thu nhập",
    "edge-cases": "Ca đặc biệt",
  };

  return (
    <span
      className={`px-2 py-1 text-xs rounded ${styles[category as keyof typeof styles]}`}
    >
      {labels[category as keyof typeof labels]}
    </span>
  );
}

/**
 * Demo Loader Component
 */
export function DemoLoader({
  onLoadDemo,
  defaultOpen = false,
}: DemoLoaderProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [selectedDemoId, setSelectedDemoId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "category" | "outcome">("all");
  const [filterValue, setFilterValue] = useState<string>("all");

  const demos = DemoHelpers.getAllDemos();

  let filteredDemos = demos;
  if (filter !== "all" && filterValue !== "all") {
    if (filter === "category") {
      filteredDemos = DemoHelpers.getDemosByCategory(
        filterValue as "employment" | "credit" | "income" | "edge-cases",
      );
    } else if (filter === "outcome") {
      filteredDemos = DemoHelpers.getDemosByOutcome(
        filterValue as "approve" | "review" | "reject",
      );
    }
  }

  const handleSelectDemo = (demo: LoanFormDemoCase) => {
    setSelectedDemoId(demo.id);
    onLoadDemo(demo.id, demo.formData as Record<string, unknown>);
  };

  const categories = Array.from(new Set(demos.map((d) => d.category)));
  const outcomes = Array.from(new Set(demos.map((d) => d.expectedOutcome)));

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg hover:shadow-md transition-all"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">🎭</span>
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-purple-900">Demo Scenarios</h3>
            <p className="text-sm text-purple-700">
              Tải dữ liệu mẫu để trình diễn
            </p>
          </div>
        </div>
        {isOpen ? (
          <ChevronDown className="w-5 h-5 text-purple-600" />
        ) : (
          <ChevronRight className="w-5 h-5 text-purple-600" />
        )}
      </button>

      {/* Demo List */}
      {isOpen && (
        <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          {/* Filters */}
          <div className="mb-4 flex flex-wrap gap-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">Tất cả</option>
              <option value="category">Theo loại</option>
              <option value="outcome">Theo kết quả dự kiến</option>
            </select>

            {filter === "category" && (
              <select
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">Tất cả</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            )}

            {filter === "outcome" && (
              <select
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">Tất cả</option>
                {outcomes.map((out) => (
                  <option key={out} value={out}>
                    {out === "approve" && "Duyệt dễ"}
                    {out === "review" && "Cần xem xét"}
                    {out === "reject" && "Khó duyệt"}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Demo Cards */}
          <div className="grid gap-3">
            {filteredDemos.map((demo) => (
              <button
                key={demo.id}
                type="button"
                onClick={() => handleSelectDemo(demo)}
                className={`
                  p-4 rounded-lg border-2 text-left transition-all hover:shadow-md
                  ${
                    selectedDemoId === demo.id
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:border-purple-300"
                  }
                `}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">
                        {demo.name}
                      </h4>
                      {selectedDemoId === demo.id && (
                        <CheckCircle className="w-4 h-4 text-purple-600" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{demo.description}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <CategoryBadge category={demo.category} />
                    <OutcomeBadge outcome={demo.expectedOutcome} />
                  </div>
                </div>

                {demo.notes && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{demo.notes}</span>
                  </div>
                )}

                {/* Tags */}
                {demo.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {demo.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Form Data Preview */}
                <details className="mt-3">
                  <summary className="text-xs text-purple-600 cursor-pointer hover:text-purple-800">
                    Xem dữ liệu chi tiết
                  </summary>
                  <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-auto">
                    {JSON.stringify(demo.formData, null, 2)}
                  </pre>
                </details>
              </button>
            ))}
          </div>

          {filteredDemos.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Không có demo nào phù hợp với bộ lọc
            </div>
          )}
        </div>
      )}
    </div>
  );
}
