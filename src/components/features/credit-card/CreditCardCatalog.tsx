import React from "react";
import { Button } from "@/components/ui/button";
import { CreditCard as CreditCardIcon } from "lucide-react";
import { CreditCard } from "@/data/mock-credit-cards";

interface CreditCardCatalogProps {
  onCardSelect: (cardId: string) => void;
  selectedCards: string[];
}

export const CreditCardCatalog: React.FC<CreditCardCatalogProps> = ({
  onCardSelect,
  selectedCards,
}) => {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Danh mục thẻ tín dụng
        </h2>
        <p className="text-gray-600">
          So sánh và chọn thẻ tín dụng phù hợp nhất với nhu cầu của bạn
        </p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockCreditCards.map((card) => (
          <div
            key={card.id}
            className={`bg-white rounded-lg shadow-md p-6 border-2 cursor-pointer transition-all hover:shadow-lg ${
              selectedCards.includes(card.id)
                ? "border-blue-500"
                : "border-gray-200"
            }`}
            onClick={() => onCardSelect(card.id)}
          >
            <div className="flex items-center gap-3 mb-4">
              <CreditCardIcon className="w-12 h-12 text-blue-600" />
              <div>
                <h3 className="font-semibold text-lg">{card.name}</h3>
                <p className="text-sm text-gray-600">{card.bank}</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm">
                <strong>Phí thường niên:</strong> {card.annualFee}
              </p>
              <p className="text-sm">
                <strong>Lãi suất:</strong> {card.interestRate}
              </p>
              {card.cashback && (
                <p className="text-sm">
                  <strong>Hoàn tiền:</strong> {card.cashback}
                </p>
              )}
            </div>
            <div className="mt-4">
              <Button
                variant={
                  selectedCards.includes(card.id) ? "default" : "outline"
                }
                className="w-full"
                size="sm"
              >
                {selectedCards.includes(card.id)
                  ? "Đã chọn"
                  : "Chọn để so sánh"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CreditCardCatalog;
