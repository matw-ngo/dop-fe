"use client";

import { useParams } from "next/navigation";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function InsuranceCategoryPage() {
  const params = useParams();
  const category = params.category as string;

  const categoryNames: Record<string, string> = {
    health: "Bảo hiểm sức khỏe",
    life: "Bảo hiểm nhân thọ",
    car: "Bảo hiểm xe",
    home: "Bảo hiểm nhà",
    travel: "Bảo hiểm du lịch",
  };

  const categoryName = categoryNames[category] || "Bảo hiểm";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link href="/vi/insurance">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {categoryName}
              </h1>
              <p className="text-gray-600">
                Các gói bảo hiểm {categoryName.toLowerCase()} hàng đầu
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Danh mục {categoryName}
          </h2>
          <p className="text-gray-600 mb-8">
            Chức năng đang được phát triển. Vui lòng quay lại trang chính để xem
            tất cả gói bảo hiểm.
          </p>
          <Link href="/vi/insurance">
            <Button>Xem tất cả bảo hiểm</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
