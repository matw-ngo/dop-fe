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
  X,
  Loader2,
} from "lucide-react";
import { vietnameseCreditCards } from "@/data/credit-cards";
import { ANALYTICS_EVENTS } from "@/constants/credit-cards";

interface CreditCardSearchBarProps {
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  onSuggestionClick?: (suggestion: SearchSuggestion) => void;
  placeholder?: string;
  className?: string;
  showRecentSearches?: boolean;
  showSuggestions?: boolean;
  debounceMs?: number;
  autoFocus?: boolean;
  size?: "sm" | "default" | "lg";
}

interface SearchSuggestion {
  id: string;
  type: "card" | "category" | "feature" | "network" | "popular";
  title: string;
  subtitle?: string;
  keywords: string[];
  cardId?: string;
}

export const CreditCardSearchBar: React.FC<CreditCardSearchBarProps> = ({
  value = "",
  onChange,
  onSearch,
  onSuggestionClick,
  placeholder,
  className,
  showRecentSearches = true,
  showSuggestions = true,
  debounceMs = 300,
  autoFocus = false,
  size = "default",
}) => {
  const t = useTranslations("creditCard");
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
      title: t("search.suggestions.freeAnnualFee.title"),
      subtitle: t("search.suggestions.freeAnnualFee.subtitle"),
      keywords: ["miễn phí", "phí thường niên", "free", "annual fee"],
    },
    {
      id: "cashback",
      type: "feature",
      title: t("search.suggestions.cashback.title"),
      subtitle: t("search.suggestions.cashback.subtitle"),
      keywords: ["hoàn tiền", "cashback", "tiền mặt", "vcompleted"],
    },
    {
      id: "travel",
      type: "category",
      title: t("search.suggestions.travel.title"),
      subtitle: t("search.suggestions.travel.subtitle"),
      keywords: ["du lịch", "dặm bay", "travel", "miles", "khách sạn"],
    },
    {
      id: "shopping",
      type: "category",
      title: t("search.suggestions.shopping.title"),
      subtitle: t("search.suggestions.shopping.subtitle"),
      keywords: ["mua sắm", "shopping", "online", "shopee", "lazada", "tiki"],
    },
    {
      id: "fuel",
      type: "category",
      title: t("search.suggestions.fuel.title"),
      subtitle: t("search.suggestions.fuel.subtitle"),
      keywords: ["xăng", "dầu", "petrolimex", "pvoil", "fuel"],
    },
    {
      id: "dining",
      type: "category",
      title: t("search.suggestions.dining.title"),
      subtitle: t("search.suggestions.dining.subtitle"),
      keywords: ["ăn uống", "đồ ăn", "nhà hàng", "food", "dining"],
    },
    {
      id: "student",
      type: "category",
      title: t("search.suggestions.student.title"),
      subtitle: t("search.suggestions.student.subtitle"),
      keywords: ["sinh viên", "student", "học sinh", "giới trẻ"],
    },
  ];

  // Popular searches
  const popularSearches = [
    t("search.popular.visa"),
    t("search.popular.mastercard"),
    t("search.popular.freeFee"),
    t("search.popular.cashback"),
    t("search.popular.travel"),
    t("search.popular.shopping"),
  ];

  // Load recent searches from localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && showRecentSearches) {
      const saved = localStorage.getItem("credit-card-recent-searches");
      if (saved) {
        try {
          setRecentSearches(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse recent searches:", e);
        }
      }
    }
  }, [showRecentSearches]);

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
        id: `card-${card.id}`,
        type: "card" as const,
        title: card.name,
        subtitle: card.issuer,
        keywords: [card.issuer, card.cardType, ...card.features.slice(0, 3)],
        cardId: card.id,
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
    onSuggestionClick?.(suggestion);
    handleSearch(searchValue);
  };

  // Handle recent search click
  const handleRecentSearchClick = (search: string) => {
    setInputValue(search);
    onChange?.(search);
    handleSearch(search);
  };

  // Handle popular search click
  const handlePopularSearchClick = (search: string) => {
    setInputValue(search);
    onChange?.(search);
    handleSearch(search);
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  // Clear input
  const handleClear = () => {
    setInputValue("");
    onChange?.("");
    setSuggestions([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("credit-card-recent-searches");
    }
  };

  // Size classes
  const sizeClasses = {
    sm: "h-9 text-sm",
    default: "h-11 text-base",
    lg: "h-13 text-lg",
  };

  return (
    <div className={cn("relative w-full", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              ref={inputRef}
              type="text"
              placeholder={placeholder || t("search.placeholder")}
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
              autoFocus={autoFocus}
              className={cn("pl-10 pr-10", sizeClasses[size], "cursor-text")}
            />
            {inputValue && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 hover:bg-transparent"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </PopoverTrigger>

        <PopoverContent className="w-full p-0" align="start" sideOffset={4}>
          <Command shouldFilter={false}>
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <CommandInput
                placeholder={t("search.searchSuggestions")}
                value={inputValue}
                onValueChange={handleInputChange}
                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-0 focus:ring-0"
              />
            </div>

            <CommandList>
              {/* Loading state */}
              {loading && (
                <div className="py-6 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("search.searching")}...
                </div>
              )}

              {/* Search suggestions */}
              {!loading && suggestions.length > 0 && showSuggestions && (
                <CommandGroup heading={t("search.suggestions")}>
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
                            {t(`search.categories.${suggestion.id}`)}
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
                recentSearches.length > 0 &&
                showRecentSearches && (
                  <CommandGroup
                    heading={
                      <div className="flex items-center justify-between">
                        <span>{t("search.recentSearches")}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 text-xs"
                          onClick={clearRecentSearches}
                        >
                          {t("search.clear")}
                        </Button>
                      </div>
                    }
                  >
                    {recentSearches.map((search, index) => (
                      <CommandItem
                        key={`recent-${index}`}
                        onSelect={() => handleRecentSearchClick(search)}
                      >
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{search}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

              {/* Popular searches */}
              {!loading &&
                suggestions.length === 0 &&
                recentSearches.length === 0 && (
                  <CommandGroup heading={t("search.popular.title")}>
                    {popularSearches.map((search, index) => (
                      <CommandItem
                        key={`popular-${index}`}
                        onSelect={() => handlePopularSearchClick(search)}
                      >
                        <TrendingUp className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{search}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

              {/* No results */}
              {!loading &&
                suggestions.length === 0 &&
                recentSearches.length === 0 &&
                popularSearches.length === 0 && (
                  <CommandEmpty>
                    <div className="py-6 text-center">
                      <p className="text-sm text-muted-foreground mb-2">
                        {t("search.noSuggestions")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("search.trySearchingFor")}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3 justify-center">
                        {["Miễn phí", "Hoàn tiền", "Du lịch", "Mua sắm"].map(
                          (term) => (
                            <Badge
                              key={term}
                              variant="outline"
                              className="cursor-pointer hover:bg-accent"
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

export default CreditCardSearchBar;
