"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DEFAULT_PAGE_SIZE } from "@/constants/credit-cards";

interface CreditCardSkeletonProps {
  viewMode?: "grid" | "list" | "compact";
  count?: number;
  className?: string;
}

const CreditCardSkeleton: React.FC<CreditCardSkeletonProps> = ({
  viewMode = "grid",
  count = DEFAULT_PAGE_SIZE,
  className,
}) => {
  // Get grid columns based on view mode
  const getGridCols = () => {
    switch (viewMode) {
      case "list":
        return "grid-cols-1";
      case "compact":
        return "grid-cols-1";
      case "grid":
      default:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
    }
  };

  // Compact skeleton for comparison table
  if (viewMode === "compact") {
    return (
      <div className={cn("space-y-2", className)}>
        {Array.from({ length: Math.min(count, 3) }, (_, i) => (
          <div
            key={i}
            className="flex items-center space-x-3 p-3 border rounded-lg animate-pulse"
          >
            <div className="h-10 w-16 bg-gray-200 rounded"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="h-6 w-16 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  // List view skeleton
  if (viewMode === "list") {
    return (
      <div className={cn("space-y-4", className)}>
        {Array.from({ length: count }, (_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="w-32 h-20 bg-gray-200 rounded-lg flex-shrink-0"></div>
                <div className="flex-1 min-w-0 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: 5 }, (_, j) => (
                          <div
                            key={j}
                            className="h-4 w-4 bg-gray-200 rounded"
                          ></div>
                        ))}
                        <div className="h-3 bg-gray-200 rounded w-12 ml-2"></div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <div className="h-6 w-20 bg-gray-200 rounded"></div>
                      <div className="h-5 w-16 bg-gray-200 rounded"></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }, (_, j) => (
                      <div key={j} className="space-y-1">
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>

                  <div className="h-12 bg-gray-100 rounded-lg"></div>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      {Array.from({ length: 3 }, (_, j) => (
                        <div
                          key={j}
                          className="h-5 w-20 bg-gray-200 rounded-full"
                        ></div>
                      ))}
                    </div>
                    <div className="h-8 w-24 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Grid view skeleton (default)
  return (
    <div className={cn("space-y-4", className)}>
      <div className={cn("grid gap-6", getGridCols())}>
        {Array.from({ length: count }, (_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-5 w-16 bg-gray-200 rounded"></div>
                  <div className="h-5 w-12 bg-gray-200 rounded"></div>
                </div>
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="relative h-32 mx-auto">
                <div className="w-full h-full bg-gray-200 rounded-lg"></div>
              </div>

              <div className="space-y-2">
                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: 5 }, (_, j) => (
                    <div key={j} className="h-4 w-4 bg-gray-200 rounded"></div>
                  ))}
                  <div className="h-3 bg-gray-200 rounded w-8 ml-1"></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-8"></div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-12"></div>
                </div>
              </div>

              <div className="h-12 bg-gray-100 rounded-lg p-2">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>

              <div className="h-px bg-gray-200"></div>

              <div className="space-y-2">
                {Array.from({ length: 2 }, (_, j) => (
                  <div key={j} className="flex items-center justify-between">
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                ))}
              </div>

              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
            </CardContent>

            <CardFooter className="pt-0">
              <div className="h-10 w-full bg-gray-200 rounded"></div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CreditCardSkeleton;
