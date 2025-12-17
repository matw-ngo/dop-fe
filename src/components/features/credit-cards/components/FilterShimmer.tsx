import type React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const FilterShimmer: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* Filter Sections Shimmer */}
      {Array.from({ length: 5 }).map((_, sectionIndex) => (
        <Card key={sectionIndex}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="w-5 h-5 rounded" />
                <Skeleton className="h-5 w-24" />
              </div>
              <Skeleton className="h-4 w-16 rounded-full" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Checkbox options shimmer */}
            {Array.from({ length: Math.floor(Math.random() * 4) + 3 }).map(
              (_, optionIndex) => (
                <div key={optionIndex} className="flex items-center space-x-2">
                  <Skeleton className="w-4 h-4 rounded" />
                  <Skeleton className="h-4 flex-1" />
                </div>
              ),
            )}

            {/* Range slider shimmer (for some sections) */}
            {sectionIndex % 2 === 0 && (
              <div className="pt-3">
                <Skeleton className="h-2 w-full rounded-full mb-2" />
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FilterShimmer;
