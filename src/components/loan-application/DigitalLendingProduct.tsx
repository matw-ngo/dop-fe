"use client";

import { useTranslations } from "next-intl";
import { useTenant } from "@/hooks/tenant/use-tenant";
import { ApplyLoanForm } from "./ApplyLoanForm";
import { BankSvg, FlashSvg, PercentageSvg, SearchMoneySvg } from "./icons";

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
    <div className="flex justify-between flex-wrap-reverse gap-8 md:gap-[30px] min-h-[300px] mt-12">
      {/* Left Column: Intro & Benefits */}
      <div className="flex-1 min-w-full md:min-w-0 px-4 md:px-0 pb-4 md:pb-0">
        <h2 className="text-2xl md:text-[44px] font-bold leading-tight md:leading-normal text-[#004733] mb-6 md:mb-10 text-center md:text-left">
          {t("title")}
        </h2>

        <div className="space-y-6 md:space-y-8">
          {benefits.map((item, index) => (
            <div key={index} className="flex gap-4 md:gap-[25px] items-start">
              <div className="flex-shrink-0 w-8 h-8 md:w-12 md:h-12">
                <item.Icon color={primaryColor} />
              </div>
              <div className="flex-1">
                <h3 className="text-[15px] md:text-base font-semibold leading-5 md:leading-6 text-[#073126] mb-1.5">
                  {item.title}
                </h3>
                <p className="text-sm md:text-base font-normal leading-4 md:leading-6 text-[#266352]">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Loan Form */}
      <div className="flex-1 min-w-full md:min-w-0">
        {/* Mobile Header for Form */}
        <div className="flex md:hidden items-center justify-center gap-3 text-[#017848] text-xl font-semibold leading-[30px] mb-6 px-4">
          <SearchMoneySvg color={primaryColor} />
          <span>{t("title")}</span>
        </div>

        <div className="md:p-8 md:shadow-[0_4px_40px_0_rgba(0,71,51,0.05)] md:rounded-lg px-4 pb-4">
          <ApplyLoanForm />
        </div>
      </div>
    </div>
  );
};
