"use client";

import React from "react";
import { ProductListBanner } from "./product-list-banner";
import { ProductListContent } from "./product-list-content";
import { ProductListTutorial } from "./product-list-tutorial";
import { ProductListFooter } from "./product-list-footer";
import { ProductComparingPanel } from "../comparing-panel";

export function ProductList() {
  return (
    <>
      <ProductListBanner />
      <div className="container mx-auto px-4">
        <ProductListContent />
        <ProductListTutorial />
        <ProductListFooter />
      </div>
      <ProductComparingPanel />
    </>
  );
}
