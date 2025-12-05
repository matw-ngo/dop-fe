/**
 * Example usage of the useInsuranceUrlSync hook
 * This demonstrates how to integrate URL synchronization with insurance filtering
 */

"use client";

import { useInsuranceStore } from "@/store/use-insurance-store";
import { useInsuranceUrlSyncFull } from "@/hooks/use-insurance-url-sync";

export function InsuranceFiltersWithUrlSync() {
  // Get all state and setters from the insurance store
  const {
    filters,
    searchQuery,
    sortOption,
    pagination,
    setFilters,
    setSearchQuery,
    setSortOption,
    setPagination,
  } = useInsuranceStore();

  // Hook automatically handles URL synchronization
  useInsuranceUrlSyncFull({
    searchQuery,
    sortOption,
    pagination,
    filters,
    setSearchQuery,
    setSortOption,
    setPagination,
    setFilters,
  });

  // Now you can use the filters, search, sort, and pagination state as usual
  // Any changes will be automatically synchronized to the URL

  return (
    <div>
      <h1>Insurance Products</h1>

      {/* Search input */}
      <input
        type="text"
        placeholder="Search insurance products..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {/* Category filters */}
      <div>
        <label>
          <input
            type="checkbox"
            checked={filters.categories.includes("vehicle")}
            onChange={(e) => {
              const categories = e.target.checked
                ? [...filters.categories, "vehicle"]
                : filters.categories.filter(c => c !== "vehicle");
              setFilters({ categories });
            }}
          />
          Vehicle Insurance
        </label>

        <label>
          <input
            type="checkbox"
            checked={filters.categories.includes("health")}
            onChange={(e) => {
              const categories = e.target.checked
                ? [...filters.categories, "health"]
                : filters.categories.filter(c => c !== "health");
              setFilters({ categories });
            }}
          />
          Health Insurance
        </label>
      </div>

      {/* Premium range slider */}
      <div>
        <label>Premium Range:</label>
        <input
          type="range"
          min="0"
          max="100000000"
          value={filters.premiumRange.max}
          onChange={(e) => {
            setFilters({
              premiumRange: {
                ...filters.premiumRange,
                max: parseInt(e.target.value),
              },
            });
          }}
        />
        {new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(filters.premiumRange.max)}
      </div>

      {/* Sort dropdown */}
      <select
        value={sortOption}
        onChange={(e) => setSortOption(e.target.value as any)}
      >
        <option value="featured">Featured</option>
        <option value="premium-asc">Premium: Low to High</option>
        <option value="premium-desc">Premium: High to Low</option>
        <option value="rating-desc">Rating: High to Low</option>
      </select>

      {/* Pagination */}
      <div>
        <button
          disabled={pagination.page <= 1}
          onClick={() =>
            setPagination({ page: Math.max(1, pagination.page - 1) })
          }
        >
          Previous
        </button>

        <span>Page {pagination.page}</span>

        <button
          disabled={!pagination.hasNext}
          onClick={() => setPagination({ page: pagination.page + 1 })}
        >
          Next
        </button>
      </div>

      {/* Display current URL parameters for debugging */}
      <div>
        <h3>Current URL Parameters:</h3>
        <pre>{window.location.search}</pre>
      </div>
    </div>
  );
}

/**
 * Alternative: Using the hooks separately for more control
 */
export function InsuranceFiltersManualSync() {
  const store = useInsuranceStore();

  // Initialize from URL on mount
  const { setFilters, setSortOption, setPagination, setSearchQuery } = store;
  // useInsuranceUrlInit would be called here in a real component

  // Sync changes to URL
  useInsuranceUrlSyncFull({
    searchQuery: store.searchQuery,
    sortOption: store.sortOption,
    pagination: store.pagination,
    filters: store.filters,
    setSearchQuery,
    setSortOption,
    setPagination,
    setFilters,
  });

  // Component logic here...

  return <div>Insurance filters with manual URL sync</div>;
}