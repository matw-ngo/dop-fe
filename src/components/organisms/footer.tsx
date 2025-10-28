"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  getFooterConfig,
  FooterConfig,
  FooterLink,
  SocialMediaLink,
} from "@/configs/footer-config";

interface FooterProps {
  company?: string;
  configOverride?: FooterConfig;
}

export default function Footer({ company, configOverride }: FooterProps) {
  const [config, setConfig] = useState<FooterConfig | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (configOverride) {
      setConfig(configOverride);
    } else {
      const footerConfig = getFooterConfig(company);
      setConfig(footerConfig);
    }
  }, [company, configOverride]);

  const handleEventTracking = (eventType?: string, data?: any) => {
    if (eventType && typeof window !== "undefined") {
      // This would integrate with your analytics system
      console.log("Event tracking:", eventType, data);
      // eventTracking(EventType[eventType], data)
    }
  };

  const handleLinkClick = (link: FooterLink) => {
    if (link.onClick) {
      handleEventTracking(link.onClick, { path: link.href });
    }
  };

  const getSocialIcon = (platform: SocialMediaLink["platform"]) => {
    switch (platform) {
      case "facebook":
        return (
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        );
      case "twitter":
        return (
          <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 7-7 7-7" />
        );
      case "instagram":
        return (
          <>
            <rect
              x="2"
              y="2"
              width="20"
              height="20"
              rx="5"
              ry="5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
            <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" />
          </>
        );
      case "youtube":
        return (
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        );
      case "linkedin":
        return (
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        );
      case "tiktok":
        return (
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
        );
      default:
        return null;
    }
  };

  if (!config) {
    return null; // or loading spinner
  }

  // Check if footer should be hidden on current path
  const shouldHideFooter =
    config.hideOnPaths?.some((path) => pathname.includes(path)) ||
    (config.showOnPaths &&
      !config.showOnPaths.some((path) => pathname.includes(path)));

  if (shouldHideFooter) {
    return null;
  }

  const useDynamicTheme = !config.theme;

  // Since the social button hover color is dynamic, we can't use Tailwind's hover: pseudo-class
  // when using inline styles. This helper handles that logic.
  const handleSocialHover = (
    e: React.MouseEvent<HTMLAnchorElement>,
    isHovering: boolean,
  ) => {
    if (useDynamicTheme) return;

    e.currentTarget.style.backgroundColor = isHovering
      ? config.theme!.socialButtonHoverColor
      : config.theme!.socialButtonColor;
  };

  return (
    <footer
      className={`py-16 ${
        useDynamicTheme
          ? "bg-secondary text-secondary-foreground"
          : "text-white"
      }`}
      style={
        useDynamicTheme
          ? {}
          : { backgroundColor: config.theme!.backgroundColor }
      }
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`grid md:grid-cols-${Math.min(config.sections.length + 1, 6)} gap-8 mb-12`}
        >
          {/* Company info */}
          <div>
            <Link
              href={config.logo.href}
              className="flex items-center gap-2 mb-4"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: config.logo.iconBgColor }}
              >
                <span
                  className="font-bold text-sm"
                  style={{ color: config.logo.iconColor }}
                >
                  {config.logo.iconLetter}
                </span>
              </div>
              <span
                className={`font-bold text-lg ${
                  useDynamicTheme ? "text-foreground" : ""
                }`}
                style={
                  useDynamicTheme ? {} : { color: config.theme!.textColor }
                }
              >
                {config.logo.text}
              </span>
            </Link>
            <p
              className={`text-sm mb-4 ${
                useDynamicTheme ? "text-muted-foreground" : ""
              }`}
              style={
                useDynamicTheme
                  ? {}
                  : { color: config.theme!.textSecondaryColor }
              }
            >
              {config.companyInfo.description}
            </p>
            {config.companyInfo.addresses.map((address, index) => (
              <p
                key={index}
                className={`text-sm mb-2 ${
                  useDynamicTheme ? "text-muted-foreground" : ""
                }`}
                style={
                  useDynamicTheme
                    ? {}
                    : { color: config.theme!.textSecondaryColor }
                }
              >
                {address}
              </p>
            ))}
          </div>

          {/* Dynamic sections */}
          {config.sections.map((section) => (
            <div key={section.id}>
              <h3
                className={`font-bold mb-4 ${
                  useDynamicTheme ? "text-foreground" : ""
                }`}
                style={
                  useDynamicTheme ? {} : { color: config.theme!.textColor }
                }
              >
                {section.title}
              </h3>
              <ul className="space-y-2 text-sm">
                {section.links.map((link) => (
                  <li key={link.id}>
                    <Link
                      href={link.href}
                      target={link.target}
                      className={`transition ${
                        useDynamicTheme
                          ? "text-muted-foreground hover:text-foreground"
                          : "hover:text-white"
                      }`}
                      style={
                        useDynamicTheme
                          ? {}
                          : { color: config.theme!.textSecondaryColor }
                      }
                      onClick={() => handleLinkClick(link)}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Social media */}
        {config.socialMedia && config.socialMedia.length > 0 && (
          <div
            className={`flex justify-end gap-4 mb-8 pb-8 border-t ${
              useDynamicTheme ? "border-border" : ""
            }`}
            style={
              useDynamicTheme ? {} : { borderColor: config.theme!.borderColor }
            }
          >
            {config.socialMedia.map((social) => (
              <a
                key={social.id}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.ariaLabel || social.platform}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition ${
                  useDynamicTheme ? "bg-muted hover:bg-muted/80" : ""
                }`}
                style={
                  useDynamicTheme
                    ? {}
                    : {
                        backgroundColor: config.theme!.socialButtonColor,
                      }
                }
                onMouseEnter={(e) => handleSocialHover(e, true)}
                onMouseLeave={(e) => handleSocialHover(e, false)}
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  {getSocialIcon(social.platform)}
                </svg>
              </a>
            ))}
          </div>
        )}

        {/* Bottom text */}
        <div
          className={`text-xs space-y-2 ${
            useDynamicTheme ? "text-muted-foreground" : ""
          }`}
          style={
            useDynamicTheme ? {} : { color: config.theme!.textSecondaryColor }
          }
        >
          {config.companyInfo.disclaimer && (
            <p>{config.companyInfo.disclaimer}</p>
          )}
          {config.companyInfo.businessRegistration?.map(
            (registration, index) => (
              <p key={index}>{registration}</p>
            ),
          )}
          <p>{config.companyInfo.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
