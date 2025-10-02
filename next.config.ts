import type { NextConfig } from "next";
import withNextIntl from 'next-intl/plugin';

const nextConfig: NextConfig = {
  output: 'export',
  turbopack: {
    root: process.cwd(),
  },
  /* config options here */
};

const withNextIntlConfig = withNextIntl('./src/i18n/request.ts');

export default withNextIntlConfig(nextConfig);
