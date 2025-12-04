import React from "react";
import InsuranceSkeleton from "./InsuranceSkeleton";

// Example usage of InsuranceSkeleton component
export function InsuranceSkeletonExample() {
  return (
    <div className="space-y-8 p-4">
      <div>
        <h2 className="text-2xl font-bold mb-4">Grid View Skeleton</h2>
        <InsuranceSkeleton viewMode="grid" count={4} />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">List View Skeleton</h2>
        <InsuranceSkeleton viewMode="list" count={3} />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Compact View Skeleton</h2>
        <InsuranceSkeleton viewMode="compact" count={5} />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Custom Styling</h2>
        <InsuranceSkeleton
          viewMode="grid"
          count={2}
          className="max-w-2xl mx-auto"
          showCompareButton={false}
        />
      </div>
    </div>
  );
}

export default InsuranceSkeletonExample;
