"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { useFormTheme } from "@/components/form-generation/themes";

export const ProductListFooter = () => {
  const t = useTranslations("features.products.guide");
  const { theme } = useFormTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className="py-12 border-t"
      style={{ borderColor: theme.colors.border }}
    >
      <h2
        className="text-2xl font-bold mb-6"
        style={{ color: theme.colors.textPrimary }}
      >
        {t("title")}
      </h2>

      <div
        className={`space-y-4 ${isExpanded ? "" : "max-h-48 overflow-hidden"}`}
      >
        <div>
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: theme.colors.textPrimary }}
          >
            {t("step1.title")}
          </h3>
          <p style={{ color: theme.colors.textSecondary }}>
            {t("step1.content")}
          </p>
        </div>

        <div>
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: theme.colors.textPrimary }}
          >
            {t("step2.title")}
          </h3>
          <p style={{ color: theme.colors.textSecondary }}>
            {t("step2.content")}
          </p>
        </div>

        <div>
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: theme.colors.textPrimary }}
          >
            {t("step3.title")}
          </h3>
          <p style={{ color: theme.colors.textSecondary }}>
            {t("step3.content")}
          </p>
        </div>
      </div>

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-4 flex items-center gap-2 hover:underline"
        style={{ color: theme.colors.primary }}
      >
        {isExpanded ? (
          <>
            <span>{t("collapse")}</span>
            <ChevronUp className="w-4 h-4" />
          </>
        ) : (
          <>
            <span>{t("expand")}</span>
            <ChevronDown className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
};
