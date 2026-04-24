"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useTenant } from "@/hooks/tenant/use-tenant";

export function IntroductionSection() {
  const t = useTranslations("components.home.introduction.sections");
  const tenant = useTenant();

  const sections = [
    {
      title: t("loanApproval.title"),
      description: t("loanApproval.description"),
      image: "/images/loan.png",
    },
    {
      title: t("creditCardComparison.title"),
      description: t("creditCardComparison.description"),
      image: "/images/credit.png",
    },
    {
      title: t("benefits.title", { companyName: tenant.name }),
      description: t("benefits.description", { companyName: tenant.name }),
      image: "/images/benefit.png",
    },
  ];

  return (
    <section className="py-12 md:py-20 bg-[#fffdf7]">
      <div className="max-w-[1170px] mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 justify-items-center">
          {sections.map((section, index) => (
            <div key={index} className="flex flex-col w-full md:w-[336px]">
              {/* Title */}
              <h3 className="text-xl md:text-2xl font-bold leading-8 mb-6 md:mb-8 text-[#004733]">
                {section.title}
              </h3>

              {/* Description */}
              <p className="text-sm md:text-base font-normal leading-5 md:leading-6 mb-6 md:mb-8 text-[#266352] min-h-[60px] md:min-h-[96px]">
                {section.description}
              </p>

              {/* Image */}
              <div className="relative w-full h-[336px] flex items-center justify-center">
                <Image
                  src={section.image}
                  alt={section.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 336px"
                  className="object-contain"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
