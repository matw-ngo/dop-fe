"use client";

import { useTranslations } from "next-intl";
import { ApplyLoanForm } from "@/components/loan-application/ApplyLoanForm";
import { useTenant } from "@/hooks/tenant/use-tenant";
import { PercentageIcon, BankIcon, FlashIcon } from "@/components/icons/home";

export function LoanProductPanel() {
  const t_hero = useTranslations(
    "components.home.introduction.sections.loanApproval",
  );
  const t_products = useTranslations("tenants.finzone.products.loan");
  const tenant = useTenant();
  const primaryColor = tenant.theme.colors.primary;

  const benefits = [
    {
      icon: <PercentageIcon color={primaryColor} />,
      text: t_products("benefits.lowRate", {
        minRate: tenant.products.loan.minRate,
        maxRate: tenant.products.loan.maxRate,
      }),
    },
    {
      icon: <BankIcon color={primaryColor} />,
      text: t_products("benefits.highAmount", {
        maxAmount: tenant.products.loan.maxAmount / 1_000_000, // Convert to millions
      }),
    },
    {
      icon: <FlashIcon color={primaryColor} />,
      text: t_products("benefits.fastApproval", {
        approvalTime: tenant.products.loan.approvalTime,
      }),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
      {/* Left Column: Intro */}
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            {t_hero("title")}
          </h2>
          <p className="text-base text-gray-500 leading-relaxed max-w-[480px]">
            {t_hero("description")}
          </p>
        </div>

        <div className="space-y-4">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#f0f7f4] flex items-center justify-center shrink-0">
                {benefit.icon}
              </div>
              <span className="text-sm md:text-base text-gray-700 font-medium">
                {benefit.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Form */}
      <div
        className="bg-white p-6 md:p-8 rounded-2xl border"
        style={{
          boxShadow: "0 10px 40px rgba(1, 120, 72, 0.08)",
          borderColor: "rgba(1, 120, 72, 0.1)",
        }}
      >
        <ApplyLoanForm />
      </div>
    </div>
  );
}
