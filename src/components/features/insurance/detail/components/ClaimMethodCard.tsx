import React from "react";
import { getClaimMethodIcon, getClaimMethodName, getClaimMethodDescription } from "../utils";

interface ClaimMethodCardProps {
  method: string;
}

export const ClaimMethodCard = React.memo(function ClaimMethodCard({
  method,
}: ClaimMethodCardProps) {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      <div className="text-3xl mb-2 text-center">
        {getClaimMethodIcon(method)}
      </div>
      <p className="text-sm font-medium text-center">
        {getClaimMethodName(method)}
      </p>
      <p className="text-xs text-muted-foreground text-center mt-1">
        {getClaimMethodDescription(method)}
      </p>
    </div>
  );
});