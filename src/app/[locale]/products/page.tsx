"use client";

import React from "react";
import { ProductList } from "@/components/features/product/list";
import { Header } from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { TenantThemeProvider } from "@/components/layout/TenantThemeProvider";

export default function ProductsPage() {
  return (
    <TenantThemeProvider>
      <Header />
      <main className="min-h-screen pt-[60px] md:pt-[72px]">
        <ProductList />
      </main>
      <Footer />
    </TenantThemeProvider>
  );
}
