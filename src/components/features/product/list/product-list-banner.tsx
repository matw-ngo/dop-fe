"use client";

import React from "react";
import { User, Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import { useFormTheme } from "@/components/form-generation/themes";

export const ProductListBanner = () => {
  const t = useTranslations("features.products");
  const { theme } = useFormTheme();

  const currentDate = new Date().toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div
      className="relative h-[304px] flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('/static/images/banner/card_banner.png')",
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-white">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{t("title")}</h1>
        <p className="text-base md:text-lg mb-4 max-w-3xl">
          {t("description")}
        </p>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>{t("author")}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{t("lastUpdated", { date: currentDate })}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
