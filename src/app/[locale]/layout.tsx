import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Lexend_Deca } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";

import "../globals.css";

import { MSWProvider } from "@/components/dev/MSWProvider";
import { MSWToolbar } from "@/components/dev/MSWToolbar";
import Providers from "@/components/layout/providers";

export function generateStaticParams() {
  return [{ locale: "vi" }, { locale: "en" }];
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const lexendDeca = Lexend_Deca({
  variable: "--font-lexend-deca",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Fin Zone - Nền tảng tài chính số",
  description:
    "Nền tảng tài chính số toàn diện - Vay vốn, thẻ tín dụng, bảo hiểm và các sản phẩm tài chính khác",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { loadAllTranslations } = await import("@/lib/i18n/split-loader");
  const messages = await loadAllTranslations(locale);
  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${lexendDeca.variable} antialiased`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            {/* MSW Provider - ensures worker is ready before rendering children in development */}
            <MSWProvider>
              {children}
              {/* MSW Development Toolbar */}
              <MSWToolbar />
            </MSWProvider>
            {/* <div className="fixed bottom-5 left-5 z-50">
              <ThemeSelector />
            </div>
            <div className="fixed bottom-5 right-5 z-50">
              <LanguageSwitcher />
            </div> */}
          </Providers>
        </NextIntlClientProvider>
        {/* <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.7.4/lottie.min.js"
          strategy="beforeInteractive"
        /> */}
        {/* <Script
          id="oval_custom"
          src="/lib/VNPTBrowserSDKAppV4.0.0.js"
          strategy="beforeInteractive"
        />
        <Script
          src="/lib/VNPTQRBrowserApp.js"
          strategy="beforeInteractive"
        />
        <Script src="/lib/VNPTQRUpload.js" strategy="beforeInteractive" /> */}
        <Analytics />
      </body>
    </html>
  );
}
