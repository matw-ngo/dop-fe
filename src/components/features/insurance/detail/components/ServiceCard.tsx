import React from "react";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import type { ServiceCardProps } from "../types";
import { getServiceInfo } from "../utils";

export const ServiceCard = React.memo(function ServiceCard({
  service,
  available,
}: ServiceCardProps) {
  const serviceInfo = getServiceInfo(service);

  return (
    <div
      className={`p-4 rounded-lg border ${
        available
          ? "bg-green-50 border-green-200"
          : "bg-gray-50 border-gray-200"
      }`}
    >
      <div className="flex flex-col items-center text-center">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
            available ? "bg-green-200" : "bg-gray-200"
          }`}
        >
          {available ? (
            <Check className="w-5 h-5 text-green-600" />
          ) : (
            <X className="w-5 h-5 text-gray-400" />
          )}
        </div>
        <p className="text-sm font-medium mb-1">{serviceInfo.name}</p>
        <p className="text-xs text-muted-foreground">
          {serviceInfo.description}
        </p>
      </div>
    </div>
  );
});