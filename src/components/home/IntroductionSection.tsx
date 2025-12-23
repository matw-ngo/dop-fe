"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { useTenant } from "@/hooks/useTenant";

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
    <section className="py-12 md:py-20 bg-white">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {sections.map((section, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="relative w-full aspect-[1.4] mb-8">
                <Image
                  src={section.image}
                  alt={section.title}
                  fill
                  className="object-contain"
                />
              </div>
              <h3
                className="text-lg md:text-xl font-bold mb-4 leading-tight"
                style={{ color: "#333" }}
              >
                {section.title}
              </h3>
              <p className="text-sm md:text-base text-gray-500 leading-relaxed max-w-[320px]">
                {section.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
