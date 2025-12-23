"use client";

import Image from "next/image";
import { legacyLoanTheme } from "@/components/form-generation/themes/legacy-loan";

/**
 * Introduction Section Component
 *
 * Reference: docs/old-code/app/Home.module.scss lines 64-137
 * Three-column grid showcasing product benefits
 */
export function IntroductionSection() {
  const textPrimary = legacyLoanTheme.colors.textPrimary;
  const textSecondary = legacyLoanTheme.colors.textSecondary;

  const products = [
    {
      title: "Duyệt vay nhanh chóng chỉ cần CCCD",
      description:
        "Với công nghệ AI tiên tiến, bạn có thể tìm kiếm và duyệt khoản vay nhanh chóng dễ dàng trong vòng vài phút.",
      image: "/images/loan.png",
    },
    {
      title: "So sánh & tìm kiếm thẻ tín dụng dễ dàng",
      description:
        "Chúng tôi hợp tác với các Ngân hàng và Tổ chức tín dụng uy tín trên thị trường để cung cấp sản phẩm thẻ tín dụng với nhiều lựa chọn phù hợp.",
      image: "/images/credit.png",
    },
    {
      title: "Ưu đãi, chính sách sản phẩm hấp dẫn",
      description:
        "Fin Zone liên kết cùng với các Ngân hàng & Tổ chức để đưa ra các sản phẩm tài chính có chính sách lãi suất đặc biệt, cùng rất nhiều ưu đãi hấp dẫn.",
      image: "/images/benefit.png",
    },
  ];

  return (
    <section className="bg-[#fffdf7] py-12 md:py-20">
      <div className="max-w-[1170px] mx-auto px-4 md:px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12 justify-items-center">
          {products.map((product, index) => (
            <div key={index} className="w-full max-w-[336px]">
              <h3
                className="text-xl md:text-2xl font-bold mb-6 md:mb-8 leading-8"
                style={{ color: textPrimary }}
              >
                {product.title}
              </h3>
              <p
                className="text-sm md:text-base mb-6 md:mb-8 min-h-[60px] md:min-h-[96px] leading-6"
                style={{ color: textSecondary }}
              >
                {product.description}
              </p>
              <div className="h-auto md:h-[336px] relative">
                <Image
                  src={product.image}
                  alt={product.title}
                  width={336}
                  height={336}
                  className="mx-auto w-full h-auto object-contain"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
