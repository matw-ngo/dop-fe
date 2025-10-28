"use client";

import React from "react";
import Link from "next/link";
import { CommunityConfig } from "@/configs/homepage-config";

interface CommunityProps {
  config?: CommunityConfig;
  company?: string;
}

export default function Community({ config, company }: CommunityProps) {
  // Default config if none provided
  const defaultConfig: CommunityConfig = {
    id: "community",
    title: "Tham gia cộng đồng Fin Zone",
    description:
      "Kết nối với hàng triệu người dùng, chia sẻ kinh nghiệm và nhận những thông tin mới nhất về các sản phẩm tài chính",
    socialLinks: [
      {
        id: "facebook",
        platform: "facebook",
        href: "https://facebook.com/finzone",
        ariaLabel: "Facebook",
        className: "bg-blue-600 hover:bg-blue-700",
      },
      {
        id: "twitter",
        platform: "twitter",
        href: "https://twitter.com/finzone",
        ariaLabel: "Twitter",
        className: "bg-blue-400 hover:bg-blue-500",
      },
      {
        id: "instagram",
        platform: "instagram",
        href: "https://instagram.com/finzone",
        ariaLabel: "Instagram",
        className: "bg-pink-500 hover:bg-pink-600",
      },
    ],
    background: {
      className: "bg-gray-50",
    },
  };

  const communityConfig = config || defaultConfig;

  const useDynamicTheme = !config?.background?.className;

  // A simple way to map platform to a color, can be expanded.
  const getSocialColor = (platform: string) => {
    switch (platform) {
      case "facebook":
        return "bg-blue-600 hover:bg-blue-700";
      case "twitter":
        return "bg-sky-500 hover:bg-sky-600";
      case "instagram":
        return "bg-pink-500 hover:bg-pink-600";
      default:
        return "bg-primary hover:bg-primary/90";
    }
  };

  const getSocialIcon = (platform: string) => {
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

  return (
    <section
      className={`py-16 md:py-24 ${useDynamicTheme ? "bg-muted/50" : communityConfig.background.className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2
            className={`text-3xl md:text-4xl font-bold mb-4 ${useDynamicTheme ? "text-foreground" : "text-gray-900"}`}
          >
            {communityConfig.title}
          </h2>
          <p
            className={`max-w-2xl mx-auto ${useDynamicTheme ? "text-muted-foreground" : "text-gray-600"}`}
          >
            {communityConfig.description}
          </p>
        </div>

        {/* Social links */}
        <div className="flex justify-center gap-6">
          {communityConfig.socialLinks.map((social) => (
            <Link
              key={social.id}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.ariaLabel || social.platform}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition ${social.className || getSocialColor(social.platform)}`}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                {getSocialIcon(social.platform)}
              </svg>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
