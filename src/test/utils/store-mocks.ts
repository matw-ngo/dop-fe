/**
 * Store Mocking Utilities for Zustand with subscribeWithSelector
 *
 * Provides TypeScript utilities for mocking Zustand stores in Vitest tests.
 * Handles stores that use subscribeWithSelector middleware.
 *
 * @module store-mocks
 */

import { vi } from "vitest";
import type { StoreApi, UseBoundStore } from "zustand";

/**
 * Type helper to extract state type from a Zustand store hook
 *
 * @template T - The Zustand store hook type
 */
type ExtractState<T> = T extends UseBoundStore<StoreApi<infer State>>
  ? State
  : T extends () => infer State
    ? State
    : never;

/**
 * Creates a mock implementation for a Zustand store with subscribeWithSelector middleware.
 *
 * This utility handles the selector pattern used by Zustand stores, allowing you to:
 * - Mock the entire store state
 * - Support selector functions that extract specific state slices
 * - Update mock state during tests
 * - Reset state between tests
 *
 * @template TStore - The Zustand store hook type
 * @param {Partial<ExtractState<TStore>>} initialState - Initial mock state (partial state object)
 * @returns {Object} Mock utilities
 * @returns {Function} returns.mockImplementation - Mock function to pass to vi.mock()
 * @returns {Function} returns.setState - Update mock state during tests
 * @returns {Function} returns.getState - Get current mock state
 * @returns {Function} returns.resetState - Reset to initial state
 *
 * @example
 * ```typescript
 * import { vi } from 'vitest';
 * import { createStoreMock } from '@/test/utils/store-mocks';
 * import type { useLoanSearchStore } from '@/store/use-loan-search-store';
 *
 * const loanSearchMock = createStoreMock<typeof useLoanSearchStore>({
 *   isVisible: false,
 *   config: null,
 *   forwardStatus: undefined,
 *   error: null,
 * });
 *
 * vi.mock('@/store/use-loan-search-store', () => ({
 *   useLoanSearchStore: loanSearchMock.mockImplementation,
 * }));
 *
 * // In test
 * loanSearchMock.setState({ isVisible: true });
 * ```
 */
export function createStoreMock<TStore>(
  initialState: Partial<ExtractState<TStore>>,
) {
  let mockState = { ...initialState };

  const mockImplementation = vi.fn((selector?: (state: any) => any) => {
    if (typeof selector === "function") {
      return selector(mockState);
    }
    return mockState;
  });

  return {
    /**
     * Mock implementation function to use with vi.mock()
     */
    mockImplementation,

    /**
     * Update mock state (merges with existing state)
     *
     * @param {Partial<ExtractState<TStore>>} newState - State updates to merge
     *
     * @example
     * ```typescript
     * loanSearchMock.setState({ isVisible: true, error: 'Failed' });
     * ```
     */
    setState: (newState: Partial<ExtractState<TStore>>) => {
      mockState = { ...mockState, ...newState };
    },

    /**
     * Get current mock state
     *
     * @returns {ExtractState<TStore>} Current mock state
     *
     * @example
     * ```typescript
     * const currentState = loanSearchMock.getState();
     * expect(currentState.isVisible).toBe(true);
     * ```
     */
    getState: () => mockState,

    /**
     * Reset mock state to initial values
     *
     * @example
     * ```typescript
     * beforeEach(() => {
     *   loanSearchMock.resetState();
     * });
     * ```
     */
    resetState: () => {
      mockState = { ...initialState };
    },
  };
}

/**
 * Creates a simple mock for a Zustand store that returns static state.
 *
 * Use this for simpler test scenarios where you don't need to update state during tests.
 *
 * @template TStore - The Zustand store hook type
 * @param {Partial<ExtractState<TStore>>} mockState - Static mock state
 * @returns {Function} Mock function that returns state or selected slice
 *
 * @example
 * ```typescript
 * import { vi } from 'vitest';
 * import { createSimpleStoreMock } from '@/test/utils/store-mocks';
 * import type { useLoanSearchStore } from '@/store/use-loan-search-store';
 *
 * vi.mock('@/store/use-loan-search-store', () => ({
 *   useLoanSearchStore: createSimpleStoreMock<typeof useLoanSearchStore>({
 *     isVisible: false,
 *     config: null,
 *   }),
 * }));
 * ```
 */
export function createSimpleStoreMock<TStore>(
  mockState: Partial<ExtractState<TStore>>,
) {
  return vi.fn((selector?: (state: any) => any) => {
    if (typeof selector === "function") {
      return selector(mockState);
    }
    return mockState;
  });
}

/**
 * Example: Mocking useLoanSearchStore
 *
 * This example demonstrates how to mock the loan search store in tests.
 *
 * @example
 * ```typescript
 * // In your test file: src/components/__tests__/loan-searching-screen.test.tsx
 *
 * import { beforeEach, describe, expect, it, vi } from 'vitest';
 * import { render, screen } from '@testing-library/react';
 * import { createStoreMock } from '@/test/utils/store-mocks';
 * import type { useLoanSearchStore } from '@/store/use-loan-search-store';
 * import { LoanSearchingScreen } from '@/components/loan-searching-screen';
 *
 * // Create mock with initial state
 * const loanSearchMock = createStoreMock<typeof useLoanSearchStore>({
 *   isVisible: false,
 *   config: null,
 *   forwardStatus: undefined,
 *   result: null,
 *   matchedProducts: [],
 *   error: null,
 *   isLoading: false,
 *   showLoanSearching: vi.fn(),
 *   hideLoanSearching: vi.fn(),
 *   setForwardStatus: vi.fn(),
 *   setResult: vi.fn(),
 *   setMatchedProducts: vi.fn(),
 *   setError: vi.fn(),
 *   clearError: vi.fn(),
 *   isSearching: vi.fn(() => false),
 *   getLeadId: vi.fn(() => null),
 *   getToken: vi.fn(() => null),
 * });
 *
 * // Mock the store module
 * vi.mock('@/store/use-loan-search-store', () => ({
 *   useLoanSearchStore: loanSearchMock.mockImplementation,
 *   useLoanSearchVisible: vi.fn(() => loanSearchMock.getState().isVisible),
 *   useLoanSearchConfig: vi.fn(() => loanSearchMock.getState().config),
 *   useForwardStatus: vi.fn(() => loanSearchMock.getState().forwardStatus),
 *   useLoanSearchLoading: vi.fn(() => loanSearchMock.getState().isLoading),
 *   useLoanSearchError: vi.fn(() => loanSearchMock.getState().error),
 *   useMatchedProducts: vi.fn(() => loanSearchMock.getState().matchedProducts),
 *   useLoanSearchResult: vi.fn(() => loanSearchMock.getState().result),
 * }));
 *
 * describe('LoanSearchingScreen', () => {
 *   beforeEach(() => {
 *     loanSearchMock.resetState();
 *   });
 *
 *   it('should not render when isVisible is false', () => {
 *     loanSearchMock.setState({ isVisible: false });
 *
 *     render(<LoanSearchingScreen />);
 *
 *     expect(screen.queryByText(/searching/i)).not.toBeInTheDocument();
 *   });
 *
 *   it('should render loading state when searching', () => {
 *     loanSearchMock.setState({
 *       isVisible: true,
 *       isLoading: true,
 *       config: {
 *         leadId: 'lead-123',
 *         token: 'token-456',
 *       },
 *     });
 *
 *     render(<LoanSearchingScreen />);
 *
 *     expect(screen.getByText(/searching/i)).toBeInTheDocument();
 *   });
 *
 *   it('should render error state', () => {
 *     loanSearchMock.setState({
 *       isVisible: true,
 *       isLoading: false,
 *       error: 'Search failed',
 *     });
 *
 *     render(<LoanSearchingScreen />);
 *
 *     expect(screen.getByText(/search failed/i)).toBeInTheDocument();
 *   });
 *
 *   it('should call hideLoanSearching when close button clicked', () => {
 *     const hideMock = vi.fn();
 *     loanSearchMock.setState({
 *       isVisible: true,
 *       hideLoanSearching: hideMock,
 *     });
 *
 *     render(<LoanSearchingScreen />);
 *
 *     const closeButton = screen.getByRole('button', { name: /close/i });
 *     closeButton.click();
 *
 *     expect(hideMock).toHaveBeenCalled();
 *   });
 * });
 * ```
 */

/**
 * Example: Simple mock for read-only tests
 *
 * @example
 * ```typescript
 * // For simpler tests where state doesn't change
 *
 * import { vi } from 'vitest';
 * import { createSimpleStoreMock } from '@/test/utils/store-mocks';
 * import type { useLoanSearchStore } from '@/store/use-loan-search-store';
 *
 * vi.mock('@/store/use-loan-search-store', () => ({
 *   useLoanSearchStore: createSimpleStoreMock<typeof useLoanSearchStore>({
 *     isVisible: true,
 *     config: {
 *       leadId: 'lead-123',
 *       token: 'token-456',
 *     },
 *     forwardStatus: 'approved',
 *     error: null,
 *   }),
 * }));
 *
 * // Test component that reads from store
 * it('should display approved status', () => {
 *   render(<StatusBadge />);
 *   expect(screen.getByText('Approved')).toBeInTheDocument();
 * });
 * ```
 */

/**
 * Example: Mocking selector hooks
 *
 * When your store exports selector hooks (like useLoanSearchVisible),
 * you need to mock them separately.
 *
 * @example
 * ```typescript
 * import { vi } from 'vitest';
 * import { createStoreMock } from '@/test/utils/store-mocks';
 * import type { useLoanSearchStore } from '@/store/use-loan-search-store';
 *
 * const loanSearchMock = createStoreMock<typeof useLoanSearchStore>({
 *   isVisible: false,
 *   config: null,
 * });
 *
 * vi.mock('@/store/use-loan-search-store', () => ({
 *   // Main store hook
 *   useLoanSearchStore: loanSearchMock.mockImplementation,
 *
 *   // Selector hooks - these need to read from mock state
 *   useLoanSearchVisible: vi.fn(() => loanSearchMock.getState().isVisible),
 *   useLoanSearchConfig: vi.fn(() => loanSearchMock.getState().config),
 *   useForwardStatus: vi.fn(() => loanSearchMock.getState().forwardStatus),
 * }));
 *
 * // Update state in test
 * it('should react to visibility changes', () => {
 *   loanSearchMock.setState({ isVisible: true });
 *
 *   // Component using useLoanSearchVisible() will get true
 *   render(<MyComponent />);
 *   expect(screen.getByTestId('search-modal')).toBeVisible();
 * });
 * ```
 */
