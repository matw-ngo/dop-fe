"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { useTenant } from "@/hooks/use-tenant";
import { ApplyLoanForm } from "./ApplyLoanForm";
import { PercentageSvg, BankSvg, FlashSvg, SearchMoneySvg } from "./icons";
import { Card, CardContent } from "@/components/ui/card";

export const DigitalLendingProduct = () => {
  const t = useTranslations("tenants.finzone.products.loan");
  const tenant = useTenant();
  const primaryColor = tenant.theme.colors.primary;

  const benefits = [
    {
      Icon: PercentageSvg,
      title: t("benefits.noCollateral"),
      description: t("benefits.noCollateralDesc"),
    },
    {
      Icon: BankSvg,
      title: t("benefits.trustedPartners"),
      description: t("benefits.trustedPartnersDesc"),
    },
    {
      Icon: FlashSvg,
      title: t("benefits.simpleFast"),
      description: t("benefits.simpleFastDesc"),
    },
  ];

  return (
    <div className="container mx-auto max-w-7xl px-4 md:px-6">
      {/* Main Layout: 2 Columns on Desktop, 1 on Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start py-8">
        {/* Left Column: Intro & Benefits */}
        <div className="space-y-8 pt-4">
          <h2 className="text-3xl md:text-4xl font-bold text-[#073126]">
            {t("title")}
          </h2>

          <div className="space-y-8">
            {benefits.map((item, index) => (
              <div key={index} className="flex gap-6 items-start group">
                <div className="flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
                  {/* Icon wrapper could be styled if needed, currently direct SVG */}
                  <item.Icon color={primaryColor} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-[#073126]">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-base">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Loan Form */}
        <div className="w-full">
          {/* Mobile Header for Form (Visible only on mobile/small screens) */}
          <div className="flex lg:hidden items-center gap-2 mb-4">
            <SearchMoneySvg color={primaryColor} />
            <span className="text-lg font-bold text-[#073126]">
              {t("title")}
            </span>
          </div>

          <Card className="shadow-2xl border-0 overflow-hidden ring-1 ring-black/5">
            <CardContent className="p-8 bg-white">
              {/* 
                 ApplyLoanForm already uses the theme from context, 
                 so we don't need to wrap it again if this component 
                 is used inside a FormThemeProvider. 
               */}
              <ApplyLoanForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
