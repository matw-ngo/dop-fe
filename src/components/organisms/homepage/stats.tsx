"use client";

import React from "react";
import Link from "next/link";
import { StatsConfig } from "@/configs/homepage-config";

interface StatsProps {
  config?: StatsConfig;
  company?: string;
}

export default function Stats({ config, company }: StatsProps) {
  // Default config if none provided
  const defaultConfig: StatsConfig = {
    id: "stats",
    stats: [
      {
        id: "partners",
        icon: "🏛️",
        number: "16+",
        label: "đối tác",
        description: "Ngân hàng & Công ty tài chính uy tín",
      },
      {
        id: "customers",
        icon: "👥",
        number: "3.000.000+",
        label: "khách hàng",
        description: "Khách hàng được kết nối",
      },
      {
        id: "applications",
        icon: "📋",
        number: "2.000.000+",
        label: "đơn",
        description: "Khách hàng đăng ký tư vấn",
      },
      {
        id: "loans",
        icon: "📥",
        number: "150.000+",
        label: "khoản vay",
        description: "Khoản vay giới thiệu thành công",
      },
    ],
    communitySection: {
      title: "Nhận ngay thông tin mới nhất về khoản vay của bạn",
      description:
        "Fin Zone cập nhật những thông tin mới nhất về khoản vay, bảo hiểm, thẻ tin dụng, chương trình và nhiều thông tin khác về sản phẩm tài chính",
      buttonText: "Tham gia cộng đồng Fin Zone",
      buttonHref: "/community",
      background: {
        className: "bg-teal-600",
      },
      profiles: [
        {
          id: "profile-1",
          image: "/smiling-woman.png",
          alt: "Community member",
          position: "absolute top-0 right-0",
          size: "w-24 h-24",
        },
        {
          id: "profile-2",
          image: "/man-professional.jpg",
          alt: "Community member",
          position: "absolute bottom-0 left-0",
          size: "w-28 h-28",
        },
        {
          id: "profile-3",
          image: "/man-casual.jpg",
          alt: "Community member",
          position: "absolute bottom-4 right-8",
          size: "w-32 h-32",
        },
      ],
      socialIcons: [
        {
          id: "facebook-icon",
          platform: "facebook",
          position: "absolute top-8 right-32",
          className: "bg-blue-600",
        },
        {
          id: "twitter-icon",
          platform: "twitter",
          position: "absolute bottom-8 left-32",
          className: "bg-blue-400",
        },
        {
          id: "instagram-icon",
          platform: "instagram",
          position: "absolute bottom-16 right-0",
          className: "bg-pink-500",
        },
      ],
    },
  };

  const statsConfig = config || defaultConfig;

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
      default:
        return null;
    }
  };

  const getStatsGridClass = () => {
    const colCount = statsConfig.stats.length;
    if (colCount === 1) return "grid grid-cols-1";
    if (colCount === 2) return "grid grid-cols-1 md:grid-cols-2";
    if (colCount === 3) return "grid grid-cols-1 md:grid-cols-3";
    if (colCount >= 4) return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4";
    return "grid";
  };

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        {statsConfig.title && (
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {statsConfig.title}
            </h2>
          </div>
        )}

        {/* Stats grid */}
        <div className={`${getStatsGridClass()} gap-8 mb-16`}>
          {statsConfig.stats.map((stat) => (
            <div
              key={stat.id}
              className="text-center p-6 rounded-lg bg-card border"
            >
              <div className="text-4xl mb-4">{stat.icon}</div>
              <div className="text-3xl font-bold text-primary mb-2">
                {stat.number}
              </div>
              <div className="text-sm font-semibold text-foreground mb-2">
                {stat.label}
              </div>
              <p className="text-sm text-muted-foreground">
                {stat.description}
              </p>
            </div>
          ))}
        </div>

        {/* Community section */}
        <div
          className={`rounded-2xl p-8 md:p-12 text-primary-foreground ${statsConfig.communitySection.background.className}`}
        >
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {statsConfig.communitySection.title}
              </h2>
              <p className="text-primary-foreground/80 mb-8">
                {statsConfig.communitySection.description}
              </p>
              {statsConfig.communitySection.buttonHref ? (
                <Link
                  href={statsConfig.communitySection.buttonHref}
                  className="inline-block bg-primary-foreground text-primary px-6 py-3 rounded-lg font-semibold hover:bg-primary-foreground/90 transition"
                >
                  {statsConfig.communitySection.buttonText}
                </Link>
              ) : (
                <button className="bg-primary-foreground text-primary px-6 py-3 rounded-lg font-semibold hover:bg-primary-foreground/90 transition">
                  {statsConfig.communitySection.buttonText}
                </button>
              )}
            </div>

            {/* Profile circles */}
            <div className="relative h-64 md:h-80">
              {statsConfig.communitySection.profiles.map((profile) => (
                <div
                  key={profile.id}
                  className={`${profile.position} ${profile.size} rounded-full bg-background overflow-hidden border-4 border-primary/50 shadow-lg`}
                >
                  <img
                    src={profile.image}
                    alt={profile.alt}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}

              {/* Social icons */}
              {statsConfig.communitySection.socialIcons.map((social) => (
                <div
                  key={social.id}
                  className={`${social.position} ${social.className} w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {getSocialIcon(social.platform)}
                  </svg>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
