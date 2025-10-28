"use client";

import React from "react";
import Link from "next/link";
import { FeaturesConfig } from "@/configs/homepage-config";

interface FeaturesProps {
  config?: FeaturesConfig;
  company?: string;
}

export default function Features({ config, company }: FeaturesProps) {
  // Default config if none provided
  const defaultConfig: FeaturesConfig = {
    id: "features",
    features: [
      {
        id: "fast-approval",
        title: "Duyệt vay nhanh chóng cần CCCD",
        description:
          "Với công nghệ AI tiên tiến, bạn có thể tìm kiếm và duyệt khoản vay nhanh chóng để đăng ký trong vòng vài phút.",
        image: "/man-with-documents.jpg",
        imageAlt: "Fast loan approval",
      },
      {
        id: "credit-card-comparison",
        title: "So sánh & tìm kiếm thẻ tín dụng để đăng",
        description:
          "Chúng tôi hợp tác với các Ngân hàng và Tổ chức tín dụng uy tín trên thị trường để cung cấp sản phẩm thẻ tín dụng với nhiều lựa chọn phù hợp.",
        image: "/man-with-credit-cards.jpg",
        imageAlt: "Credit card comparison",
      },
      {
        id: "attractive-offers",
        title: "Ưu đãi, chính sách sản phẩm hấp dẫn",
        description:
          "Fin Zone liên kết cùng với các Ngân hàng & Tổ chức để đưa ra các sản phẩm tài chính có chính sách lãi suất đặc biệt, cùng rất nhiều ưu đãi hấp dẫn.",
        image: "/woman-excited.jpg",
        imageAlt: "Attractive financial offers",
      },
    ],
    layout: "grid",
    background: {
      className: "bg-gray-50",
    },
  };

  const featuresConfig = config || defaultConfig;

  const useDynamicTheme = !config?.background?.className;

  const getGridClass = () => {
    if (featuresConfig.layout === "list") {
      return "space-y-8";
    }

    const colCount = featuresConfig.features.length;
    if (colCount === 1) return "grid grid-cols-1";
    if (colCount === 2) return "grid md:grid-cols-2 gap-8";
    if (colCount >= 3) return "grid md:grid-cols-3 gap-8";
    return "grid gap-8";
  };

  return (
    <section
      className={`py-16 md:py-24 ${useDynamicTheme ? "bg-muted/50" : featuresConfig.background.className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        {(featuresConfig.title || featuresConfig.subtitle) && (
          <div className="text-center mb-12">
            {featuresConfig.title && (
              <h2
                className={`text-3xl md:text-4xl font-bold mb-4 ${useDynamicTheme ? "text-foreground" : "text-gray-900"}`}
              >
                {featuresConfig.title}
              </h2>
            )}
            {featuresConfig.subtitle && (
              <p
                className={`max-w-2xl mx-auto ${useDynamicTheme ? "text-muted-foreground" : "text-gray-600"}`}
              >
                {featuresConfig.subtitle}
              </p>
            )}
          </div>
        )}

        {/* Features grid/list */}
        <div className={getGridClass()}>
          {featuresConfig.features.map((feature) => (
            <div
              key={feature.id}
              className={`rounded-xl overflow-hidden shadow-sm hover:shadow-md transition ${useDynamicTheme ? "bg-card" : "bg-white"}`}
            >
              {/* Feature image */}
              <div
                className={`h-48 overflow-hidden ${useDynamicTheme ? "bg-primary/10" : "bg-teal-100"}`}
              >
                <img
                  src={feature.image || "/placeholder.svg"}
                  alt={feature.imageAlt || feature.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Feature content */}
              <div className="p-6">
                <h3
                  className={`text-xl font-bold mb-3 ${useDynamicTheme ? "text-primary" : "text-teal-600"}`}
                >
                  {feature.title}
                </h3>
                <p
                  className={`text-sm leading-relaxed ${useDynamicTheme ? "text-muted-foreground" : "text-gray-600"}`}
                >
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
