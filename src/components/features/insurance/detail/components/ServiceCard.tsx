import { Check, X } from "lucide-react";
import React from "react";
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
          ? "bg-primary/5 border-primary/20"
          : "bg-muted/30 border-border"
      }`}
    >
      <div className="flex flex-col items-center text-center">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
            available ? "bg-primary/10" : "bg-muted"
          }`}
        >
          {available ? (
            <Check className="w-5 h-5 text-primary" />
          ) : (
            <X className="w-5 h-5 text-muted-foreground" />
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
