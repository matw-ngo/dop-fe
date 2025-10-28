"use client";

import React from "react";
import { HeroConfig } from "@/configs/homepage-config";

interface HeroProps {
  config?: HeroConfig;
  company?: string;
}

export default function Hero({ config, company }: HeroProps) {
  // Default config if none provided
  const defaultConfig: HeroConfig = {
    id: "hero",
    decorativeIcons: ["📋", "💰"],
    heading: "Dễ dàng lựa chọn sản phẩm tài chính cùng Fin Zone",
    subheading: {
      text: "Fin Zone cung cấp thông tin, so sánh và đánh giá",
      highlights: [
        {
          text: "ĐA DẠNG CÁC LỰA CHỌN",
          className: "font-bold text-gray-900",
        },
        {
          text: "về khoản vay tin chấp, thẻ tin dụng và bảo hiểm của",
        },
        {
          text: "MUÔN VÀN UU ĐÃI",
          className: "font-bold text-gray-900",
        },
        {
          text: "giúp bạn tiếp cận các dịch vụ tài chính một cách nhanh chóng và dễ dàng.",
        },
      ],
    },
    background: {
      className: "bg-gradient-to-b from-teal-50 to-white",
    },
  };

  const heroConfig = config || defaultConfig;

  const renderSubheading = () => {
    return (
      <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8 text-balance">
        {heroConfig.subheading.text}{" "}
        {heroConfig.subheading.highlights.map((highlight, index) => (
          <span key={index}>
            <span className={highlight.className || ""}>{highlight.text}</span>
            {index < heroConfig.subheading.highlights.length - 1 ? " " : ""}
          </span>
        ))}
      </p>
    );
  };

  return (
    <section className={`py-20 md:py-32 ${heroConfig.background.className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Decorative icons */}
          {heroConfig.decorativeIcons &&
            heroConfig.decorativeIcons.length > 0 && (
              <div className="flex justify-center gap-4 mb-8">
                {heroConfig.decorativeIcons.map((icon, index) => (
                  <div key={index} className="text-4xl">
                    {icon}
                  </div>
                ))}
              </div>
            )}

          {/* Main heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 text-balance">
            {heroConfig.heading}
          </h1>

          {/* Subheading */}
          {renderSubheading()}
        </div>
      </div>
    </section>
  );
}
