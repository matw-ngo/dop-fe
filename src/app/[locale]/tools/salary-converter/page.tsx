"use client";

import SalaryConverter from "@/components/financial-tools/SalaryConverter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, DollarSign } from "lucide-react";
import Link from "next/link";

export default function SalaryConverterPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link href="/vi">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại trang chủ
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-purple-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Chuyển đổi lương Gross - Net
                </h1>
                <p className="text-gray-600 mt-1">
                  Tính toán lương thực nhận sau khi trừ các khoản thuế và bảo
                  hiểm
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <SalaryConverter />
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white border-t">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
              Tính năng nổi bật
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">
                  Tuân thủ luật thuế Việt Nam
                </h3>
                <p className="text-gray-600">
                  Tính toán theo quy định thuế TNCN hiện hành
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Bảo hiểm xã hội</h3>
                <p className="text-gray-600">
                  Tính toán đúng các khoản BHXH, BHYT, BHTN
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">
                  Giảm trừ gia cảnh
                </h3>
                <p className="text-gray-600">
                  Tính toán giảm trừ cho bản thân và người phụ thuộc
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
