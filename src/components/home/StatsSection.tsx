"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { useTenant } from "@/hooks/useTenant";

export function StatsSection() {
  const t = useTranslations("components.home.stats");
  const tenant = useTenant();
  const primaryColor = tenant.theme.colors.primary;

  const stats = [
    {
      icon: "/images/bank.png",
      number: t("partners", { count: tenant.stats.partnersCount }),
      description: t("partnersDescription"),
    },
    {
      icon: "/images/connecticon.png",
      number: t("connections", {
        count: tenant.stats.connectionsCount.toLocaleString(),
      }),
      description: "",
    },
    {
      icon: "/images/scoreicon.png",
      number: t("registrations", {
        count: tenant.stats.registrationsCount.toLocaleString(),
      }),
      description: "",
    },
    {
      icon: "/images/loansuccess.png",
      number: t("successfulLoans", {
        count: tenant.stats.successfulLoansCount.toLocaleString(),
      }),
      description: "",
    },
  ];

  return (
    <section className="py-12 md:py-16 bg-[#fafafa]">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg flex flex-col items-center text-center transition-shadow hover:shadow-md"
              style={{
                boxShadow: "0 4px 12px rgba(1, 120, 72, 0.05)",
              }}
            >
              <div className="mb-4">
                <Image
                  src={stat.icon}
                  alt={stat.number}
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <div
                className="text-lg md:text-xl font-bold mb-1"
                style={{ color: primaryColor }}
              >
                {stat.number}
              </div>
              {stat.description && (
                <p className="text-xs md:text-sm text-gray-400">
                  {stat.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
