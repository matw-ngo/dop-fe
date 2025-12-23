"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Logo } from "@/components/icons/home";
import { useTenant } from "@/hooks/useTenant";

/**
 * Header Component (NavBar)
 *
 * Refactored for multi-tenancy and i18n.
 */

interface NavItem {
  label: string;
  href?: string;
  external?: boolean;
  children?: { label: string; href: string; external?: boolean }[];
}

export function Header() {
  const t = useTranslations("components.layout.header.nav");
  const tenant = useTenant();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const primaryColor = tenant.theme.colors.primary;

  // Hide header on loan flow pages
  const hideHeader = ["/loan-info", "/tim-kiem-vay", "/ket-qua-vay"].some(
    (path) => pathname?.includes(path),
  );

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setOpenDropdown(null);
  }, [pathname]);

  const navItems: NavItem[] = [
    {
      label: t("about.label", { companyName: tenant.name }),
      children: [
        { label: t("about.introduction"), href: "/gioi-thieu" },
        { label: t("about.contact"), href: "/lien-he" },
      ],
    },
    {
      label: t("products.label"),
      children: [
        { label: t("products.lending"), href: "/vay-tieu-dung" },
        { label: t("products.creditCard"), href: "/the-tin-dung" },
        { label: t("products.insurance"), href: "/bao-hiem" },
      ],
    },
    {
      label: t("tools.label"),
      children: [
        {
          label: t("tools.loanCalculator"),
          href: "/cong-cu/tinh-toan-khoan-vay",
        },
        {
          label: t("tools.savingsCalculator"),
          href: "/cong-cu/tinh-lai-tien-gui",
        },
        {
          label: t("tools.salaryGrossToNet"),
          href: "/cong-cu/tinh-luong-gross-net",
        },
        {
          label: t("tools.salaryNetToGross"),
          href: "/cong-cu/tinh-luong-net-gross",
        },
      ],
    },
    { label: t("support"), href: "/lien-he" },
    { label: t("blog"), href: "https://blog.finzone.vn", external: true },
  ];

  if (hideHeader) return null;

  return (
    <header
      className="fixed top-0 left-0 right-0 z-30 bg-white transition-colors"
      style={{
        boxShadow: "0 4px 40px 0 rgba(0, 71, 51, 0.05)",
        backgroundColor: isMobileMenuOpen ? primaryColor : "white",
      }}
    >
      <nav className="max-w-full px-4 mx-auto">
        <div className="flex items-center justify-center relative h-[60px] md:h-[72px]">
          {/* Logo */}
          <Link href="/" className="absolute left-4 md:left-12">
            <Logo
              currentColor={isMobileMenuOpen ? "white" : primaryColor}
              width={124}
              height={40}
            />
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden absolute right-4 p-2"
            aria-label="Toggle menu"
          >
            {!isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="white" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex md:space-x-8">
            {navItems.map((item, index) => (
              <li key={index} className="relative group">
                {item.children ? (
                  <div>
                    <button
                      className="px-3 py-6 font-medium text-sm transition-colors flex items-center"
                      style={{ color: primaryColor }}
                      onMouseEnter={() => setOpenDropdown(item.label)}
                    >
                      {item.label}
                      <span className="ml-1 text-[10px]">▼</span>
                    </button>
                    {openDropdown === item.label && (
                      <div
                        className="absolute top-full left-0 bg-white rounded border shadow-lg z-50 w-52"
                        onMouseLeave={() => setOpenDropdown(null)}
                      >
                        <ul className="py-1">
                          {item.children.map((child, childIndex) => (
                            <li key={childIndex}>
                              <Link
                                href={child.href}
                                className="block px-4 py-3 text-sm hover:bg-gray-400/10 transition-colors"
                                style={{ color: primaryColor }}
                              >
                                {child.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href!}
                    target={item.external ? "_blank" : undefined}
                    className="px-3 py-6 font-medium text-sm transition-colors inline-block"
                    style={{ color: primaryColor }}
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white px-5 pb-8 min-h-screen">
            <ul>
              {navItems.map((item, index) => (
                <li key={index} className="border-t border-gray-200">
                  {item.children ? (
                    <div>
                      <button
                        onClick={() =>
                          setOpenDropdown(
                            openDropdown === item.label ? null : item.label,
                          )
                        }
                        className="flex items-center justify-between w-full py-4 font-medium"
                        style={{ color: primaryColor }}
                      >
                        <span>{item.label}</span>
                        <span>{openDropdown === item.label ? "▲" : "▼"}</span>
                      </button>
                      {openDropdown === item.label && (
                        <ul className="pl-6 pb-4 space-y-4">
                          {item.children.map((child, childIndex) => (
                            <li key={childIndex}>
                              <Link
                                href={child.href}
                                className="text-sm block"
                                style={{ color: primaryColor }}
                              >
                                {child.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.href!}
                      target={item.external ? "_blank" : undefined}
                      className="block py-4 font-medium"
                      style={{ color: primaryColor }}
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>
    </header>
  );
}
