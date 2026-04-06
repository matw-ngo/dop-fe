import { create } from "zustand";
import { persist } from "zustand/middleware";

const MAX_COMPARED_PRODUCTS = 3;

interface ProductCompareState {
  // Selected product IDs
  selectedProductIds: string[];

  // Actions
  addProduct: (productId: string) => boolean;
  removeProduct: (productId: string) => void;
  clearProducts: () => void;
  isSelected: (productId: string) => boolean;
  canAddMore: () => boolean;
  getCount: () => number;
}

export const useProductCompareStore = create<ProductCompareState>()(
  persist(
    (set, get) => ({
      selectedProductIds: [],

      addProduct: (productId: string) => {
        const { selectedProductIds } = get();

        // Check if already selected
        if (selectedProductIds.includes(productId)) {
          return false;
        }

        // Check max limit
        if (selectedProductIds.length >= MAX_COMPARED_PRODUCTS) {
          return false;
        }

        set({ selectedProductIds: [...selectedProductIds, productId] });
        return true;
      },

      removeProduct: (productId: string) => {
        const { selectedProductIds } = get();
        set({
          selectedProductIds: selectedProductIds.filter(
            (id) => id !== productId,
          ),
        });
      },

      clearProducts: () => {
        set({ selectedProductIds: [] });
      },

      isSelected: (productId: string) => {
        const { selectedProductIds } = get();
        return selectedProductIds.includes(productId);
      },

      canAddMore: () => {
        const { selectedProductIds } = get();
        return selectedProductIds.length < MAX_COMPARED_PRODUCTS;
      },

      getCount: () => {
        const { selectedProductIds } = get();
        return selectedProductIds.length;
      },
    }),
    {
      name: "product-compare-storage",
      // Use sessionStorage instead of localStorage
      storage: {
        getItem: (name) => {
          const str = sessionStorage.getItem(name);
          return str ? JSON.parse(str) : null;
        },
        setItem: (name, value) => {
          sessionStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          sessionStorage.removeItem(name);
        },
      },
    },
  ),
);

// Export constant for use in components
export const MAX_COMPARED_PRODUCTS_COUNT = MAX_COMPARED_PRODUCTS;
