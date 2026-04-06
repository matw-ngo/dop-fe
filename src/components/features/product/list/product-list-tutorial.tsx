"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { useFormTheme } from "@/components/form-generation/themes";

export const ProductListTutorial = () => {
  const t = useTranslations("features.products");
  const { theme } = useFormTheme();

  return (
    <div
      className="py-12 border-t"
      style={{ borderColor: theme.colors.border }}
    >
      <h2
        className="text-2xl font-bold mb-6"
        style={{ color: theme.colors.textPrimary }}
      >
        {t("tutorial.title")}
      </h2>
      <div
        className="text-center"
        style={{ color: theme.colors.textSecondary }}
      >
        <p>{t("tutorial.comingSoon")}</p>
      </div>
    </div>
  );
};
