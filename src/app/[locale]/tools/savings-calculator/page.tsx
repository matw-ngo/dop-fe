"use client";

import SavingsCalculator from "@/components/financial-tools/SavingsCalculator";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function SavingsCalculatorPage() {
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
              <TrendingUp className="w-8 h-8 text-green-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Công cụ tiết kiệm
                </h1>
                <p className="text-gray-600 mt-1">
                  Tính toán lãi suất tiết kiệm và so sánh gói gửi tiền
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <SavingsCalculator />
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
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">So sánh lãi suất</h3>
                <p className="text-gray-600">
                  So sánh lãi suất từ nhiều ngân hàng Việt Nam
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Tính lãi kép</h3>
                <p className="text-gray-600">
                  Tính toán chính xác lãi suất kép và lãi đơn
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">
                  Lập mục tiêu tiết kiệm
                </h3>
                <p className="text-gray-600">
                  Tính toán số tiền cần tiết kiệm để đạt mục tiêu
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
