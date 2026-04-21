"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import ReactPaginate from "react-paginate";
import { useMediaQuery } from "react-responsive";
import { ProductListItem } from "./product-list-item";
import { SelectGroup } from "@/components/ui/select-group";
import { TextInputGroup } from "@/components/ui/text-input-group";
import { useProducts } from "@/hooks/features/product";
import { useTenant } from "@/hooks/tenant";
import { useFormTheme } from "@/components/form-generation/themes";

const ITEMS_PER_PAGE = 10; // Display 10 items per page
const RESPONSIVE_DESKTOP = 769;

// Filter constants matching old-code
const AGE_MIN = 18;
const AGE_MAX = 70;
const INCOME_MIN = 0;
const INCOME_MAX = 200;
const CREDIT_LIMIT_MIN = 0;
const CREDIT_LIMIT_MAX = 2000;

const PRODUCT_CATEGORIES = [
  { id: 0, key: "all" },
  { id: 1, key: "creditCard" },
  { id: 2, key: "insurance" },
  { id: 3, key: "loan" },
];

const SORT_OPTIONS = [
  { key: "default", value: 0 },
  { key: "nameAsc", value: 1 },
  { key: "nameDesc", value: 2 },
];

export const ProductListContent = () => {
  const t = useTranslations("features.products");
  const { theme } = useFormTheme();
  const tenant = useTenant();
  const containerRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const isDesktop = useMediaQuery({
    query: `(min-width: ${RESPONSIVE_DESKTOP}px)`,
  });

  // Fetch all products at once for client-side pagination
  // Using large page size to get all products in one request
  const PAGE_SIZE_FOR_FETCH = 100; // Large enough to get all products
  const { data: productsData, isLoading } = useProducts({
    tenantId: tenant.uuid, // Use actual tenant UUID from context
    pageSize: PAGE_SIZE_FOR_FETCH,
    pageIndex: 0,
  });

  const [category, setCategory] = useState(0);
  const [age, setAge] = useState("");
  const [income, setIncome] = useState("");
  const [creditLimit, setCreditLimit] = useState("");
  const [province, setProvince] = useState("ALL");
  const [sortBy, setSortBy] = useState(0);
  const [itemOffset, setItemOffset] = useState(0);

  // Read category from URL query params
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam) {
      const categoryMap: Record<string, number> = {
        loan: 3,
        creditCard: 1,
        insurance: 2,
      };
      const categoryId = categoryMap[categoryParam];
      if (categoryId) {
        setCategory(categoryId);
      }
    }
  }, [searchParams]);

  const allProducts = productsData?.products || [];
  const totalProducts = productsData?.total || allProducts.length;

  const filteredProducts = useMemo(() => {
    let filtered = [...allProducts];

    if (category > 0) {
      // Handle both legacy format (credit_card) and new format (PRODUCT_TYPE_CREDIT_CARD)
      const typeMap: Record<number, string[]> = {
        1: ["credit_card", "PRODUCT_TYPE_CREDIT_CARD"],
        2: ["insurance", "PRODUCT_TYPE_INSURANCE"],
        3: ["loan", "PRODUCT_TYPE_LOAN", "PRODUCT_TYPE_CASH_LOAN"],
      };
      const productTypes = typeMap[category];
      if (productTypes) {
        filtered = filtered.filter((p) =>
          productTypes.includes(p.product_type || ""),
        );
      }
    }

    if (sortBy === 1) {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 2) {
      filtered.sort((a, b) => b.name.localeCompare(a.name));
    }

    return filtered;
  }, [allProducts, category, sortBy]);

  const endOffset = useMemo(() => itemOffset + ITEMS_PER_PAGE, [itemOffset]);
  const currentProducts = useMemo(
    () => filteredProducts.slice(itemOffset, endOffset),
    [filteredProducts, itemOffset, endOffset],
  );
  // Use total from API for accurate pagination
  const pageCount = useMemo(
    () => Math.ceil(totalProducts / ITEMS_PER_PAGE),
    [totalProducts],
  );

  const handleCategoryChange = (value: string) => {
    setCategory(parseInt(value));
    setItemOffset(0);
  };

  const handleProvinceChange = (value: string) => {
    setProvince(value);
    setItemOffset(0);
  };

  const handleSortChange = (value: string) => {
    setSortBy(parseInt(value));
    setItemOffset(0);
  };

  const handleAgeChange = (value: string) => {
    const val = parseInt(value);
    if (Number.isNaN(val)) {
      setAge("");
    } else if (val <= AGE_MAX) {
      setAge(val.toString());
    }
  };

  const handleAgeBlur = (value: string) => {
    if (value === "") {
      setItemOffset(0);
      return;
    }
    const ageVal = parseInt(value);
    if (ageVal >= AGE_MIN && ageVal <= AGE_MAX) {
      setItemOffset(0);
    }
  };

  const handleIncomeChange = (value: string) => {
    const val = parseInt(value);
    if (Number.isNaN(val)) {
      setIncome("");
    } else if (val <= INCOME_MAX) {
      setIncome(val.toString());
    }
  };

  const handleIncomeBlur = (value: string) => {
    if (value === "") {
      setItemOffset(0);
      return;
    }
    const incomeVal = parseInt(value);
    if (incomeVal >= INCOME_MIN && incomeVal <= INCOME_MAX) {
      setItemOffset(0);
    }
  };

  const handleCreditLimitChange = (value: string) => {
    const val = parseInt(value);
    if (Number.isNaN(val)) {
      setCreditLimit("");
    } else if (val <= CREDIT_LIMIT_MAX) {
      setCreditLimit(val.toString());
    }
  };

  const handleCreditLimitBlur = (value: string) => {
    if (value === "") {
      setItemOffset(0);
      return;
    }
    const clVal = parseInt(value);
    if (clVal >= CREDIT_LIMIT_MIN && clVal <= CREDIT_LIMIT_MAX) {
      setItemOffset(0);
    }
  };

  const handleResetFilter = () => {
    setCategory(0);
    setAge("");
    setIncome("");
    setCreditLimit("");
    setProvince("ALL");
    setSortBy(0);
    setItemOffset(0);
  };

  const hasFilterChanged = () =>
    category !== 0 ||
    age !== "" ||
    income !== "" ||
    creditLimit !== "" ||
    province !== "ALL";

  const handlePageClick = (event: any) => {
    containerRef.current?.scrollIntoView({ behavior: "smooth" });
    const newOffset =
      (event.selected * ITEMS_PER_PAGE) % filteredProducts.length;
    setItemOffset(newOffset);
  };

  const provinces = [
    { label: t("filters.allProvinces"), value: "ALL" },
    { label: "Hà Nội", value: "HN" },
    { label: "TP. Hồ Chí Minh", value: "HCM" },
    { label: "Đà Nẵng", value: "DN" },
  ];

  if (isLoading) {
    return (
      <div className="py-8">
        <div
          className="text-center"
          style={{ color: theme.colors.textSecondary }}
        >
          {t("loading")}
        </div>
      </div>
    );
  }

  return (
    <div className="py-6" ref={containerRef}>
      {/* Category Filter - Use generic tokens */}
      <div className="flex flex-wrap gap-2 mb-10">
        {PRODUCT_CATEGORIES.map((item) => (
          <div key={`cat_${item.id}`}>
            <input
              type="radio"
              id={`radio_${item.id}`}
              name="category"
              value={item.id}
              checked={item.id === category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="opacity-0 fixed w-0 peer"
            />
            <label
              htmlFor={`radio_${item.id}`}
              className="inline-block cursor-pointer hover:bg-gray-200 peer-checked:text-white transition-colors border"
              style={{
                padding: `${theme.spacing.md} ${theme.spacing.base}`,
                fontSize: theme.typography.fontSizes.base,
                fontWeight: theme.typography.fontWeights.normal,
                lineHeight: theme.typography.lineHeights.normal,
                borderRadius: theme.borderRadius.md,
                borderColor: theme.colors.containerBorder,
                color: item.id === category ? "#fff" : theme.colors.primary,
                backgroundColor:
                  item.id === category ? theme.colors.primary : "white",
              }}
            >
              {t(`categories.${item.key}`)}
            </label>
          </div>
        ))}
      </div>

      {/* Heading and Reset */}
      <div className="flex justify-between items-center mb-6">
        <h2
          className="font-bold"
          style={{
            fontSize: theme.typography.fontSizes["3xl"],
            lineHeight: theme.typography.lineHeights.xl,
            color: theme.colors.headingText || theme.colors.textPrimary,
          }}
        >
          {t("listTitle")}
        </h2>
        {hasFilterChanged() && (
          <button
            onClick={handleResetFilter}
            className="hover:underline text-base leading-5"
            style={{ color: theme.colors.primary }}
          >
            {t("filters.reset")}
          </button>
        )}
      </div>

      {/* Filter Bar - Match old-code exactly */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <TextInputGroup
          type="number"
          label={t("filters.age")}
          title={t("filters.ageTitle", { min: AGE_MIN, max: AGE_MAX })}
          min={AGE_MIN}
          max={AGE_MAX}
          step={1}
          value={age}
          placeholder={t("filters.agePlaceholder")}
          onChange={handleAgeChange}
          onBlur={handleAgeBlur}
        />
        <TextInputGroup
          type="number"
          label={t("filters.income")}
          title={t("filters.incomeTitle", { min: INCOME_MIN, max: INCOME_MAX })}
          min={INCOME_MIN}
          max={INCOME_MAX}
          step={1}
          value={income}
          placeholder={t("filters.incomePlaceholder")}
          onChange={handleIncomeChange}
          onBlur={handleIncomeBlur}
          append={t("filters.incomeSuffix")}
        />
        <TextInputGroup
          type="number"
          label={t("filters.creditLimit")}
          title={t("filters.creditLimitTitle", {
            min: CREDIT_LIMIT_MIN,
            max: CREDIT_LIMIT_MAX,
          })}
          min={CREDIT_LIMIT_MIN}
          max={CREDIT_LIMIT_MAX}
          step={1}
          value={creditLimit}
          placeholder={t("filters.creditLimitPlaceholder")}
          onChange={handleCreditLimitChange}
          onBlur={handleCreditLimitBlur}
          append={t("filters.creditLimitSuffix")}
        />
        <SelectGroup
          label={t("filters.province")}
          options={provinces}
          value={province}
          onChange={handleProvinceChange}
        />
        <SelectGroup
          label={t("filters.sortBy")}
          options={SORT_OPTIONS.map((opt) => ({
            label: t(`filters.sort.${opt.key}`),
            value: opt.value,
          }))}
          value={sortBy}
          onChange={(value) => handleSortChange(value)}
        />
      </div>

      {/* Products Grid */}
      {currentProducts.length > 0 ? (
        <>
          <div className="space-y-6">
            {currentProducts.map((product, i) => (
              <ProductListItem key={`product_${i}`} product={product} />
            ))}
          </div>

          {/* Pagination - Theme-aware styling */}
          {pageCount > 1 && (
            <div
              className="flex justify-center items-center gap-2 mt-8"
              style={{ listStyle: "none" }}
            >
              <ReactPaginate
                breakLabel="..."
                nextLabel=">"
                onClick={handlePageClick}
                pageRangeDisplayed={isDesktop ? 4 : 1}
                marginPagesDisplayed={1}
                pageCount={pageCount}
                previousLabel="<"
                renderOnZeroPageCount={null}
                containerClassName="flex justify-center items-center gap-2 list-none"
                pageLinkClassName="flex items-center justify-center min-w-[44px] h-[44px] px-4 py-2 border border-[#bfd1cc] rounded-lg bg-white text-[#1a5945] text-base font-normal leading-6 no-underline cursor-pointer transition-all duration-200 hover:bg-[#f2f8f6]"
                previousLinkClassName="flex items-center justify-center min-w-[44px] h-[44px] px-4 py-2 border border-[#bfd1cc] rounded-lg bg-white text-[#1a5945] text-base font-normal leading-6 no-underline cursor-pointer transition-all duration-200 hover:bg-[#f2f8f6]"
                nextLinkClassName="flex items-center justify-center min-w-[44px] h-[44px] px-4 py-2 border border-[#bfd1cc] rounded-lg bg-white text-[#1a5945] text-base font-normal leading-6 no-underline cursor-pointer transition-all duration-200 hover:bg-[#f2f8f6]"
                disabledClassName="opacity-50 cursor-not-allowed pointer-events-none"
                activeClassName="[&>a]:bg-[#1a5945] [&>a]:text-white [&>a]:border-[#1a5945] !important"
                breakLinkClassName="flex items-center justify-center min-w-[44px] h-[44px] px-4 py-2 border border-[#bfd1cc] rounded-lg bg-white text-[#1a5945] text-base font-normal leading-6 no-underline cursor-pointer"
              />
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p style={{ color: theme.colors.textSecondary }}>
            {t("noResults")}{" "}
            <button
              onClick={handleResetFilter}
              className="hover:underline"
              style={{ color: theme.colors.primary }}
            >
              {t("filters.resetLink")}
            </button>
          </p>
        </div>
      )}
    </div>
  );
};
