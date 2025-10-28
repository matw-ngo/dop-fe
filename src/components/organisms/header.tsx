"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  getNavbarConfig,
  NavbarConfig,
  NavbarItem,
} from "@/configs/navbar-config";
import { ChevronDown, Menu, X } from "lucide-react";

interface HeaderProps {
  company?: string;
  configOverride?: NavbarConfig;
}

export default function Header({ company, configOverride }: HeaderProps) {
  const [config, setConfig] = useState<NavbarConfig | null>(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());
  const pathname = usePathname();

  useEffect(() => {
    if (configOverride) {
      setConfig(configOverride);
    } else {
      const navbarConfig = getNavbarConfig(company);
      setConfig(navbarConfig);
    }
  }, [company, configOverride]);

  useEffect(() => {
    // Close mobile nav when route changes
    setIsMobileNavOpen(false);
    setOpenDropdowns(new Set());
  }, [pathname]);

  const handleEventTracking = (eventType?: string, data?: any) => {
    if (eventType && typeof window !== "undefined") {
      // This would integrate with your analytics system
      console.log("Event tracking:", eventType, data);
      // eventTracking(EventType[eventType], data)
    }
  };

  const toggleDropdown = (itemId: string) => {
    const newOpenDropdowns = new Set(openDropdowns);
    if (newOpenDropdowns.has(itemId)) {
      newOpenDropdowns.delete(itemId);
    } else {
      newOpenDropdowns.add(itemId);
    }
    setOpenDropdowns(newOpenDropdowns);
  };

  const handleNavItemClick = (item: NavbarItem) => {
    if (item.onClick) {
      handleEventTracking(item.onClick, { path: item.href });
    }
  };

  const renderNavItem = (item: NavbarItem, isMobile = false) => {
    const isDropdownOpen = openDropdowns.has(item.id);

    if (item.type === "dropdown") {
      return (
        <li key={item.id} className="relative group">
          {isMobile ? (
            <div>
              <button
                className="flex items-center justify-between w-full px-4 py-3 text-foreground hover:text-primary transition"
                onClick={() => toggleDropdown(item.id)}
              >
                <span>{item.label}</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isDropdownOpen && item.children && (
                <div className="bg-muted/50 border-l-2 border-primary">
                  {item.children.map((child) => (
                    <Link
                      key={child.id}
                      href={child.href || "#"}
                      target={child.target}
                      className="block px-8 py-2 text-muted-foreground hover:text-primary transition"
                      onClick={() => handleNavItemClick(child)}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <button className="flex items-center gap-1 text-foreground hover:text-primary transition">
                {item.label}
                <ChevronDown className="w-4 h-4" />
              </button>
              <div className="absolute top-full left-0 mt-1 w-48 bg-card border border-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                {item.children?.map((child) => (
                  <Link
                    key={child.id}
                    href={child.href || "#"}
                    target={child.target}
                    className="block px-4 py-2 text-foreground hover:text-primary hover:bg-muted/50 transition"
                    onClick={() => handleNavItemClick(child)}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </li>
      );
    }

    return (
      <li key={item.id}>
        <Link
          href={item.href || "#"}
          target={item.target}
          className={`${
            isMobile
              ? "block px-4 py-3 text-foreground hover:text-primary transition"
              : "text-foreground hover:text-primary transition"
          }`}
          onClick={() => handleNavItemClick(item)}
        >
          {item.label}
        </Link>
      </li>
    );
  };

  if (!config) {
    return null; // or loading spinner
  }

  // Check if navbar should be hidden on current path
  const shouldHideNavbar =
    config.hideOnPaths?.some((path) => pathname.includes(path)) ||
    (config.showOnPaths &&
      !config.showOnPaths.some((path) => pathname.includes(path)));

  if (shouldHideNavbar) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={config.logo.href} className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: config.logo.iconColor }}
            >
              <span className="text-white font-bold text-sm">
                {config.logo.iconLetter}
              </span>
            </div>
            <span className="font-bold text-lg text-foreground">
              {config.logo.text}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <ul className="flex items-center gap-8">
              {config.navigation.map((item) => renderNavItem(item, false))}
            </ul>
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
          >
            {isMobileNavOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileNavOpen && (
          <div className="md:hidden border-t border-border bg-card">
            <ul className="py-2">
              {config.navigation.map((item) => renderNavItem(item, true))}
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}
