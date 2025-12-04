"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Filter, CreditCard } from "lucide-react";
import Link from "next/link";
import { CreditCardCatalog } from "@/components/features/credit-card/CreditCardCatalog";
import { mockCreditCards } from "@/data/mock-credit-cards";

export default function CreditCardsPage() {
  const [view, setView] = useState<"catalog" | "comparison">("catalog");
  const [selectedCards, setSelectedCards] = useState<string[]>([]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/vi"
                className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Quay lại trang chủ
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Thẻ tín dụng</h1>
              <p className="text-gray-600 mt-2">
                So sánh và tìm kiếm thẻ tín dụng phù hợp với bạn
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant={view === "comparison" ? "default" : "outline"}
                onClick={() => setView("comparison")}
                disabled={selectedCards.length === 0}
              >
                <Filter className="w-4 h-4 mr-2" />
                So sánh ({selectedCards.length})
              </Button>

              <Button
                variant={view === "catalog" ? "default" : "outline"}
                onClick={() => setView("catalog")}
              >
                Danh mục thẻ
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {view === "catalog" ? (
          <CreditCardCatalog
            onCardSelect={(cardId) => {
              setSelectedCards(
                (prev) =>
                  prev.includes(cardId)
                    ? prev.filter((id) => id !== cardId)
                    : [...prev, cardId].slice(0, 3), // Max 3 cards for comparison
              );
            }}
            selectedCards={selectedCards}
          />
        ) : (
          <div>
            <div className="mb-6">
              <Button
                variant="outline"
                onClick={() => setView("catalog")}
                className="mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại danh mục
              </Button>
              <h2 className="text-2xl font-bold text-gray-900">
                So sánh thẻ tín dụng
              </h2>
              <p className="text-gray-600">So sánh chi tiết các thẻ đã chọn</p>
            </div>
            {selectedCards.length > 0 ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Thẻ đã chọn ({selectedCards.length})
                </h3>
                <div className="space-y-3">
                  {selectedCards.map((cardId) => {
                    const card = mockCreditCards.find((c) => c.id === cardId);
                    return card ? (
                      <div
                        key={cardId}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded"
                      >
                        <div className="flex items-center gap-3">
                          <CreditCard className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="font-medium">{card.name}</p>
                            <p className="text-sm text-gray-600">{card.bank}</p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setSelectedCards((prev) =>
                              prev.filter((id) => id !== cardId),
                            )
                          }
                        >
                          Bỏ chọn
                        </Button>
                      </div>
                    ) : null;
                  })}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <Button className="w-full">So sánh chi tiết</Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-gray-600 mb-4">
                  Vui lòng chọn ít nhất 2 thẻ để so sánh
                </p>
                <Button onClick={() => setView("catalog")}>
                  Chọn thẻ để so sánh
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      {view === "catalog" && selectedCards.length > 0 && (
        <div className="fixed bottom-8 right-8">
          <Button
            size="lg"
            onClick={() => setView("comparison")}
            className="shadow-lg"
          >
            So sánh {selectedCards.length} thẻ
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
