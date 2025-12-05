"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
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
  CreditCard as CreditCardIcon,
} from "lucide-react";
import { vietnameseCreditCards } from "@/data/credit-cards";
import { ANALYTICS_EVENTS } from "@/constants/credit-cards";

interface SearchBarProps {
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  className?: string;
  showRecentSearches?: boolean;
  showSuggestions?: boolean;
  debounceMs?: number;
}

interface SearchSuggestion {
  id: string;
  type: "card" | "category" | "feature" | "network";
  title: string;
  subtitle?: string;
  keywords: string[];
}

const SearchBar: React.FC<SearchBarProps> = ({
  value = "",
  onChange,
  onSearch,
  placeholder,
  className,
  showRecentSearches = true,
  showSuggestions = true,
  debounceMs = 300,
}) => {
  const t = useTranslations("pages.creditCard");
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);
  // Predefined search suggestions
  const predefinedSuggestions: SearchSuggestion[] = [
    {
      id: "free-annual-fee",
      type: "feature",
      title: "Miễn phí thường niên",
      subtitle: "Thẻ tín dụng không phí năm",
      keywords: ["miễn phí", "phí thường niên", "free", "annual fee"],
    },
    {
      id: "cashback",
      type: "feature",
      title: "Hoàn tiền cao",
      subtitle: "Thẻ hoàn tiền lên đến 30%",
      keywords: ["hoàn tiền", "cashback", "tiền mặt", "vcompleted"],
    },
    {
      id: "travel",
      type: "category",
      title: "Du lịch và dặm bay",
      subtitle: "Ưu đãi khách sạn, vé máy bay",
      keywords: ["du lịch", "dặm bay", "travel", "miles", "khách sạn"],
    },
    {
      id: "shopping",
      type: "category",
      title: "Mua sắm online",
      subtitle: "Giảm giá tại Shopee, Lazada, Tiki",
      keywords: ["mua sắm", "shopping", "online", "shopee", "lazada", "tiki"],
    },
    {
      id: "fuel",
      type: "category",
      title: "Xăng dầu",
      subtitle: "Giảm giá tại trạm xăng",
      keywords: ["xăng", "dầu", "petrolimex", "pvoil", "fuel"],
    },
    {
      id: "dining",
      type: "category",
      title: "Ăn uống",
      subtitle: "Giảm giá nhà hàng, quán ăn",
      keywords: ["ăn uống", "đồ ăn", "nhà hàng", "food", "dining"],
    },
    {
      id: "student",
      type: "category",
      title: "Sinh viên",
      subtitle: "Thẻ tín dụng cho sinh viên",
      keywords: ["sinh viên", "student", "học sinh", "giới trẻ"],
    },
  ];

  // Load recent searches from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("credit-card-recent-searches");
      if (saved) {
        try {
          setRecentSearches(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse recent searches:", e);
        }
      }
    }
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
        setSuggestions([]);
      }
    }, debounceMs);
  };

  // Generate search suggestions based on input
  const generateSuggestions = (query: string) => {
    setLoading(true);
    const lowerQuery = query.toLowerCase();

    // Search predefined suggestions
    const predefinedMatches = predefinedSuggestions.filter(
      (s) =>
        s.title.toLowerCase().includes(lowerQuery) ||
        s.keywords.some((k) => k.toLowerCase().includes(lowerQuery)),
    );

    // Search card names and issuers
    const cardMatches = vietnameseCreditCards
      .filter((card) => {
        const searchText =
          `${card.name} ${card.issuer} ${card.cardType}`.toLowerCase();
        return searchText.includes(lowerQuery);
      })
      .slice(0, 5)
      .map((card) => ({
        id: card.id,
        type: "card" as const,
        title: card.name,
        subtitle: card.issuer,
        keywords: [card.issuer, card.cardType, ...card.features.slice(0, 3)],
      }));

    setSuggestions([...predefinedMatches, ...cardMatches]);
    setLoading(false);
  };

  // Handle search submit
  const handleSearch = (searchValue: string = inputValue) => {
    if (searchValue.trim()) {
      // Add to recent searches
      const newRecentSearches = [
        searchValue,
        ...recentSearches.filter((s) => s !== searchValue),
      ].slice(0, 5);

      setRecentSearches(newRecentSearches);

      if (typeof window !== "undefined") {
        localStorage.setItem(
          "credit-card-recent-searches",
          JSON.stringify(newRecentSearches),
        );
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
    setRecentSearches([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("credit-card-recent-searches");
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
                  setSuggestions([]);
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
              {!loading && suggestions.length > 0 && (
                <CommandGroup heading={t("suggestions")}>
                  {suggestions.map((suggestion) => (
                    <CommandItem
                      key={suggestion.id}
                      onSelect={() => handleSuggestionClick(suggestion)}
                    >
                      <div className="flex items-center space-x-3 w-full">
                        {suggestion.type === "card" && (
                          <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
                        )}
                        {suggestion.type === "category" && (
                          <Badge variant="outline" className="text-xs">
                            {suggestion.title}
                          </Badge>
                        )}
                        {suggestion.type === "feature" && (
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        )}
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
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* Recent searches */}
              {!loading &&
                suggestions.length === 0 &&
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
                suggestions.length === 0 &&
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
                        {["Miễn phí", "Hoàn tiền", "Du lịch", "Mua sắm"].map(
                          (term) => (
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
                          ),
                        )}
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

export default SearchBar;
