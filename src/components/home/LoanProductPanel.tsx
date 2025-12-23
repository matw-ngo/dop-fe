"use client";

import { FormThemeProvider } from "@/components/form-generation/themes/ThemeProvider";
import { legacyLoanTheme } from "@/components/form-generation/themes/legacy-loan";
import { ApplyLoanForm } from "@/components/loan-application/ApplyLoanForm";
import {
  PercentageIcon,
  BankIcon,
  FlashIcon,
  SearchMoneyIcon,
} from "@/components/icons/home";

/**
 * Loan Product Panel Component
 *
 * Reference: docs/old-code/modules/LoanModule/index.tsx + styles.module.scss
 * Two-column layout with introduction points and loan application form
 */
export function LoanProductPanel() {
  const primaryColor = legacyLoanTheme.colors.primary;
  const textPrimary = legacyLoanTheme.colors.textPrimary;
  const textSecondary = legacyLoanTheme.colors.textSecondary;

  const contentPoints = [
    {
      icon: <PercentageIcon color={primaryColor} width={48} height={48} />,
      title: "Vay không thế chấp, lãi suất hấp dẫn",
      description: "Số tiền vay từ 5 - 90 triệu đồng, lãi suất chỉ từ 1,67%",
    },
    {
      icon: <BankIcon color={primaryColor} width={48} height={48} />,
      title: "Kết nối tới các đối tác tài chính uy tín",
      description:
        "Giải ngân nhanh chóng từ các ngân hàng, tổ chức tài chính hợp pháp và uy tín hàng đầu Việt Nam",
    },
    {
      icon: <FlashIcon color={primaryColor} width={48} height={48} />,
      title: "Thủ tục đơn giản, duyệt vay siêu tốc",
      description: "Duyệt vay trong ngày chỉ cần CCCD",
    },
  ];

  return (
    <div className="flex flex-wrap-reverse justify-between gap-8 md:gap-12 mt-12 md:mt-12">
      {/* Left Column: Introduction */}
      <div className="flex-1 min-w-full md:min-w-0 px-4 md:px-0 pb-4 md:pb-0">
        {/* Title */}
        <h2
          className="text-2xl md:text-[44px] font-bold mb-6 md:mb-10 text-center md:text-left"
          style={{ color: textPrimary }}
        >
          Đăng ký nhận khoản vay
        </h2>

        {/* Content Points */}
        <div className="space-y-6 md:space-y-8">
          {contentPoints.map((point, index) => (
            <div key={index} className="flex items-center gap-4 md:gap-6">
              <div className="w-8 h-8 md:w-12 md:h-12 flex-shrink-0">
                {point.icon}
              </div>
              <div>
                <h3
                  className="text-sm md:text-base font-semibold mb-1 md:mb-1.5"
                  style={{ color: textPrimary }}
                >
                  {point.title}
                </h3>
                <p
                  className="text-xs md:text-base leading-relaxed"
                  style={{ color: textSecondary }}
                >
                  {point.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Loan Form */}
      <div className="flex-1 min-w-full md:min-w-0">
        <div className="p-4 md:p-8 rounded-lg bg-white shadow-[0_4px_40px_0_rgba(0,71,51,0.05)] md:shadow-[0_4px_40px_0_rgba(0,71,51,0.05)]">
          {/* Mobile Title */}
          <div className="flex md:hidden items-center justify-center gap-3 mb-6">
            <SearchMoneyIcon color={primaryColor} width={24} height={24} />
            <span
              className="text-xl font-semibold"
              style={{ color: primaryColor }}
            >
              Vay tiêu dùng
            </span>
          </div>

          {/* Form */}
          <FormThemeProvider theme={legacyLoanTheme}>
            <ApplyLoanForm />
          </FormThemeProvider>
        </div>
      </div>
    </div>
  );
}
