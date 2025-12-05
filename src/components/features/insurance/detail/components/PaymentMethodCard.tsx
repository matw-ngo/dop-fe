import React from "react";
import type { PaymentMethodCardProps } from "../types";
import { getPaymentMethodInfo } from "../utils";

export const PaymentMethodCard = React.memo(function PaymentMethodCard({
  method,
}: PaymentMethodCardProps) {
  const methodInfo = getPaymentMethodInfo(method);

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex flex-col items-center text-center">
        <div className="text-3xl mb-2">{methodInfo.icon}</div>
        <p className="font-medium text-sm">{methodInfo.name}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {methodInfo.description}
        </p>
      </div>
    </div>
  );
});