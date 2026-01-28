"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  FacebookIcon,
  InstagramIcon,
  Logo,
  TiktokIcon,
  YoutubeIcon,
} from "@/components/icons/home";
import { useTenant } from "@/hooks/tenant/use-tenant";

/**
 * Footer Component
 *
 * Refactored for multi-tenancy and i18n.
 */
export function Footer() {
  const t = useTranslations("components.layout.footer");
  const tenant = useTenant();
  const t_company = useTranslations(`tenants.${tenant.id}.company`);
  const t_legal = useTranslations(`tenants.${tenant.id}.legal`);
  const t_products = useTranslations(`tenants.${tenant.id}.products`);
  const currentYear = new Date().getFullYear();
  const _primaryColor = tenant.theme.colors.primary;

  const socialMedia = tenant.features.socialMedia;

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
            <h3 className="font-bold text-sm mb-4 text-white uppercase">
              {t("companyInfo.title")}
            </h3>
            <div className="text-sm space-y-2">
              <p>{t_company("fullName")}</p>
              <p>
                {t("companyInfo.headquartersLabel")}:{" "}
                {t_company("addresses.headquarters")}
              </p>
              <p>
                {t("companyInfo.branchLabel")}:{" "}
                {t_company("addresses.hcmBranch")}
              </p>
            </div>
          </div>

          {/* Column 2: Information Links */}
          <div className="w-full md:w-auto md:max-w-[280px]">
            <h3 className="font-bold text-sm mb-4 text-white uppercase">
              {t("information.title")}
            </h3>
            <ul className="flex flex-col md:flex-col flex-wrap gap-6 md:gap-6 text-sm">
              <li>
                <Link
                  href="/gioi-thieu"
                  className="hover:text-white transition"
                >
                  {t("information.about")}
                </Link>
              </li>
              <li>
                <Link
                  href="https://blog.finzone.vn"
                  target="_blank"
                  className="hover:text-white transition"
                >
                  {t("information.blog")}
                </Link>
              </li>
              <li>
                <Link href="/lien-he" className="hover:text-white transition">
                  {t("information.contact")}
                </Link>
              </li>
              <li>
                <span>{t("information.faq")}</span>
              </li>
              <li>
                <Link
                  href="/dieu-khoan-su-dung"
                  className="hover:text-white transition"
                >
                  {t("information.terms")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Products */}
          <div className="w-full md:w-auto md:max-w-[280px]">
            <h3 className="font-bold text-sm mb-4 text-white uppercase">
              {t("products.title")}
            </h3>
            <ul className="flex flex-col md:flex-col flex-wrap gap-6 md:gap-6 text-sm">
              <li>
                <Link
                  href="/vay-tieu-dung"
                  className="hover:text-white transition"
                >
                  {t_products("loan.title")}
                </Link>
              </li>
              <li>
                <Link
                  href="/the-tin-dung"
                  className="hover:text-white transition"
                >
                  {t_products("creditCard.title")}
                </Link>
              </li>
              <li>
                <Link href="/bao-hiem" className="hover:text-white transition">
                  {t_products("insurance.title")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Tools */}
          <div className="w-full md:w-auto md:max-w-[280px]">
            <h3 className="font-bold text-sm mb-4 text-white uppercase">
              {t("tools.title")}
            </h3>
            <ul className="flex flex-col md:flex-col flex-wrap gap-6 md:gap-6 text-sm">
              <li>
                <Link
                  href="/cong-cu/tinh-toan-khoan-vay"
                  className="hover:text-white transition"
                >
                  {t("tools.loanCalculator")}
                </Link>
              </li>
              <li>
                <Link
                  href="/cong-cu/tinh-lai-tien-gui"
                  className="hover:text-white transition"
                >
                  {t("tools.depositInterest")}
                </Link>
              </li>
              <li>
                <Link
                  href="/cong-cu/tinh-luong-gross-net"
                  className="hover:text-white transition"
                >
                  {t("tools.salaryGrossNet")}
                </Link>
              </li>
              <li>
                <Link
                  href="/cong-cu/tinh-luong-net-gross"
                  className="hover:text-white transition"
                >
                  {t("tools.salaryNetGross")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Social Media */}
          <div className="w-full md:w-auto md:max-w-[280px]">
            <h3 className="font-bold text-sm mb-4 text-white uppercase">
              {t("socialMedia.title")}
            </h3>
            <div className="flex gap-3 mb-8">
              {socialMedia.instagram && (
                <a
                  href={socialMedia.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition"
                >
                  <InstagramIcon color="#73b59a" width={24} height={24} />
                </a>
              )}
              {socialMedia.facebook && (
                <a
                  href={socialMedia.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition"
                >
                  <FacebookIcon color="#73b59a" width={24} height={24} />
                </a>
              )}
              {socialMedia.tiktok && (
                <a
                  href={socialMedia.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition"
                >
                  <TiktokIcon color="#73b59a" width={24} height={24} />
                </a>
              )}
              {socialMedia.youtube && (
                <a
                  href={socialMedia.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition"
                >
                  <YoutubeIcon color="#73b59a" width={24} height={24} />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div
          className="mt-10 md:mt-10 pb-6 md:pb-6 border-b text-xs md:text-sm opacity-60 text-justify"
          style={{ borderColor: "#278c63" }}
        >
          {t_legal("disclaimer")}
        </div>

        {/* Copyright */}
        <div className="mt-4 pb-12 md:pb-12 text-xs opacity-60">
          <p className="mb-1">
            {t_legal("businessLicense", {
              number: tenant.legal.businessLicense,
            })}
          </p>
          {tenant.legal.socialLicense && (
            <p className="mb-1">
              {t_legal("socialLicense", { number: tenant.legal.socialLicense })}
            </p>
          )}
          <p>
            {t("legal.copyright", {
              year: currentYear,
              companyName: tenant.name,
            })}
          </p>
        </div>
      </div>
    </footer>
  );
}
