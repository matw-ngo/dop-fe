"use client";

import Link from "next/link";
import {
  Logo,
  InstagramIcon,
  FacebookIcon,
  TiktokIcon,
  YoutubeIcon,
} from "@/components/icons/home";
import { legacyLoanTheme } from "@/components/form-generation/themes/legacy-loan";

/**
 * Footer Component
 *
 * Reference: docs/old-code/components/Footer/index.js + Footer.module.scss
 * Features:
 * - 5-column layout (responsive: 1 column mobile)
 * - Dark background with white text
 * - Social media links
 * - Company info and legal disclaimers
 */
export function Footer() {
  const primaryColor = legacyLoanTheme.colors.primary;

  return (
    <footer
      className="w-full min-h-[600px]"
      style={{ backgroundColor: "#004733" }}
    >
      <div className="max-w-full px-4 md:px-22 text-white">
        {/* Logo Header */}
        <div
          className="h-[100px] md:h-[126px] flex items-center border-b"
          style={{ borderColor: "#278c63" }}
        >
          <Logo currentColor="white" width={124} height={40} />
        </div>

        {/* 5-Column Grid */}
        <div
          className="flex flex-wrap justify-between pt-6 md:pt-6 gap-8 md:gap-4"
          style={{ color: "#73b59a" }}
        >
          {/* Column 1: Company Info */}
          <div className="w-full md:w-auto md:max-w-[280px]">
            <h3 className="font-bold text-sm mb-4 text-white">
              ĐƠN VỊ CHỦ QUẢN
            </h3>
            <div className="text-sm space-y-2">
              <p>
                Công ty Cổ phần Công nghệ Data Nest - Data Nest Technologies JSC
              </p>
              <p>
                Trụ sở: Tầng 7, HITC Building, 239 Xuân Thủy, Q. Cầu Giấy, Hà
                Nội.
              </p>
              <p>
                Chi nhánh HCM: Tòa nhà Viettel, 285 Cách Mạng Tháng 8, Quận 10,
                Hồ Chí Minh.
              </p>
            </div>
          </div>

          {/* Column 2: Information Links */}
          <div className="w-full md:w-auto md:max-w-[280px]">
            <h3 className="font-bold text-sm mb-4 text-white">THÔNG TIN</h3>
            <ul className="flex flex-col md:flex-col flex-wrap gap-6 md:gap-6 text-sm">
              <li>
                <Link
                  href="/gioi-thieu"
                  className="hover:text-white transition"
                >
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link
                  href="https://blog.finzone.vn"
                  target="_blank"
                  className="hover:text-white transition"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/lien-he" className="hover:text-white transition">
                  Liên hệ
                </Link>
              </li>
              <li>
                <span>FAQ</span>
              </li>
              <li>
                <Link
                  href="/dieu-khoan-su-dung"
                  className="hover:text-white transition"
                >
                  Điều khoản
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Products */}
          <div className="w-full md:w-auto md:max-w-[280px]">
            <h3 className="font-bold text-sm mb-4 text-white">SẢN PHẨM</h3>
            <ul className="flex flex-col md:flex-col flex-wrap gap-6 md:gap-6 text-sm">
              <li>
                <Link
                  href="/vay-tieu-dung"
                  className="hover:text-white transition"
                >
                  Vay tiêu dùng
                </Link>
              </li>
              <li>
                <Link
                  href="/the-tin-dung"
                  className="hover:text-white transition"
                >
                  Thẻ tín dụng
                </Link>
              </li>
              <li>
                <Link href="/bao-hiem" className="hover:text-white transition">
                  Bảo hiểm
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Tools */}
          <div className="w-full md:w-auto md:max-w-[280px]">
            <h3 className="font-bold text-sm mb-4 text-white">CÔNG CỤ</h3>
            <ul className="flex flex-col md:flex-col flex-wrap gap-6 md:gap-6 text-sm">
              <li>
                <Link
                  href="/cong-cu/tinh-toan-khoan-vay"
                  className="hover:text-white transition"
                >
                  Tính toán khoản vay
                </Link>
              </li>
              <li>
                <Link
                  href="/cong-cu/tinh-lai-tien-gui"
                  className="hover:text-white transition"
                >
                  Tính lãi tiền gửi
                </Link>
              </li>
              <li>
                <Link
                  href="/cong-cu/tinh-luong-gross-net"
                  className="hover:text-white transition"
                >
                  Tính lương Gross - Net
                </Link>
              </li>
              <li>
                <Link
                  href="/cong-cu/tinh-luong-net-gross"
                  className="hover:text-white transition"
                >
                  Tính lương Net - Gross
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Social Media */}
          <div className="w-full md:w-auto md:max-w-[280px]">
            <h3 className="font-bold text-sm mb-4 text-white">SOCIAL MEDIA</h3>
            <div className="flex gap-3 mb-8">
              <a
                href="https://www.instagram.com/finzone.vietnam"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition"
              >
                <InstagramIcon color="#73b59a" width={24} height={24} />
              </a>
              <a
                href="https://www.facebook.com/finzonevietnam/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition"
              >
                <FacebookIcon color="#73b59a" width={24} height={24} />
              </a>
              <a
                href="https://www.tiktok.com/@finzone.vn"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition"
              >
                <TiktokIcon color="#73b59a" width={24} height={24} />
              </a>
              <a
                href="https://www.youtube.com/channel/UCekh_IetVHbSzmUwuyh16Gw"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition"
              >
                <YoutubeIcon color="#73b59a" width={24} height={24} />
              </a>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div
          className="mt-10 md:mt-10 pb-6 md:pb-6 border-b text-xs md:text-sm opacity-60 text-justify"
          style={{ borderColor: "#278c63" }}
        >
          Fin Zone không phải đơn vị cung cấp cho vay và không phát hành các
          khoản vay. Dịch vụ của Fin Zone giúp đán giá các đối tác vay uy tín
          với các sản phẩm tài chính đa dạng, thời gian trả nợ linh hoạt từ 91
          đến 180 ngày, với lãi suất APR tối thiểu là 0% và tối đa là 20%. Fin
          Zone không tính phí sử dụng dịch vụ. Chi phí cuối cùng mà người vay
          phải trả phụ thuộc vào từng khoản vay. Người dùng sẽ nhận được thông
          tin đầy đủ và chính xác về APR, cũng như tất cả các khoản phí trước
          khi ký hợp đồng vay.
        </div>

        {/* Copyright */}
        <div className="mt-4 pb-12 md:pb-12 text-xs opacity-60">
          <p className="mb-1">
            Giấy chứng nhận Đăng ký Kinh doanh số 0108201417 cấp bởi Sở Kế hoạch
            và Đầu tư TP Hà Nội ngày 27/03/2018
          </p>
          <p className="mb-1">
            Giấy phép Thiết lập Mạng Xã Hội trên mạng số 26/GP-BTTTT cấp bởi Bộ
            Thông Tin và Truyền Thông ngày 06/02/2024
          </p>
          <p>Copyright © 2023 Fin Zone, All rights reserved</p>
        </div>
      </div>
    </footer>
  );
}
