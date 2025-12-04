import React from "react";
import { Button } from "@/components/ui/button";
import { CreditCard as CreditCardIcon, Check } from "lucide-react";
import { getCreditCardById } from "@/data/mock-credit-cards";

interface CreditCardComparisonProps {
  cardIds: string[];
}

export const CreditCardComparison: React.FC<CreditCardComparisonProps> = ({
  cardIds,
}) => {
  const cardsToCompare = cardIds
    .map((id) => getCreditCardById(id))
    .filter(Boolean);

  if (cardsToCompare.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left p-4 border-b">Tiêu chí</th>
              {cardsToCompare.map((card, index) => (
                <th key={index} className="text-center p-4 border-b">
                  <div className="space-y-2">
                    <div className="w-12 h-8 bg-blue-100 rounded mx-auto flex items-center justify-center">
                      <CreditCardIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold">{card!.name}</p>
                      <p className="text-sm text-gray-600">{card!.bank}</p>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-4 border-b font-medium">Phí thường niên</td>
              {cardsToCompare.map((card, index) => (
                <td key={index} className="text-center p-4 border-b">
                  {card!.annualFee}
                </td>
              ))}
            </tr>
            <tr className="bg-gray-50">
              <td className="p-4 border-b font-medium">Lãi suất</td>
              {cardsToCompare.map((card, index) => (
                <td key={index} className="text-center p-4 border-b">
                  {card!.interestRate}
                </td>
              ))}
            </tr>
            {cardsToCompare.some((card) => card!.cashback) && (
              <tr>
                <td className="p-4 border-b font-medium">Hoàn tiền</td>
                {cardsToCompare.map((card, index) => (
                  <td key={index} className="text-center p-4 border-b">
                    {card!.cashback || "N/A"}
                  </td>
                ))}
              </tr>
            )}
            <tr className="bg-gray-50">
              <td className="p-4 border-b font-medium">Tính năng nổi bật</td>
              {cardsToCompare.map((card, index) => (
                <td key={index} className="text-center p-4 border-b">
                  <ul className="text-sm space-y-1">
                    {card!.features.map((feature: string, idx: number) => (
                      <li
                        key={idx}
                        className="flex items-center justify-start gap-1"
                      >
                        <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t bg-gray-50">
        <div className="flex justify-center gap-4">
          <Button className="bg-green-600 hover:bg-green-700">
            Đăng ký thẻ tốt nhất
          </Button>
          <Button variant="outline">Tìm hiểu thêm</Button>
        </div>
      </div>
    </div>
  );
};

export default CreditCardComparison;
