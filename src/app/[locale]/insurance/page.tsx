"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Heart, Car, Home } from "lucide-react";
import Link from "next/link";
import { InsuranceCatalog } from "@/components/features/insurance/InsuranceCatalog";

export default function InsurancePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    { id: "all", name: "Tất cả", icon: Shield, color: "text-blue-600" },
    {
      id: "health",
      name: "Bảo hiểm sức khỏe",
      icon: Heart,
      color: "text-red-600",
    },
    {
      id: "life",
      name: "Bảo hiểm nhân thọ",
      icon: Shield,
      color: "text-purple-600",
    },
    { id: "car", name: "Bảo hiểm xe", icon: Car, color: "text-green-600" },
    { id: "home", name: "Bảo hiểm nhà", icon: Home, color: "text-orange-600" },
    {
      id: "travel",
      name: "Bảo hiểm du lịch",
      icon: Shield,
      color: "text-cyan-600",
    },
  ];

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
              <h1 className="text-3xl font-bold text-gray-900">Bảo hiểm</h1>
              <p className="text-gray-600 mt-2">
                Tìm kiếm và so sánh các gói bảo hiểm phù hợp
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 overflow-x-auto">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={
                    selectedCategory === category.id ? "default" : "outline"
                  }
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <IconComponent className={`w-4 h-4 ${category.color}`} />
                  {category.name}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <InsuranceCatalog
          category={selectedCategory}
          onProductSelect={(productId) => {
            console.log("Selected product:", productId);
            // Navigate to product details or quote page
          }}
        />
      </div>
    </div>
  );
}
