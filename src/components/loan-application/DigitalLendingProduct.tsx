"use client";

import React from "react";
import { useFormTheme } from "@/components/form-generation/themes";
import { ApplyLoanForm } from "./ApplyLoanForm";
import { PercentageSvg, BankSvg, FlashSvg, SearchMoneySvg } from "./icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const DigitalLendingProduct = () => {
  const { theme } = useFormTheme();
  const primaryColor = theme.colors.primary;

  // Benefits data
  const benefits = [
    {
      Icon: PercentageSvg,
      title: "Vay không thế chấp, lãi suất hấp dẫn",
      description: "Số tiền vay từ 5 - 90 triệu đồng, lãi suất chỉ từ 1,67%",
    },
    {
      Icon: BankSvg,
      title: "Kết nối tới các đối tác tài chính uy tín",
      description:
        "Giải ngân nhanh chóng từ các ngân hàng, tổ chức tài chính hợp pháp và uy tín hàng đầu Việt Nam",
    },
    {
      Icon: FlashSvg,
      title: "Thủ tục đơn giản, duyệt vay siêu tốc",
      description: "Duyệt vay trong ngày chỉ cần CCCD",
    },
  ];

  return (
    <div className="container mx-auto max-w-7xl px-4 md:px-6">
      {/* Main Layout: 2 Columns on Desktop, 1 on Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start py-8">
        {/* Left Column: Intro & Benefits */}
        <div className="space-y-8 pt-4">
          <h2 className="text-3xl md:text-4xl font-bold text-[#073126]">
            Đăng ký nhận khoản vay
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
              Vay tiêu dùng
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
