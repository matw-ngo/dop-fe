import { TenantThemeProvider } from "@/components/layout/TenantThemeProvider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HeroBanner } from "@/components/home/HeroBanner";
import { ProductTabs } from "@/components/home/ProductTabs";
import { LoanProductPanel } from "@/components/home/LoanProductPanel";
import { IntroductionSection } from "@/components/home/IntroductionSection";
import { StatsSection } from "@/components/home/StatsSection";

/**
 * Home Page
 *
 * Main landing page assembled from theme-aware components
 * Refactored for multi-tenancy and i18n
 */
export default function Home() {
  return (
    <TenantThemeProvider>
      <Header />
      <main className="min-h-screen pt-[60px] md:pt-[72px]">
        {/* Hero Banner */}
        <HeroBanner />

        {/* Product Tabs Section */}
        <ProductTabs defaultTab={0}>
          {/* Loan Tab */}
          <LoanProductPanel />

          {/* Credit Card Tab - Placeholder */}
          <div className="p-8 text-center text-gray-500">
            <h3 className="text-2xl font-bold mb-4">Thẻ tín dụng</h3>
            <p>Nội dung đang được cập nhật...</p>
          </div>

          {/* Insurance Tab - Placeholder */}
          <div className="p-8 text-center text-gray-500">
            <h3 className="text-2xl font-bold mb-4">Bảo hiểm</h3>
            <p>Nội dung đang được cập nhật...</p>
          </div>

          {/* Securities Tab - Disabled */}
          <div className="p-8 text-center text-gray-500">
            <h3 className="text-2xl font-bold mb-4">Chứng khoán</h3>
            <p>Coming soon</p>
          </div>
        </ProductTabs>

        {/* Introduction Section */}
        <IntroductionSection />

        {/* Stats Section */}
        <StatsSection />
      </main>
      <Footer />
    </TenantThemeProvider>
  );
}
