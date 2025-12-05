"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import ComparisonSuggestions from "./ComparisonSuggestions";
import { INSURANCE_PRODUCTS } from "@/data/insurance-products";
import type { InsuranceProduct } from "@/types/insurance";

/**
 * Example component demonstrating the ComparisonSuggestions component
 * with different scenarios and use cases.
 */
const ComparisonSuggestionsExample: React.FC = () => {
  const t = useTranslations("pages.insurance");
  const [selectedProducts, setSelectedProducts] = useState<InsuranceProduct[]>([
    INSURANCE_PRODUCTS[0], // Start with one product
  ]);
  const [scenario, setScenario] = useState<
    "default" | "single" | "multiple" | "empty"
  >("default");

  // Handle adding products to comparison
  const handleAddToComparison = (productId: string) => {
    const productToAdd = INSURANCE_PRODUCTS.find((p) => p.id === productId);
    if (productToAdd && !selectedProducts.find((p) => p.id === productId)) {
      setSelectedProducts([...selectedProducts, productToAdd]);
    }
  };

  // Remove product from comparison
  const handleRemoveFromComparison = (productId: string) => {
    setSelectedProducts(selectedProducts.filter((p) => p.id !== productId));
  };

  // Change scenario
  const changeScenario = (newScenario: typeof scenario) => {
    setScenario(newScenario);
    switch (newScenario) {
      case "single":
        setSelectedProducts([INSURANCE_PRODUCTS[0]]);
        break;
      case "multiple":
        setSelectedProducts([INSURANCE_PRODUCTS[0], INSURANCE_PRODUCTS[1]]);
        break;
      case "empty":
        setSelectedProducts([]);
        break;
      default:
        setSelectedProducts([INSURANCE_PRODUCTS[0]]);
    }
  };

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">ComparisonSuggestions Examples</h1>
        <p className="text-muted-foreground">
          Demonstrating different use cases of the ComparisonSuggestions component
        </p>
      </div>

      {/* Scenario Selector */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => changeScenario("default")}
          className={`px-4 py-2 rounded-md transition-colors ${
            scenario === "default"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          Default (1 product)
        </button>
        <button
          onClick={() => changeScenario("single")}
          className={`px-4 py-2 rounded-md transition-colors ${
            scenario === "single"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          Single Product
        </button>
        <button
          onClick={() => changeScenario("multiple")}
          className={`px-4 py-2 rounded-md transition-colors ${
            scenario === "multiple"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          Multiple Products
        </button>
        <button
          onClick={() => changeScenario("empty")}
          className={`px-4 py-2 rounded-md transition-colors ${
            scenario === "empty"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          Empty State
        </button>
      </div>

      {/* Current Products Display */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          Current Comparison ({selectedProducts.length}/6)
        </h2>
        {selectedProducts.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {selectedProducts.map((product) => (
              <div
                key={product.id}
                className="p-4 border rounded-lg bg-card space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {product.issuer}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveFromComparison(product.id)}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
                <div className="text-sm">
                  <p>Premium: {product.pricing.totalPremium.toLocaleString()} VND</p>
                  <p>Category: {product.category}</p>
                  <p>Rating: {product.rating}/5</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">
              No products selected for comparison
            </p>
          </div>
        )}
      </div>

      {/* Comparison Suggestions */}
      <ComparisonSuggestions
        currentProducts={selectedProducts}
        onAddToComparison={handleAddToComparison}
        maxSuggestions={6}
        title={
          scenario === "empty"
            ? "Start by selecting products to compare"
            : undefined
        }
        className="bg-background"
      />

      {/* Usage Information */}
      <div className="space-y-4 p-6 bg-muted/50 rounded-lg">
        <h2 className="text-xl font-semibold">Usage Notes</h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Suggestions are based on category, issuer, coverage, and premium similarity</li>
          <li>• Recommended and popular products get higher scores</li>
          <li>• Products already in comparison are filtered out</li>
          <li>• Component adapts between grid (desktop) and carousel (mobile) layouts</li>
          <li>• Loading state is shown with skeleton cards</li>
          <li>• Empty state appears when no more suggestions are available</li>
        </ul>
      </div>

      {/* Component Props Reference */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Component Props</h2>
        <div className="bg-card p-4 rounded-lg space-y-3 text-sm">
          <div>
            <code className="font-mono bg-muted px-2 py-1 rounded">
              currentProducts: InsuranceProduct[]
            </code>
            <p className="mt-1 text-muted-foreground">
              Array of currently selected products for comparison
            </p>
          </div>
          <div>
            <code className="font-mono bg-muted px-2 py-1 rounded">
              maxSuggestions?: number
            </code>
            <p className="mt-1 text-muted-foreground">
              Maximum number of suggestions to show (default: 6)
            </p>
          </div>
          <div>
            <code className="font-mono bg-muted px-2 py-1 rounded">
              onAddToComparison: (productId: string) => void
            </code>
            <p className="mt-1 text-muted-foreground">
              Callback function when user clicks "Add to comparison"
            </p>
          </div>
          <div>
            <code className="font-mono bg-muted px-2 py-1 rounded">
              title?: string
            </code>
            <p className="mt-1 text-muted-foreground">
              Custom title for the suggestions section
            </p>
          </div>
          <div>
            <code className="font-mono bg-muted px-2 py-1 rounded">
              className?: string
            </code>
            <p className="mt-1 text-muted-foreground">
              Additional CSS classes for the container
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonSuggestionsExample;