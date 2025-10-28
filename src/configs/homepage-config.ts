export interface HeroConfig {
  id: string;
  decorativeIcons: string[];
  heading: string;
  subheading: {
    text: string;
    highlights: Array<{
      text: string;
      className?: string;
    }>;
  };
  background: {
    className: string;
  };
}

export interface StatItem {
  id: string;
  icon: string;
  number: string;
  label: string;
  description: string;
}

export interface StatsConfig {
  id: string;
  title?: string;
  stats: StatItem[];
  communitySection: {
    title: string;
    description: string;
    buttonText: string;
    buttonHref?: string;
    background: {
      className: string;
    };
    profiles: Array<{
      id: string;
      image: string;
      alt: string;
      position: string; // CSS classes for positioning
      size: string; // CSS classes for size
    }>;
    socialIcons: Array<{
      id: string;
      platform: "facebook" | "twitter" | "instagram" | "youtube" | "linkedin";
      position: string; // CSS classes for positioning
      className: string;
    }>;
  };
}

export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  image: string;
  imageAlt?: string;
}

export interface FeaturesConfig {
  id: string;
  title?: string;
  subtitle?: string;
  features: FeatureItem[];
  layout: "grid" | "list";
  background: {
    className: string;
  };
}

export interface BlogPost {
  id: string;
  title: string;
  description: string;
  image: string;
  imageAlt?: string;
  href?: string;
  target?: "_blank" | "_self";
}

export interface BlogConfig {
  id: string;
  title: string;
  subtitle?: string;
  posts: BlogPost[];
  viewAllText: string;
  viewAllHref?: string;
  background: {
    className: string;
  };
}

export interface CommunityConfig {
  id: string;
  title: string;
  description: string;
  socialLinks: Array<{
    id: string;
    platform:
      | "facebook"
      | "twitter"
      | "instagram"
      | "youtube"
      | "linkedin"
      | "tiktok";
    href: string;
    ariaLabel?: string;
    className: string;
  }>;
  background: {
    className: string;
  };
}

export interface HomepageConfig {
  company: string;
  hero: HeroConfig;
  stats: StatsConfig;
  features: FeaturesConfig;
  blog: BlogConfig;
  community: CommunityConfig;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
  };
}

// Default Fin Zone configuration
export const finZoneHomepageConfig: HomepageConfig = {
  company: "finzone",
  hero: {
    id: "hero",
    decorativeIcons: ["📋", "💰"],
    heading: "Dễ dàng lựa chọn sản phẩm tài chính cùng Fin Zone",
    subheading: {
      text: "Fin Zone cung cấp thông tin, so sánh và đánh giá",
      highlights: [
        {
          text: "ĐA DẠNG CÁC LỰA CHỌN",
          className: "font-bold text-gray-900",
        },
        {
          text: "về khoản vay tin chấp, thẻ tin dụng và bảo hiểm của",
        },
        {
          text: "MUÔN VÀN UU ĐÃI",
          className: "font-bold text-gray-900",
        },
        {
          text: "giúp bạn tiếp cận các dịch vụ tài chính một cách nhanh chóng và dễ dàng.",
        },
      ],
    },
    background: {
      className: "bg-gradient-to-b from-teal-50 to-white",
    },
  },
  stats: {
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
  },
  features: {
    id: "features",
    features: [
      {
        id: "fast-approval",
        title: "Duyệt vay nhanh chóng cần CCCD",
        description:
          "Với công nghệ AI tiên tiến, bạn có thể tìm kiếm và duyệt khoản vay nhanh chóng để đăng ký trong vòng vài phút.",
        image: "/man-with-documents.jpg",
        imageAlt: "Fast loan approval",
      },
      {
        id: "credit-card-comparison",
        title: "So sánh & tìm kiếm thẻ tín dụng để đăng",
        description:
          "Chúng tôi hợp tác với các Ngân hàng và Tổ chức tín dụng uy tín trên thị trường để cung cấp sản phẩm thẻ tín dụng với nhiều lựa chọn phù hợp.",
        image: "/man-with-credit-cards.jpg",
        imageAlt: "Credit card comparison",
      },
      {
        id: "attractive-offers",
        title: "Ưu đãi, chính sách sản phẩm hấp dẫn",
        description:
          "Fin Zone liên kết cùng với các Ngân hàng & Tổ chức để đưa ra các sản phẩm tài chính có chính sách lãi suất đặc biệt, cùng rất nhiều ưu đãi hấp dẫn.",
        image: "/woman-excited.jpg",
        imageAlt: "Attractive financial offers",
      },
    ],
    layout: "grid",
    background: {
      className: "bg-gray-50",
    },
  },
  blog: {
    id: "blog",
    title: "Blog",
    subtitle: "Cập nhật những tin tức hữu ích từ Fin Zone",
    posts: [
      {
        id: "post-1",
        title: "4 bước đăng ký ngay khoản vay trên Fin Zone",
        description:
          "Fin Zone mang đến giải pháp vay nhanh chóng, tiền lợi ngay trên điện thoại của bạn. Chi vào vài thao tác đơn...",
        image: "/texas-map-illustration.jpg",
        imageAlt: "Loan registration guide",
        href: "/blog/4-buoc-dang-ky-khoan-vay",
      },
      {
        id: "post-2",
        title: "4 bước đơn giản số hữu thế tín dụng ưu đãi",
        description:
          "Khám phá Finzone.vn – nền tảng chính số bảo gồm chức năng tìm kiếm và so sánh thẻ tín dụng ưu việt. Chi và...",
        image: "/smart-home-illustration.jpg",
        imageAlt: "Credit card benefits",
        href: "/blog/the-tin-dung-uu-dai",
      },
      {
        id: "post-3",
        title: "4 lý do bị từ chối đăng ký vay trên Fin Zone",
        description:
          "Gặp trở ngại khi đăng ký vay trên Fin Zone? Dùng lo lắng, hãy tham khảo bài viết này để giải quyết ngay. Chúng...",
        image: "/map-location-illustration.jpg",
        imageAlt: "Loan rejection reasons",
        href: "/blog/ly-do-bi-tu-choi-vay",
      },
    ],
    viewAllText: "Xem tất cả →",
    viewAllHref: "/blog",
    background: {
      className: "bg-white",
    },
  },
  community: {
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
  },
  theme: {
    primaryColor: "#0f766e", // teal-700
    secondaryColor: "#14b8a6", // teal-500
    accentColor: "#f0fdfa", // teal-50
    backgroundColor: "#ffffff",
    textColor: "#111827", // gray-900
  },
};

// Example configuration for another company
export const exampleCompanyHomepageConfig: HomepageConfig = {
  company: "example-corp",
  hero: {
    id: "hero",
    decorativeIcons: ["🚀", "💼"],
    heading: "Transform Your Business with Innovation",
    subheading: {
      text: "We provide cutting-edge solutions for",
      highlights: [
        {
          text: "MODERN ENTERPRISES",
          className: "font-bold text-blue-900",
        },
        {
          text: "helping you achieve",
        },
        {
          text: "DIGITAL TRANSFORMATION",
          className: "font-bold text-blue-900",
        },
        {
          text: "and business growth.",
        },
      ],
    },
    background: {
      className: "bg-gradient-to-b from-blue-50 to-white",
    },
  },
  stats: {
    id: "stats",
    stats: [
      {
        id: "clients",
        icon: "🏢",
        number: "500+",
        label: "clients",
        description: "Enterprise clients worldwide",
      },
      {
        id: "projects",
        icon: "🎯",
        number: "1,000+",
        label: "projects",
        description: "Successful implementations",
      },
      {
        id: "countries",
        icon: "🌍",
        number: "25+",
        label: "countries",
        description: "Global presence",
      },
      {
        id: "years",
        icon: "⭐",
        number: "10+",
        label: "years",
        description: "Years of excellence",
      },
    ],
    communitySection: {
      title: "Join Our Innovation Network",
      description:
        "Connect with industry leaders, share insights, and stay updated with the latest technology trends and business solutions.",
      buttonText: "Join Our Community",
      buttonHref: "/community",
      background: {
        className: "bg-blue-600",
      },
      profiles: [
        {
          id: "profile-1",
          image: "/placeholder-user.jpg",
          alt: "Community member",
          position: "absolute top-0 right-0",
          size: "w-24 h-24",
        },
        {
          id: "profile-2",
          image: "/placeholder-user.jpg",
          alt: "Community member",
          position: "absolute bottom-0 left-0",
          size: "w-28 h-28",
        },
      ],
      socialIcons: [
        {
          id: "linkedin-icon",
          platform: "linkedin",
          position: "absolute top-8 right-32",
          className: "bg-blue-700",
        },
        {
          id: "twitter-icon",
          platform: "twitter",
          position: "absolute bottom-8 left-32",
          className: "bg-blue-400",
        },
      ],
    },
  },
  features: {
    id: "features",
    features: [
      {
        id: "consulting",
        title: "Strategic Consulting",
        description:
          "Expert guidance to transform your business strategy and optimize operations for maximum efficiency and growth.",
        image: "/placeholder.jpg",
        imageAlt: "Strategic consulting",
      },
      {
        id: "development",
        title: "Custom Development",
        description:
          "Tailored software solutions built with cutting-edge technology to meet your specific business requirements.",
        image: "/placeholder.jpg",
        imageAlt: "Custom development",
      },
      {
        id: "support",
        title: "24/7 Support",
        description:
          "Round-the-clock technical support and maintenance to ensure your systems run smoothly at all times.",
        image: "/placeholder.jpg",
        imageAlt: "24/7 support",
      },
    ],
    layout: "grid",
    background: {
      className: "bg-gray-50",
    },
  },
  blog: {
    id: "blog",
    title: "Insights & News",
    subtitle: "Stay updated with the latest industry trends and insights",
    posts: [
      {
        id: "post-1",
        title: "Digital Transformation Trends in 2024",
        description:
          "Explore the latest trends shaping digital transformation across industries and how to leverage them for business growth.",
        image: "/placeholder.jpg",
        imageAlt: "Digital transformation trends",
        href: "/blog/digital-transformation-2024",
      },
      {
        id: "post-2",
        title: "Building Scalable Cloud Infrastructure",
        description:
          "Learn best practices for designing and implementing cloud infrastructure that scales with your business needs.",
        image: "/placeholder.jpg",
        imageAlt: "Cloud infrastructure",
        href: "/blog/scalable-cloud-infrastructure",
      },
    ],
    viewAllText: "View All →",
    viewAllHref: "/blog",
    background: {
      className: "bg-white",
    },
  },
  community: {
    id: "community",
    title: "Join Our Professional Network",
    description:
      "Connect with industry professionals, share knowledge, and collaborate on innovative solutions.",
    socialLinks: [
      {
        id: "linkedin",
        platform: "linkedin",
        href: "https://linkedin.com/company/example-corp",
        ariaLabel: "LinkedIn",
        className: "bg-blue-700 hover:bg-blue-800",
      },
      {
        id: "twitter",
        platform: "twitter",
        href: "https://twitter.com/example_corp",
        ariaLabel: "Twitter",
        className: "bg-blue-400 hover:bg-blue-500",
      },
    ],
    background: {
      className: "bg-gray-50",
    },
  },
  theme: {
    primaryColor: "#1e40af", // blue-800
    secondaryColor: "#3b82f6", // blue-500
    accentColor: "#eff6ff", // blue-50
    backgroundColor: "#ffffff",
    textColor: "#111827", // gray-900
  },
};

// Configuration registry
export const homepageConfigs = {
  finzone: finZoneHomepageConfig,
  "example-corp": exampleCompanyHomepageConfig,
};

// Function to get configuration - uses static config by default
export function getHomepageConfig(company?: string): HomepageConfig {
  const configKey = company || "finzone";

  if (configKey in homepageConfigs) {
    return homepageConfigs[configKey as keyof typeof homepageConfigs];
  }

  // Default fallback
  return finZoneHomepageConfig;
}

// Function to fetch configuration from server using your API client pattern
// This would be implemented when server-side config is needed
export async function fetchHomepageConfigFromServer(
  company: string,
): Promise<HomepageConfig> {
  try {
    // This would use your apiClient from @/lib/api/client
    // Example implementation:
    // const { data, error } = await apiClient.GET("/homepage-config/{company}", {
    //   params: { path: { company } }
    // });
    //
    // if (error) {
    //   throw new Error(`API request failed: ${error.message}`);
    // }
    //
    // return data;

    // For now, throw error to force fallback to static config
    throw new Error("Server-side config not implemented yet");
  } catch (error) {
    console.warn(
      "Failed to fetch homepage config from server, using static config",
      error,
    );
    // Fallback to static config
    return getHomepageConfig(company);
  }
}
