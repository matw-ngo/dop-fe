"use client";

import React, { useState, useEffect, useRef } from "react";
import { Star, User, Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import { useFormTheme } from "@/components/form-generation/themes";
import type { components } from "@/lib/api/v1/dop";
import { getMockRating } from "@/mocks/data/products";

type ProductDetail = components["schemas"]["ProductDetail"];

interface ProductDetailContentProps {
  product: ProductDetail;
}

export function ProductDetailContent({ product }: ProductDetailContentProps) {
  const t = useTranslations("features.products.detail");
  const { theme } = useFormTheme();
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [isCtaVisible, setIsCtaVisible] = useState(true);
  const ctaRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const currentRef = ctaRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsCtaVisible(entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(currentRef);

    return () => {
      observer.unobserve(currentRef);
    };
  }, []);

  const rating = getMockRating(product.product_id);

  const currentDate = new Date().toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const handleApplyNow = () => {
    // TODO: Implement apply logic when API ready
    console.log("Apply for product:", product.product_id);
  };

  return (
    <div className="space-y-8">
      {/* Product Brief */}
      <div
        className="border rounded-lg p-6"
        style={{ borderColor: theme.colors.border }}
      >
        {/* Desktop Layout */}
        <div className="hidden md:flex gap-6">
          {/* Left: Image */}
          <div className="w-64 flex-shrink-0">
            <div className="w-full aspect-[3/2] relative bg-gray-100 rounded-lg overflow-hidden">
              {product.thumbnail && (
                <img
                  src={product.thumbnail}
                  alt={product.name}
                  className={`w-full h-full object-contain transition-opacity ${
                    isImageLoading ? "opacity-0" : "opacity-100"
                  }`}
                  onLoad={() => setIsImageLoading(false)}
                  onError={() => setIsImageLoading(false)}
                />
              )}
            </div>
          </div>

          {/* Center: Info */}
          <div className="flex-1">
            <h1
              className="text-2xl font-bold mb-3"
              style={{ color: theme.colors.textPrimary }}
            >
              {product.name}
            </h1>
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span
                className="text-lg font-semibold"
                style={{ color: theme.colors.textPrimary }}
              >
                {rating}
              </span>
              <span style={{ color: theme.colors.textSecondary }}>/5</span>
            </div>
            <p className="mb-4" style={{ color: theme.colors.textSecondary }}>
              {product.summary}
            </p>
            {product.partner_name && (
              <p
                className="text-sm"
                style={{ color: theme.colors.textSecondary }}
              >
                {t("partner")}: {product.partner_name}
              </p>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex flex-col gap-3 w-48">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300"
              />
              <span
                className="text-sm"
                style={{ color: theme.colors.textPrimary }}
              >
                {t("compare")}
              </span>
            </label>
            <button
              onClick={handleApplyNow}
              className="w-full px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors"
              style={{ backgroundColor: theme.colors.primary }}
            >
              {t("applyNow")}
            </button>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden">
          <h1
            className="text-xl font-bold mb-3"
            style={{ color: theme.colors.textPrimary }}
          >
            {product.name}
          </h1>
          <div className="flex gap-4 mb-4">
            <div className="w-32 aspect-[3/2] relative bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
              {product.thumbnail && (
                <img
                  src={product.thumbnail}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span
                  className="font-semibold"
                  style={{ color: theme.colors.textPrimary }}
                >
                  {rating}
                </span>
                <span
                  className="text-sm"
                  style={{ color: theme.colors.textSecondary }}
                >
                  /5
                </span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span
                  className="text-sm"
                  style={{ color: theme.colors.textPrimary }}
                >
                  {t("compare")}
                </span>
              </label>
            </div>
          </div>
          <button
            ref={ctaRef}
            onClick={handleApplyNow}
            className="w-full px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors mb-4"
            style={{ backgroundColor: theme.colors.primary }}
          >
            {t("applyNow")}
          </button>
          <p
            className="text-sm mb-2"
            style={{ color: theme.colors.textSecondary }}
          >
            {product.summary}
          </p>
          {product.partner_name && (
            <p
              className="text-xs"
              style={{ color: theme.colors.textSecondary }}
            >
              {t("partner")}: {product.partner_name}
            </p>
          )}
        </div>
      </div>

      {/* Product Description */}
      {product.description && (
        <div
          className="border rounded-lg p-6"
          style={{ borderColor: theme.colors.border }}
        >
          <div
            className="prose max-w-none space-y-4"
            style={{ color: theme.colors.textPrimary }}
          >
            {product.description.split("\n").map((line, i) => {
              // Parse markdown-style content
              if (line.startsWith("## ")) {
                return (
                  <h2 key={i} className="text-xl font-bold mt-6 mb-3">
                    {line.replace("## ", "")}
                  </h2>
                );
              }
              if (line.startsWith("- ")) {
                return (
                  <li key={i} className="ml-4">
                    {line.replace("- ", "")}
                  </li>
                );
              }
              if (line.trim()) {
                return <p key={i}>{line}</p>;
              }
              return null;
            })}
          </div>
        </div>
      )}

      {/* Metadata */}
      <div
        className="flex flex-wrap gap-4 text-sm"
        style={{ color: theme.colors.textSecondary }}
      >
        <div className="flex items-center gap-2">
          <User className="w-4 h-4" />
          <span>Fin Zone</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>{t("lastUpdated", { date: currentDate })}</span>
        </div>
      </div>

      {/* Mobile Sticky CTA */}
      <div 
        className={`fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t p-4 flex items-center justify-between shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] transition-transform duration-300 ${!isCtaVisible ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <span className="flex-1 truncate font-semibold mr-4 text-sm" style={{ color: theme.colors.textPrimary }}>
          {product.name}
        </span>
        <button
          onClick={handleApplyNow}
          className="px-6 py-2.5 min-h-[44px] text-white rounded-lg hover:opacity-90 transition-colors whitespace-nowrap font-medium"
          style={{ backgroundColor: theme.colors.primary }}
        >
          {t("applyNow")}
        </button>
      </div>
    </div>
  );
}
