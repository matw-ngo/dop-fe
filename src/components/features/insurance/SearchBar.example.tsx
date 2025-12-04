import React from "react";
import { InsuranceSearchBar, SearchBarProps } from "./SearchBar";

// Example 1: Basic usage
export const BasicExample = () => {
  const handleSearch = (query: string) => {
    console.log("Searching for:", query);
  };

  return (
    <InsuranceSearchBar
      onSearch={handleSearch}
      placeholder="Tìm kiếm bảo hiểm..."
    />
  );
};

// Example 2: With custom suggestions
export const WithCustomSuggestions = () => {
  const [searchValue, setSearchValue] = React.useState("");

  const customSuggestions = [
    "Bảo hiểm TNDS xe máy",
    "Bảo hiểm sức khỏe VIP",
    "Bảo hiểm du lịch châu Âu",
    "Bảo hiểm nhà tư nhân",
  ];

  const handleSearch = (query: string) => {
    console.log("Searching for:", query);
  };

  return (
    <InsuranceSearchBar
      value={searchValue}
      onChange={setSearchValue}
      onSearch={handleSearch}
      suggestions={customSuggestions}
      placeholder="Tìm kiếm bảo hiểm..."
    />
  );
};

// Example 3: With recent searches from API
export const WithRecentSearches = () => {
  const [searchValue, setSearchValue] = React.useState("");
  const [recentSearches, setRecentSearches] = React.useState<string[]>([
    "Bảo hiểm vật chất ô tô",
    "Bảo hiểm tai nạn cá nhân",
    "Bảo hiểm nhân thọ",
  ]);

  const handleSearch = (query: string) => {
    console.log("Searching for:", query);
  };

  return (
    <InsuranceSearchBar
      value={searchValue}
      onChange={setSearchValue}
      onSearch={handleSearch}
      recentSearches={recentSearches}
      placeholder="Tìm kiếm bảo hiểm..."
      debounceMs={500}
    />
  );
};

// Example 4: Controlled component with loading state
export const ControlledExample = () => {
  const [searchValue, setSearchValue] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    console.log("Searching for:", query);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  return (
    <InsuranceSearchBar
      value={searchValue}
      onChange={setSearchValue}
      onSearch={handleSearch}
      loading={isLoading}
      placeholder="Tìm kiếm bảo hiểm..."
    />
  );
};

// Example 5: Minimal configuration
export const MinimalExample = () => {
  return <InsuranceSearchBar onSearch={(query) => console.log(query)} />;
};

// Example 6: With custom styling
export const CustomStyledExample = () => {
  return (
    <div className="w-full max-w-3xl mx-auto">
      <InsuranceSearchBar
        onSearch={(query) => console.log(query)}
        className="shadow-lg"
        placeholder="Tìm kiếm sản phẩm bảo hiểm phù hợp..."
      />
    </div>
  );
};
