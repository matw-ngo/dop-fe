"use client";

import LoanCalculator from "@/components/financial-tools/LoanCalculator";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calculator } from "lucide-react";
import Link from "next/link";

export default function LoanCalculatorPage() {
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
              <Calculator className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Công cụ tính toán vay vốn
                </h1>
                <p className="text-gray-600 mt-1">
                  Tính toán khoản vay, lãi suất và trả góp
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <LoanCalculator />
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
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calculator className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">
                  Tính toán chính xác
                </h3>
                <p className="text-gray-600">
                  Phương pháp tính lãi suất Việt Nam chính xác
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calculator className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">
                  So sánh nhiều gói vay
                </h3>
                <p className="text-gray-600">
                  So sánh chi tiết các gói vay từ nhiều ngân hàng
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calculator className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">
                  Lịch trả góp chi tiết
                </h3>
                <p className="text-gray-600">
                  Lịch trả góp hàng tháng với chi tiết rõ ràng
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
