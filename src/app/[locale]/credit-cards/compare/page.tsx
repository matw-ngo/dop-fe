"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { CreditCardComparison } from "@/components/features/credit-card/CreditCardComparison";

interface ComparePageProps {
  searchParams: { cards?: string };
}

export default function ComparePage({ searchParams }: ComparePageProps) {
  const cardIds = searchParams.cards?.split(",") || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link href="/vi/credit-cards">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                So sánh thẻ tín dụng
              </h1>
              <p className="text-gray-600">
                So sánh chi tiết các thẻ tín dụng đã chọn
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {cardIds.length > 0 ? (
          <CreditCardComparison cardIds={cardIds} />
        ) : (
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Chưa có thẻ nào để so sánh
            </h2>
            <p className="text-gray-600 mb-8">
              Vui lòng chọn ít nhất 2 thẻ để so sánh
            </p>
            <Link href="/vi/credit-cards">
              <Button>Chọn thẻ để so sánh</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
