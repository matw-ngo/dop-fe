import type { NextConfig } from "next";
import withNextIntl from "next-intl/plugin";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  // Enable static export for deployment
  output: "export",
  // Ensure proper trailing slashes for static hosting
  trailingSlash: true,
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
  // Configure asset prefix for static hosting if needed
  // assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
  // Skip build-time generation for dynamic routes
  // This allows on-demand generation for dynamic routes
  generateBuildId: async () => "build",
  // Note: API routes won't work with static export
  // Consider moving API logic to client-side or using a separate backend
};

const withNextIntlConfig = withNextIntl("./src/i18n/request.ts");

export default withNextIntlConfig(nextConfig);
