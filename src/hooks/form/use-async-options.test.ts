import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useMultipleAsyncOptions } from './use-async-options';

// Mock dependencies
vi.mock('@tanstack/react-query', () => ({
  useQueries: vi.fn(),
}));

import { useQueries } from '@tanstack/react-query';

// Type the mocked useQueries
const mockedUseQueries = vi.mocked(useQueries);

describe('useMultipleAsyncOptions', () => {
  const asyncOptionsConfigs = {
    country: {
      fetcher: async () => [
        { value: 'us', label: 'United States' },
        { value: 'ca', label: 'Canada' },
      ],
      cacheKey: 'countries',
      cacheDuration: 300000,
    },
    state: {
      fetcher: async () => [
        { value: 'ca', label: 'California' },
        { value: 'ny', label: 'New York' },
      ],
      cacheKey: 'states',
      dependsOn: ['country'],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return async options state', () => {
    const mockQueryResults = [
      {
        data: [{ value: 'us', label: 'United States' }],
        isLoading: false,
        error: null,
      },
      {
        data: [{ value: 'ca', label: 'California' }],
        isLoading: false,
        error: null,
      },
    ];

    mockedUseQueries.mockReturnValue(mockQueryResults);

    const { result } = renderHook(() =>
      useMultipleAsyncOptions(asyncOptionsConfigs)
    );

    // Check the essential properties only (hook returns additional properties)
    expect(result.current.country.options).toHaveLength(1);
    expect(result.current.country.options[0].value).toBe('us');
    expect(result.current.country.options[0].label).toBe('United States');
    expect(result.current.country.isLoading).toBe(false);
    expect(result.current.country.error).toBe(null);

    expect(result.current.state.options).toHaveLength(1);
    expect(result.current.state.options[0].value).toBe('ca');
    expect(result.current.state.options[0].label).toBe('California');
    expect(result.current.state.isLoading).toBe(false);
    expect(result.current.state.error).toBe(null);
  });

  it('should handle loading state', () => {
    const mockQueryResults = [
      {
        data: undefined,
        isLoading: true,
        error: null,
      },
      {
        data: undefined,
        isLoading: false,
        error: null,
      },
    ];

    mockedUseQueries.mockReturnValue(mockQueryResults);

    const { result } = renderHook(() =>
      useMultipleAsyncOptions(asyncOptionsConfigs)
    );

    expect(result.current.country.isLoading).toBe(true);
  });

  it('should handle error state', () => {
    const mockQueryResults = [
      {
        data: undefined,
        isLoading: false,
        error: new Error('Failed to fetch'),
      },
    ];

    mockedUseQueries.mockReturnValue(mockQueryResults);

    const { result } = renderHook(() =>
      useMultipleAsyncOptions({ country: asyncOptionsConfigs.country })
    );

    expect(result.current.country.error).toBeInstanceOf(Error);
  });

  it('should return empty object for no configs', () => {
    mockedUseQueries.mockReturnValue([]);

    const { result } = renderHook(() =>
      useMultipleAsyncOptions({})
    );

    expect(result.current).toEqual({});
  });
});