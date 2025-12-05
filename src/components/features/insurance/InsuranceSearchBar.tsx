"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

// Type declaration for gtag
declare global {
  interface Window {
    gtag?: (
      command: string,
      event: string,
      options?: Record<string, any>,
    ) => void;
  }
}
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Search,
  Clock,
  TrendingUp,
  Shield,
  Heart,
  Car,
  Plane,
  Home,
} from "lucide-react";
import { INSURANCE_PRODUCTS } from "@/data/insurance-products";
import {
  INSURANCE_CATEGORIES,
  SEARCH_SUGGESTIONS,
  ANALYTICS_EVENTS,
} from "@/constants/insurance";
import { InsuranceCategory } from "@/types/insurance";

export interface InsuranceSearchBarProps {
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  className?: string;
  showRecentSearches?: boolean;
  showSuggestions?: boolean;
  debounceMs?: number;
  suggestions?: string[];
  recentSearches?: string[];
  loading?: boolean;
}

interface SearchSuggestion {
  id: string;
  type: "product" | "category" | "feature" | "popular";
  title: string;
  subtitle?: string;
  keywords: string[];
  icon?: React.ReactNode;
}

const InsuranceSearchBar: React.FC<InsuranceSearchBarProps> = ({
  value = "",
  onChange,
  onSearch,
  placeholder,
  className,
  showRecentSearches = true,
  showSuggestions = true,
  debounceMs = 300,
  suggestions: externalSuggestions,
  recentSearches: externalRecentSearches,
  loading: externalLoading,
}) => {
  const t = useTranslations("pages.insurance");
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [internalRecentSearches, setInternalRecentSearches] = useState<
    string[]
  >([]);
  const [internalSuggestions, setInternalSuggestions] = useState<
    SearchSuggestion[]
  >([]);
  const [internalLoading, setInternalLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Use external values if provided, otherwise use internal state
  const recentSearches = externalRecentSearches || internalRecentSearches;
  const loading =
    externalLoading !== undefined ? externalLoading : internalLoading;

  // Category icons with fallback
  const categoryIcons: Record<string, React.ReactNode> = {
    [InsuranceCategory.VEHICLE]: <Car className="h-4 w-4" />,
    [InsuranceCategory.HEALTH]: <Heart className="h-4 w-4" />,
    [InsuranceCategory.LIFE]: <Shield className="h-4 w-4" />,
    [InsuranceCategory.TRAVEL]: <Plane className="h-4 w-4" />,
    [InsuranceCategory.PROPERTY]: <Home className="h-4 w-4" />,
  };

  // Fallback icon for unknown categories
  const getDefaultIcon = (): React.ReactNode => {
    return <Shield className="h-4 w-4 text-gray-500" />;
  };

  // Predefined search suggestions
  const predefinedSuggestions: SearchSuggestion[] = [
    {
      id: "tnds-bat-buoc",
      type: "feature",
      title: "Bảo hiểm TNDS bắt buộc",
      subtitle: "Trách nhiệm dân sự bắt buộc cho xe cơ giới",
      keywords: ["tnds", "bắt buộc", "trách nhiệm dân sự", "xe máy", "ô tô"],
      icon: <Shield className="h-4 w-4 text-red-500" />,
    },
    {
      id: "vat-chat-xe",
      type: "feature",
      title: "Bảo hiểm vật chất xe",
      subtitle: "Bảo hiểm cho tổn thất xe cơ giới",
      keywords: ["vật chất", "xe", "tai nạn", "trầy xước", "đâm va"],
      icon: <Car className="h-4 w-4 text-blue-500" />,
    },
    {
      id: "suc-khoe-ca-nhan",
      type: "feature",
      title: "Bảo hiểm sức khỏe cá nhân",
      subtitle: "Chi trả chi phí y tế, điều trị nội trú",
      keywords: ["sức khỏe", "y tế", "nội trú", "ngoại trú", "bệnh viện"],
      icon: <Heart className="h-4 w-4 text-red-500" />,
    },
    {
      id: "du-quoc-te",
      type: "feature",
      title: "Bảo hiểm du lịch quốc tế",
      subtitle: "Bảo hiểm cho chuyến đi nước ngoài",
      keywords: ["du lịch", "quốc tế", "visa", "schengen", "nước ngoài"],
      icon: <Plane className="h-4 w-4 text-cyan-500" />,
    },
    {
      id: "nhan-tho",
      type: "feature",
      title: "Bảo hiểm nhân thọ",
      subtitle: "Đầu tư và bảo vệ tài chính tương lai",
      keywords: ["nhân thọ", "đầu tư", "hưu trí", "giáo dục", "tương lai"],
      icon: <Shield className="h-4 w-4 text-purple-500" />,
    },
    {
      id: "chay-no",
      type: "feature",
      title: "Bảo hiểm cháy nổ",
      subtitle: "Bảo hiểm nhà cửa và tài sản khỏi cháy nổ",
      keywords: ["cháy", "nổ", "nhà cửa", "tài sản", "thiên tai"],
      icon: <Home className="h-4 w-4 text-green-500" />,
    },
  ];

  // Popular searches
  const popularSearches = SEARCH_SUGGESTIONS.POPULAR_QUERIES.map(
    (query, index) => ({
      id: `popular-${index}`,
      type: "popular" as const,
      title: query,
      subtitle: "Tìm kiếm phổ biến",
      keywords: [query],
      icon: <TrendingUp className="h-4 w-4 text-orange-500" />,
    }),
  );

  // Load recent searches from localStorage only if not provided externally
  useEffect(() => {
    if (!externalRecentSearches && typeof window !== "undefined") {
      const saved = localStorage.getItem("insurance-recent-searches");
      if (saved) {
        try {
          setInternalRecentSearches(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse recent searches:", e);
        }
      }
    }
  }, [externalRecentSearches]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Handle input change with debouncing
  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    onChange?.(newValue);

    // Open popover when user starts typing
    if (newValue.length > 0 && !isOpen) {
      setIsOpen(true);
    }

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      if (newValue.length >= 2) {
        generateSuggestions(newValue);
      } else {
        setInternalSuggestions([]);
      }
    }, debounceMs);
  };

  // Generate search suggestions based on input
  const generateSuggestions = (query: string) => {
    // If external suggestions are provided, don't generate
    if (externalSuggestions) return;

    setInternalLoading(true);
    const lowerQuery = query.toLowerCase();

    // Search predefined suggestions
    const predefinedMatches = predefinedSuggestions.filter(
      (s) =>
        s.title.toLowerCase().includes(lowerQuery) ||
        s.keywords.some((k) => k.toLowerCase().includes(lowerQuery)),
    );

    // Search product names and issuers
    const productMatches = INSURANCE_PRODUCTS.filter((product) => {
      const searchText =
        `${product.name} ${product.issuer} ${product.category}`.toLowerCase();
      return searchText.includes(lowerQuery);
    })
      .slice(0, 5)
      .map((product) => ({
        id: product.id,
        type: "product" as const,
        title: product.name,
        subtitle: product.issuer,
        keywords: [
          product.issuer,
          product.category,
          ...(product.features || []),
        ],
        icon: categoryIcons[product.category] || getDefaultIcon(),
      }));

    // Search categories
    const categoryMatches = Object.entries(INSURANCE_CATEGORIES)
      .filter(
        ([_, category]) =>
          category.name.toLowerCase().includes(lowerQuery) ||
          category.description.toLowerCase().includes(lowerQuery),
      )
      .map(([key, category]) => ({
        id: `category-${key}`,
        type: "category" as const,
        title: category.name,
        subtitle: category.description,
        keywords: [category.name, category.description],
        icon: categoryIcons[key] || getDefaultIcon(),
      }));

    setInternalSuggestions([
      ...predefinedMatches,
      ...productMatches,
      ...categoryMatches,
    ]);
    setInternalLoading(false);
  };

  // Handle search submit
  const handleSearch = (searchValue: string = inputValue) => {
    if (searchValue.trim()) {
      // Only update internal recent searches if not provided externally
      if (!externalRecentSearches) {
        const newRecentSearches = [
          searchValue,
          ...internalRecentSearches.filter((s) => s !== searchValue),
        ].slice(0, 5);

        setInternalRecentSearches(newRecentSearches);

        if (typeof window !== "undefined") {
          localStorage.setItem(
            "insurance-recent-searches",
            JSON.stringify(newRecentSearches),
          );
        }
      }

      // Track analytics
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", ANALYTICS_EVENTS.SEARCH_QUERY, {
          search_term: searchValue,
        });
      }

      onSearch?.(searchValue);
    }
    setIsOpen(false);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    const searchValue = suggestion.title;
    setInputValue(searchValue);
    onChange?.(searchValue);
    handleSearch(searchValue);
  };

  // Handle recent search click
  const handleRecentSearchClick = (search: string) => {
    setInputValue(search);
    onChange?.(search);
    handleSearch(search);
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    if (!externalRecentSearches) {
      setInternalRecentSearches([]);
      if (typeof window !== "undefined") {
        localStorage.removeItem("insurance-recent-searches");
      }
    }
  };

  return (
    <div className={cn("relative w-full max-w-2xl", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div
            className="relative cursor-pointer"
            onClick={() => {
              if (!isOpen) {
                setIsOpen(true);
                inputRef.current?.focus();
              }
            }}
          >
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              ref={inputRef}
              type="text"
              placeholder={placeholder || t("searchPlaceholder")}
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyPress}
              onFocus={() => {
                setIsOpen(true);
              }}
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(true);
              }}
              className="pl-10 pr-4 h-11 text-base cursor-pointer"
            />
            {inputValue && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setInputValue("");
                  onChange?.("");
                  setInternalSuggestions([]);
                  setIsOpen(false);
                }}
              >
                ×
              </Button>
            )}
          </div>
        </PopoverTrigger>

        <PopoverContent className="w-full p-0" align="start" sideOffset={4}>
          <Command shouldFilter={false}>
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <CommandInput
                placeholder={t("searchSuggestions")}
                value={inputValue}
                onValueChange={handleInputChange}
                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-0 focus:ring-0"
              />
            </div>

            <CommandList>
              {/* Loading state */}
              {loading && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  {t("searching")}...
                </div>
              )}

              {/* Search suggestions */}
              {showSuggestions &&
                !loading &&
                !externalSuggestions &&
                internalSuggestions.length > 0 && (
                  <CommandGroup heading={t("suggestions")}>
                    {internalSuggestions.map((suggestion) => (
                      <CommandItem
                        key={suggestion.id}
                        onSelect={() => handleSuggestionClick(suggestion)}
                      >
                        <div className="flex items-center space-x-3 w-full">
                          {suggestion.icon}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {suggestion.title}
                            </p>
                            {suggestion.subtitle && (
                              <p className="text-xs text-muted-foreground truncate">
                                {suggestion.subtitle}
                              </p>
                            )}
                          </div>
                          {suggestion.type === "category" && (
                            <Badge variant="outline" className="text-xs">
                              Danh mục
                            </Badge>
                          )}
                          {suggestion.type === "product" && (
                            <Badge variant="outline" className="text-xs">
                              Sản phẩm
                            </Badge>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

              {/* External suggestions */}
              {!loading &&
                externalSuggestions &&
                externalSuggestions.length > 0 && (
                  <CommandGroup heading={t("suggestions")}>
                    {externalSuggestions.map((suggestion, index) => (
                      <CommandItem
                        key={`external-${index}`}
                        onSelect={() => {
                          setInputValue(suggestion);
                          onChange?.(suggestion);
                          handleSearch(suggestion);
                        }}
                      >
                        <div className="flex items-center space-x-3 w-full">
                          <Search className="h-4 w-4 text-muted-foreground" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {suggestion}
                            </p>
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

              {/* Popular searches */}
              {!loading &&
                !externalSuggestions &&
                internalSuggestions.length === 0 && (
                  <CommandGroup heading="Tìm kiếm phổ biến">
                    {popularSearches.map((search) => (
                      <CommandItem
                        key={search.id}
                        onSelect={() => handleSuggestionClick(search)}
                      >
                        <div className="flex items-center space-x-3 w-full">
                          {search.icon}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {search.title}
                            </p>
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

              {/* Recent searches */}
              {showRecentSearches &&
                !loading &&
                !externalSuggestions &&
                internalSuggestions.length === 0 &&
                recentSearches.length > 0 && (
                  <CommandGroup
                    heading={
                      <div className="flex items-center justify-between">
                        <span>{t("recentSearches")}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 text-xs"
                          onClick={clearRecentSearches}
                        >
                          {t("clear")}
                        </Button>
                      </div>
                    }
                  >
                    {recentSearches.map((search, index) => (
                      <CommandItem
                        key={index}
                        onSelect={() => handleRecentSearchClick(search)}
                      >
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{search}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

              {/* No results */}
              {!loading &&
                !externalSuggestions &&
                internalSuggestions.length === 0 &&
                recentSearches.length === 0 && (
                  <CommandEmpty>
                    <div className="py-6 text-center">
                      <p className="text-sm text-muted-foreground mb-2">
                        {t("noSuggestions")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("trySearchingFor")}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3 justify-center">
                        {[
                          "TNDS xe máy",
                          "Bảo hiểm sức khỏe",
                          "Bảo hiểm du lịch",
                          "Bảo hiểm nhà",
                        ].map((term) => (
                          <Badge
                            key={term}
                            variant="outline"
                            className="cursor-pointer"
                            onClick={() => {
                              setInputValue(term);
                              onChange?.(term);
                              handleSearch(term);
                            }}
                          >
                            {term}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CommandEmpty>
                )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default InsuranceSearchBar;
