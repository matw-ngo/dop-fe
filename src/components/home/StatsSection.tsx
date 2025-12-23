"use client";

import Image from "next/image";
import { legacyLoanTheme } from "@/components/form-generation/themes/legacy-loan";

/**
 * Stats Section Component
 *
 * Reference: docs/old-code/app/Home.module.scss lines 139-216
 * Four-column grid displaying company statistics
 */
export function StatsSection() {
  const primaryColor = legacyLoanTheme.colors.primary;
  const textSecondary = legacyLoanTheme.colors.textSecondary;

  const stats = [
    {
      icon: "/images/bank.png",
      number: "16+ đối tác",
      description: "Ngân hàng & Công ty tài chính uy tín",
    },
    {
      icon: "/images/connecticon.png",
      number: "3.000.000+",
      description: "Khách hàng được kết nối",
    },
    {
      icon: "/images/scoreicon.png",
      number: "2.000.000+",
      description: "Khách hàng đăng ký tư vấn",
    },
    {
      icon: "/images/loansuccess.png",
      number: "150.000+",
      description: "Khoản vay giới thiệu thành công",
    },
  ];

  return (
    <section className="py-12 md:py-20">
      <div className="max-w-[1170px] mx-auto px-4 md:px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-4 justify-items-center">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center gap-3 md:gap-4 w-full md:w-[270px] h-[166px] md:h-[280px] bg-white rounded-lg"
              style={{
                boxShadow: `0 8px 16px 0 rgba(1, 120, 72, 0.08)`,
              }}
            >
              <div className="w-14 h-14 md:w-16 md:h-16 relative">
                <Image
                  src={stat.icon}
                  alt={stat.description}
                  fill
                  className="object-contain"
                />
              </div>
              <div
                className="text-xl md:text-2xl font-bold md:font-bold leading-8 text-center"
                style={{ color: primaryColor }}
              >
                {stat.number}
              </div>
              <div
                className="text-sm font-normal leading-5 text-center px-4"
                style={{ color: textSecondary }}
              >
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
