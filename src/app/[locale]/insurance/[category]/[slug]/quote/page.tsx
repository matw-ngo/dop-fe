"use client";

import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { InsuranceQuotation } from "@/components/features/insurance/InsuranceQuotation";

export default function InsuranceQuotePage() {
  const params = useParams();
  const category = params.category as string;
  const slug = params.slug as string;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link href={`/vi/insurance/${category}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Báo giá bảo hiểm
              </h1>
              <p className="text-gray-600">
                Nhận báo giá chi tiết cho gói bảo hiểm đã chọn
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <InsuranceQuotation
          productSlug={slug}
          category={category}
          onQuoteGenerated={(quote) => {
            console.log("Quote generated:", quote);
            // Handle generated quote
          }}
          onPurchase={(quote) => {
            console.log("Purchase initiated:", quote);
            // Handle purchase flow
          }}
        />
      </div>
    </div>
  );
}
