"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import type { components } from "@/lib/api/v1/dop";
import { BorderTab } from "@/components/ui/border-tab";
import { getMockRating } from "@/mocks/data/products";
import { useFormTheme } from "@/components/form-generation/themes";
import { useProductCompareStore } from "@/store/use-product-compare-store";

type ProductDetail = components["schemas"]["ProductDetail"];

interface ProductListItemProps {
  product: ProductDetail;
}

export const ProductListItem = ({ product }: ProductListItemProps) => {
  const router = useRouter();
  const t = useTranslations("features.products");
  const { theme } = useFormTheme();
  const [isImageLoading, setIsImageLoading] = useState(true);

  // Compare store
  const { addProduct, removeProduct, isSelected } = useProductCompareStore();
  const isCompareSelected = isSelected(product.product_id);

  const rating = getMockRating(product.product_id);

  const parseDescription = (desc: string) => {
    const sections = {
      benefits: [] as string[],
      fees: [] as string[],
      conditions: [] as string[],
    };

    if (!desc) return sections;

    const lines = desc.split("\n").filter((line) => line.trim());
    let currentSection = "";

    for (const line of lines) {
      if (line.includes("## Ưu đãi") || line.includes("## Quyền lợi")) {
        currentSection = "benefits";
      } else if (line.includes("## Lãi suất") || line.includes("## Phí")) {
        currentSection = "fees";
      } else if (line.includes("## Điều kiện")) {
        currentSection = "conditions";
      } else if (line.startsWith("-") && currentSection) {
        const text = line.replace(/^-\s*/, "").trim();
        if (text) {
          sections[currentSection as keyof typeof sections].push(text);
        }
      }
    }

    return sections;
  };

  const sections = parseDescription(product.description || "");

  const TAB_LIST = [
    {
      id: "benefit",
      name: "Benefit",
      displayName: t("tabs.benefits"),
      component: (
        <div className="p-4">
          {sections.benefits.length > 0 ? (
            <ul
              className="list-disc list-inside space-y-2"
              style={{ color: theme.colors.textPrimary }}
            >
              {sections.benefits.map((item, i) => (
                <li key={`benefit_${i}`}>{item}</li>
              ))}
            </ul>
          ) : (
            <p style={{ color: theme.colors.textSecondary }}>
              {t("tabs.updating")}
            </p>
          )}
        </div>
      ),
      disabled: false,
    },
    {
      id: "fee",
      name: "Fee",
      displayName: t("tabs.fees"),
      component: (
        <div className="p-4">
          {sections.fees.length > 0 ? (
            <ul
              className="list-disc list-inside space-y-2"
              style={{ color: theme.colors.textPrimary }}
            >
              {sections.fees.map((item, i) => (
                <li key={`fee_${i}`}>{item}</li>
              ))}
            </ul>
          ) : (
            <p style={{ color: theme.colors.textSecondary }}>
              {t("tabs.updating")}
            </p>
          )}
        </div>
      ),
      disabled: false,
    },
    {
      id: "condition",
      name: "Condition",
      displayName: t("tabs.conditions"),
      component: (
        <div className="p-4">
          {sections.conditions.length > 0 ? (
            <ul
              className="list-disc list-inside space-y-2"
              style={{ color: theme.colors.textPrimary }}
            >
              {sections.conditions.map((item, i) => (
                <li key={`condition_${i}`}>{item}</li>
              ))}
            </ul>
          ) : (
            <p style={{ color: theme.colors.textSecondary }}>
              {t("tabs.updating")}
            </p>
          )}
        </div>
      ),
      disabled: false,
    },
  ];

  const handleViewDetail = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(`/products/${product.product_id}`);
  };

  const handleApplyNow = () => {
    console.log("Apply for product:", product.product_id);
  };

  const handleCompareToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const success = addProduct(product.product_id);
      if (!success) {
        // Max limit reached
        alert(t("comparing.max"));
        e.target.checked = false;
      }
    } else {
      removeProduct(product.product_id);
    }
  };

  return (
    <div
      className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow mb-6"
      style={{
        borderColor: theme.colors.containerBorder || theme.colors.border,
        padding: theme.spacing["2xl"],
        borderRadius: theme.borderRadius.md,
      }}
    >
      {/* Desktop Layout */}
      <div className="hidden md:flex mb-8" style={{ gap: theme.spacing.xl }}>
        <div className="flex flex-col items-center w-[200px]">
          <div
            className="w-full h-[126px] relative rounded-xl overflow-hidden mb-6"
            style={{ backgroundColor: theme.colors.muted || "#f3f4f6" }}
          >
            {product.thumbnail && (
              <Image
                src={product.thumbnail}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 200px"
                className={`object-contain transition-opacity ${
                  isImageLoading ? "opacity-0" : "opacity-100"
                }`}
                onLoad={() => setIsImageLoading(false)}
                onError={() => setIsImageLoading(false)}
              />
            )}
          </div>
          <button
            onClick={handleApplyNow}
            className="w-full px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors mb-4"
            style={{ backgroundColor: theme.colors.primary }}
          >
            {t("actions.applyNow")}
          </button>
          <Link
            href={`/products/${product.product_id}`}
            onClick={handleViewDetail}
            className="w-full text-center px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
            style={{
              color: theme.colors.primary,
              borderColor: theme.colors.primary,
            }}
          >
            {t("actions.viewDetail")}
          </Link>
        </div>

        <div className="flex-1" style={{ paddingLeft: theme.spacing.xl }}>
          <h3
            className="font-semibold mb-4"
            style={{
              fontSize: theme.typography.fontSizes.xl,
              lineHeight: "30px",
              color: theme.colors.textPrimary,
            }}
          >
            {product.name}
          </h3>
          <div className="flex items-center gap-3">
            <Star
              className="w-5 h-5"
              style={{
                fill: theme.colors.warning || "#EEBE40",
                color: theme.colors.warning || "#EEBE40",
              }}
            />
            <span
              className="text-lg font-semibold leading-7"
              style={{ color: theme.colors.primary }}
            >
              {rating}
            </span>
            <span
              className="text-sm leading-5"
              style={{ color: theme.colors.textSecondary }}
            >
              /5
            </span>
          </div>
          <p
            className="mt-4 mb-4"
            style={{ color: theme.colors.textSecondary }}
          >
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

        <div
          className="flex flex-col items-end"
          style={{ paddingLeft: "30px" }}
        >
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-6 h-6 rounded border-gray-300"
              style={{ accentColor: theme.colors.primary }}
              checked={isCompareSelected}
              onChange={handleCompareToggle}
            />
            <span
              className="text-sm"
              style={{ color: theme.colors.textPrimary }}
            >
              {t("actions.compare")}
            </span>
          </label>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        <h3
          className="text-base font-semibold mb-3 leading-6"
          style={{ color: theme.colors.textPrimary }}
        >
          {product.name}
        </h3>
        <div className="flex mb-6">
          <div
            className="flex-1 h-[100px] relative rounded overflow-hidden mr-3"
            style={{ backgroundColor: theme.colors.muted || "#f3f4f6" }}
          >
            {product.thumbnail && (
              <Image
                src={product.thumbnail}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 50vw, 200px"
                className="object-contain"
              />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center mb-3">
              <Star
                className="w-4 h-4 mr-2"
                style={{
                  fill: theme.colors.warning || "#EEBE40",
                  color: theme.colors.warning || "#EEBE40",
                }}
              />
              <span
                className="font-semibold"
                style={{ color: theme.colors.textPrimary }}
              >
                {rating}
              </span>
              <span
                className="text-sm ml-1"
                style={{ color: theme.colors.textSecondary }}
              >
                /5
              </span>
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                className="w-6 h-6 rounded border-gray-300"
                style={{ accentColor: theme.colors.primary }}
                checked={isCompareSelected}
                onChange={handleCompareToggle}
              />
              <span style={{ color: theme.colors.textPrimary }}>
                {t("actions.compare")}
              </span>
            </label>
          </div>
        </div>
        <button
          onClick={handleApplyNow}
          className="w-full px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors mb-4"
          style={{ backgroundColor: theme.colors.primary }}
        >
          {t("actions.applyNow")}
        </button>
        <Link
          href={`/products/${product.product_id}`}
          onClick={handleViewDetail}
          className="block w-full text-center px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors mb-6"
          style={{
            color: theme.colors.primary,
            borderColor: theme.colors.primary,
          }}
        >
          {t("actions.viewDetail")}
        </Link>
        <p
          className="text-sm mb-2"
          style={{ color: theme.colors.textSecondary }}
        >
          {product.summary}
        </p>
        {product.partner_name && (
          <p className="text-xs" style={{ color: theme.colors.textSecondary }}>
            {t("partner")}: {product.partner_name}
          </p>
        )}
      </div>

      <BorderTab tabList={TAB_LIST} />
    </div>
  );
};
