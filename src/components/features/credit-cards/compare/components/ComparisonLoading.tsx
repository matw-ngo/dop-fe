import type React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const ComparisonLoading: React.FC = () => {
  return (
    <div className="space-y-4 p-4">
      <div className="grid grid-cols-4 gap-4">
        <Skeleton className="h-4 w-24" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="grid grid-cols-4 gap-4">
          <Skeleton className="h-4 w-32" />
          {Array.from({ length: 3 }).map((_, j) => (
            <Skeleton key={j} className="h-4 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
};

export default ComparisonLoading;
