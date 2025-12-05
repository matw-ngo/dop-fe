/**
 * Example usage of the RelatedProducts component
 * This file demonstrates different ways to use the RelatedProducts component
 */

"use client";

import React, { useState } from "react";
import RelatedProducts from "./RelatedProducts";
import { InsuranceProduct } from "@/types/insurance";
import { INSURANCE_PRODUCTS } from "@/data/insurance-products";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Example 1: Basic Usage
export const BasicExample: React.FC = () => {
  // Select a sample product
  const sampleProduct = INSURANCE_PRODUCTS[0]; // TNDS Bảo Việt

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Basic Usage Example</h2>

      {/* Current Product Display */}
      <Card>
        <CardHeader>
          <CardTitle>Current Product</CardTitle>
        </CardHeader>
        <CardContent>
          <h3 className="font-semibold">{sampleProduct.name}</h3>
          <p className="text-muted-foreground">{sampleProduct.issuer}</p>
          <div className="mt-2">
            <Badge>{sampleProduct.category}</Badge>
            <Badge variant="outline" className="ml-2">
              {sampleProduct.type}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Related Products Component */}
      <RelatedProducts
        currentProduct={sampleProduct}
        maxProducts={4}
      />
    </div>
  );
};

// Example 2: With Custom Title and Callback
export const CustomTitleExample: React.FC = () => {
  const sampleProduct = INSURANCE_PRODUCTS[2]; // Sức khỏe Bảo Việt

  const handleProductClick = (product: InsuranceProduct) => {
    // Handle product click
    console.log("Clicked product:", product.name);
    // You could navigate to product details, open a modal, etc.
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Custom Title & Callback Example</h2>

      <RelatedProducts
        currentProduct={sampleProduct}
        title="Gợi ý sản phẩm tương tự"
        maxProducts={3}
        showViewAll={true}
        viewAllLink="/insurance/health"
        onProductClick={handleProductClick}
        className="border rounded-lg p-4"
      />
    </div>
  );
};

// Example 3: Mobile Optimized
export const MobileOptimizedExample: React.FC = () => {
  const sampleProduct = INSURANCE_PRODUCTS[5]; // Nhân thọ Dai-ichi

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Mobile Optimized Example</h2>

      <div className="md:hidden">
        <p className="text-sm text-muted-foreground mb-4">
          This view shows the carousel/slider for mobile devices
        </p>
      </div>

      <RelatedProducts
        currentProduct={sampleProduct}
        maxProducts={6}
        title="Gợi ý dành cho bạn"
        showViewAll={false}
      />
    </div>
  );
};

// Example 4: Product Details Page Integration
export const ProductDetailsIntegration: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<InsuranceProduct>(
    INSURANCE_PRODUCTS[7] // Bảo hiểm du lịch Bảo Minh
  );

  const handleRelatedProductClick = (product: InsuranceProduct) => {
    setSelectedProduct(product);
    // In a real app, you might navigate to the new product page
    console.log("Navigating to:", product.name);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <h2 className="text-3xl font-bold">Product Details Page Integration</h2>

      {/* Product Details Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {selectedProduct.name}
            <Badge variant="secondary">
              {selectedProduct.category}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{selectedProduct.issuer}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="text-sm text-muted-foreground">Phí bảo hiểm</span>
              <p className="font-semibold">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(selectedProduct.pricing.totalPremium)}
              </p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Mức bảo hiểm</span>
              <p className="font-semibold">
                Up to {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(5000000000)}
              </p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Đánh giá</span>
              <p className="font-semibold">{selectedProduct.rating}/5</p>
            </div>
          </div>

          <Separator />

          <p className="text-sm">
            This is where the full product details would be displayed.
            In a real application, this would include comprehensive information
            about coverage, benefits, claims process, etc.
          </p>
        </CardContent>
      </Card>

      {/* Related Products Section */}
      <RelatedProducts
        currentProduct={selectedProduct}
        title="Bạn cũng có thể quan tâm"
        maxProducts={4}
        onProductClick={handleRelatedProductClick}
      />
    </div>
  );
};

// Example 5: Comparison Page Integration
export const ComparisonPageIntegration: React.FC = () => {
  const productsToCompare = INSURANCE_PRODUCTS.slice(0, 3);

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold">Comparison Page Integration</h2>

      {/* Comparison Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Đang so sánh 3 sản phẩm</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {productsToCompare.map((product) => (
              <div key={product.id} className="text-center p-4 border rounded-lg">
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-sm text-muted-foreground">{product.issuer}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Related Products based on comparison */}
      <RelatedProducts
        currentProduct={productsToCompare[0]} // Use first product as reference
        title="Sản phẩm tương tự để so sánh thêm"
        maxProducts={3}
        viewAllLink="/insurance"
      />
    </div>
  );
};

// Main Example Container
export const Examples: React.FC = () => {
  const [activeExample, setActiveExample] = useState<string>("basic");

  const examples = {
    basic: { component: BasicExample, title: "Basic Usage" },
    custom: { component: CustomTitleExample, title: "Custom Title & Callback" },
    mobile: { component: MobileOptimizedExample, title: "Mobile Optimized" },
    details: { component: ProductDetailsIntegration, title: "Product Details Page" },
    comparison: { component: ComparisonPageIntegration, title: "Comparison Page" },
  };

  const ActiveComponent = examples[activeExample as keyof typeof examples]?.component;

  return (
    <div className="space-y-6">
      {/* Example Selector */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(examples).map(([key, { title }]) => (
          <Button
            key={key}
            variant={activeExample === key ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveExample(key)}
          >
            {title}
          </Button>
        ))}
      </div>

      {/* Active Example */}
      {ActiveComponent && <ActiveComponent />}
    </div>
  );
};

export default Examples;