"use client";

import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Calculator,
  TrendingUp,
  DollarSign,
  FileText,
  PiggyBank,
} from "lucide-react";
import Link from "next/link";

export default function ToolsPage() {
  const tools = [
    {
      id: "loan-calculator",
      title: "Công cụ tính toán vay vốn",
      description: "Tính toán khoản vay, lãi suất và lịch trả góp chi tiết",
      icon: Calculator,
      color: "bg-blue-100 text-blue-600",
      href: "/vi/tools/loan-calculator",
    },
    {
      id: "savings-calculator",
      title: "Công cụ tiết kiệm",
      description: "So sánh lãi suất tiết kiệm và tính toán mục tiêu tài chính",
      icon: TrendingUp,
      color: "bg-green-100 text-green-600",
      href: "/vi/tools/savings-calculator",
    },
    {
      id: "salary-converter",
      title: "Chuyển đổi lương Gross - Net",
      description: "Tính toán lương thực nhận sau thuế và bảo hiểm",
      icon: DollarSign,
      color: "bg-purple-100 text-purple-600",
      href: "/vi/tools/salary-converter",
    },
  ];

  const comingSoon = [
    {
      id: "roi-calculator",
      title: "Công cụ ROI",
      description: "Tính toán tỷ suất hoàn vốn cho các khoản đầu tư",
      icon: PiggyBank,
      color: "bg-orange-100 text-orange-600",
    },
    {
      id: "tax-calculator",
      title: "Công cụ tính thuế",
      description: "Tính toán các loại thuế theo quy định Việt Nam",
      icon: FileText,
      color: "bg-red-100 text-red-600",
    },
  ];

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
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Công cụ tài chính
              </h1>
              <p className="text-gray-600 mt-1">
                Các công cụ tính toán và phân tích tài chính chuyên nghiệp
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Available Tools */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Công cụ sẵn có
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => {
              const IconComponent = tool.icon;
              return (
                <Link key={tool.id} href={tool.href}>
                  <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 cursor-pointer group">
                    <div className="flex items-center gap-4 mb-4">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${tool.color}`}
                      >
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors">
                        {tool.title}
                      </h3>
                    </div>
                    <p className="text-gray-600 group-hover:text-gray-800 transition-colors">
                      {tool.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Coming Soon */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Sắp ra mắt</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {comingSoon.map((tool) => {
              const IconComponent = tool.icon;
              return (
                <div
                  key={tool.id}
                  className="bg-white rounded-lg shadow-md p-6 opacity-75"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${tool.color}`}
                    >
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-lg text-gray-500">
                      {tool.title}
                    </h3>
                  </div>
                  <p className="text-gray-500 mb-4">{tool.description}</p>
                  <div className="bg-yellow-100 text-yellow-800 text-sm px-3 py-1 rounded-full inline-block">
                    Sắp ra mắt
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16 bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Tại sao chọn công cụ của chúng tôi?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calculator className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">
                Chính xác theo quy định Việt Nam
              </h3>
              <p className="text-gray-600">
                Tất cả tính toán đều tuân thủ các quy định và thông tư của Việt
                Nam
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">
                Dữ liệu thời gian thực
              </h3>
              <p className="text-gray-600">
                Luôn cập nhật lãi suất và các thông số từ các ngân hàng hàng đầu
                Việt Nam
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">
                Miễn phí và dễ sử dụng
              </h3>
              <p className="text-gray-600">
                Hoàn toàn miễn phí và giao diện thân thiện, dễ sử dụng cho mọi
                người
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
