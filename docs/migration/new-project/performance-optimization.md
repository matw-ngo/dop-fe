# DOP-FE Performance Optimization Guide

## Bundle Optimization

### Code Splitting
- **Route-based Splitting**: Automatic with Next.js App Router
- **Component-based Splitting**: Dynamic imports for heavy components
- **Vendor Splitting**: Separate chunks for third-party libraries
- **Dynamic Imports**: Lazy loading for non-critical components

#### Implementation Examples
```typescript
// Dynamic component import
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <div>Loading...</div>,
  ssr: false // Optional: disable server-side rendering
});

// Route-based code splitting (automatic with Next.js)
// Pages are automatically split into separate chunks

// Vendor splitting (configured in next.config.ts)
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns']
  }
};
```

### Tree Shaking
- **Unused Code Elimination**: Automatic with Turbopack
- **Import Optimization**: Only import what's used
- **Side-effect Management**: Mark pure functions as side-effect free
- **Bundle Analysis**: Regular analysis to identify unused code

#### Tree Shaking Best Practices
```typescript
// ✅ Good: Specific imports
import { Button } from '@/components/ui/button';
import { useState } from 'react';

// ❌ Bad: Whole library imports
import * as UI from '@/components/ui';
import * as React from 'react';

// ✅ Good: Tree-shakable imports
import { format } from 'date-fns';
import { clsx } from 'clsx';

// ❌ Bad: Non-tree-shakable imports
import dateFns from 'date-fns';
import clsx from 'clsx/lib/clsx';

// Mark side-effect free modules
// In package.json
{
  "sideEffects": false
}
```

### Minification and Compression
- **JavaScript Minification**: Turbopack with Terser
- **CSS Minification**: Built-in CSS optimization
- **HTML Minification**: Static export optimization
- **Gzip Compression**: Server-level compression

#### Compression Configuration
```nginx
# Nginx configuration
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types
  text/plain
  text/css
  text/xml
  text/javascript
  application/javascript
  application/xml+rss
  application/json;

# Brotli compression (if available)
brotli on;
brotli_comp_level 6;
brotli_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;
```

## Runtime Optimization

### Component Optimization
- **React.memo Usage**: Prevent unnecessary re-renders
- **useMemo Usage**: Memoize expensive computations
- **useCallback Usage**: Stable function references
- **Virtual Lists**: Efficient rendering of large lists

#### React Optimization Examples
```typescript
// ✅ Component memoization
const MemoizedComponent = React.memo(({ data, onUpdate }) => {
  return <div>{data.map(item => <Item key={item.id} {...item} />)}</div>;
}, (prevProps, nextProps) => {
  // Custom comparison function
  return prevProps.data.length === nextProps.data.length;
});

// ✅ Expensive computation memoization
const ExpensiveComponent = ({ items, filter }) => {
  const filteredItems = useMemo(() => {
    return items.filter(item => 
      item.name.toLowerCase().includes(filter.toLowerCase())
    );
  }, [items, filter]);

  return <List items={filteredItems} />;
};

// ✅ Stable event handlers
const ParentComponent = ({ children }) => {
  const [count, setCount] = useState(0);
  
  const handleClick = useCallback(() => {
    setCount(c => c + 1);
  }, []); // Empty dependency array = stable function

  return <ChildComponent onClick={handleClick} count={count} />;
};

// ✅ Virtual list for large datasets
import { FixedSizeList as List } from 'react-window';

const VirtualizedList = ({ items }) => {
  const Row = ({ index, style }) => (
    <div style={style}>
      Item {items[index].name}
    </div>
  );

  return (
    <List
      height={600}
      itemCount={items.length}
      itemSize={50}
      children={Row}
    />
  );
};
```

### State Management
- **Store Optimization**: Selective subscriptions
- **Selector Optimization**: Memoized selectors
- **Subscription Management**: Avoid unnecessary re-renders
- **Memory Management**: Proper cleanup patterns

#### Zustand Optimization
```typescript
// ✅ Optimized store structure
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface AppState {
  user: User | null;
  flows: Flow[];
  isLoading: boolean;
}

const useAppStore = create<AppState>((set, get) => ({
  user: null,
  flows: [],
  isLoading: false,
  
  // Actions
  setUser: (user) => set({ user }),
  setFlows: (flows) => set({ flows }),
  setLoading: (isLoading) => set({ isLoading }),
}));

// ✅ Selective subscriptions
const useUser = () => useAppStore(state => state.user);
const useFlows = () => useAppStore(state => state.flows);
const useIsLoading = () => useAppStore(state => state.isLoading);

// ✅ Memoized selectors
const useActiveFlows = () => {
  return useAppStore(
    useCallback(
      state => state.flows.filter(flow => flow.status === 'active'),
      []
    )
  );
};

// ✅ Optimized subscription
const useOptimizedSubscription = (selector, callback) => {
  const selectorRef = useRef(selector);
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    selectorRef.current = selector;
    callbackRef.current = callback;
    
    const unsubscribe = subscribeWithSelector(
      useAppStore,
      (state) => selectorRef.current(state),
      callbackRef.current
    );
    
    return unsubscribe;
  }, [selector, callback]);
};
```

### Image and Asset Optimization
- **Image Optimization**: Manual optimization for static export
- **Asset Compression**: Compress static assets
- **Lazy Loading**: Load images on demand
- **CDN Usage**: Distribute assets via CDN

#### Image Optimization Strategies
```typescript
// ✅ Optimized image component
import Image from 'next/image';
import { useState } from 'react';

const OptimizedImage = ({ src, alt, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  return (
    <div className="relative">
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <Image
        src={src}
        alt={alt}
        onLoad={() => setIsLoaded(true)}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
        {...props}
      />
    </div>
  );
};

// ✅ Lazy loaded images
const LazyImage = ({ src, alt, ...props }) => {
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef();
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.1 }
    );
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => observer.disconnect();
  }, []);
  
  return (
    <div ref={imgRef} className="relative">
      {isInView ? (
        <Image src={src} alt={alt} {...props} />
      ) : (
        <div className="bg-gray-200 animate-pulse aspect-w-16/9" />
      )}
    </div>
  );
};
```

### API Optimization
- **Request Batching**: Group related requests
- **Caching Strategy**: Intelligent caching with React Query
- **Error Handling**: Retry mechanisms with exponential backoff
- **Payload Optimization**: Minimize request sizes

#### React Query Optimization
```typescript
// ✅ Optimized query configuration
import { useQuery, useMutation } from '@tanstack/react-query';

const useOptimizedQuery = (queryKey, queryFn, options = {}) => {
  return useQuery({
    queryKey,
    queryFn,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    ...options,
  });
};

// ✅ Optimized mutation with optimistic updates
const useOptimizedMutation = (mutationFn, options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn,
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['flows'] });
      
      // Snapshot the previous value
      const previousFlows = queryClient.getQueryData(['flows']);
      
      // Optimistically update to the new value
      queryClient.setQueryData(['flows'], (old: any[]) => [
        ...old,
        { ...variables, id: 'temp-id', status: 'pending' }
      ]);
      
      return { previousFlows };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate
      if (context?.previousFlows) {
        queryClient.setQueryData(['flows'], context.previousFlows);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['flows'] });
    },
    ...options,
  });
};
```

## Monitoring and Analysis

### Performance Metrics
- **Core Web Vitals**: LCP, FID, CLS, FCP, TTFB
- **Bundle Size Tracking**: Monitor bundle size changes
- **Load Time Analysis**: Track page load performance
- **Memory Usage**: Monitor memory consumption

#### Web Vitals Implementation
```typescript
// ✅ Comprehensive web vitals tracking
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  // Send to your analytics service
  const analyticsData = {
    name: metric.name,
    value: Math.round(metric.value),
    id: metric.id,
    delta: metric.delta,
    entries: metric.entries,
    rating: metric.rating,
    navigationType: metric.navigationType,
  };

  // Example: Google Analytics
  gtag('event', metric.name, {
    event_category: 'Web Vitals',
    value: analyticsData.value,
    custom_map: {
      custom_parameter_1: analyticsData.rating,
      custom_parameter_2: analyticsData.navigationType,
    },
  });

  // Example: Custom analytics
  fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(analyticsData),
  });
}

// Initialize vitals monitoring
getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

### Performance Tools
- **Bundle Analyzer**: Analyze bundle composition
- **Performance Profiler**: React DevTools Profiler
- **Network Analysis**: Chrome DevTools Network tab
- **Rendering Performance**: Chrome DevTools Rendering tab

#### Bundle Analysis Setup
```bash
# ✅ Bundle analyzer configuration
npm install --save-dev @next/bundle-analyzer

# next.config.ts
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);

# Usage
ANALYZE=true npm run build:static
```

#### Performance Profiling
```typescript
// ✅ React Profiler wrapper
import { Profiler } from 'react';

const PerformanceProfiler = ({ children, id }) => {
  return (
    <Profiler
      id={id}
      onRender={(id, phase, actualDuration, baseDuration, startTime, commitTime) => {
        // Log performance data
        console.log('Profiler data:', {
          id,
          phase,
          actualDuration,
          baseDuration,
          startTime,
          commitTime,
        });

        // Send to analytics
        if (actualDuration > baseDuration * 2) {
          // Flag performance issues
          sendPerformanceIssue({
            component: id,
            phase,
            duration: actualDuration,
            expectedDuration: baseDuration,
          });
        }
      }}
    >
      {children}
    </Profiler>
  );
};
```

## Advanced Optimization Techniques

### Code Optimization Patterns
- **Memoization Patterns**: Advanced memoization strategies
- **Render Optimization**: Minimize re-renders
- **Event Handling**: Efficient event management
- **Memory Management**: Prevent memory leaks

#### Advanced Memoization
```typescript
// ✅ Custom memoization hook
function useMemoWithCompare<T>(
  factory: () => T,
  deps: React.DependencyList,
  compare?: (prevDeps: React.DependencyList, nextDeps: React.DependencyList) => boolean
) {
  const ref = React.useRef<{ deps: React.DependencyList; result: T }>();
  
  if (!ref.current || !compare || !compare(ref.current.deps, deps)) {
    ref.current = { deps, result: factory() };
  }
  
  return ref.current.result;
}

// Usage
const ExpensiveComponent = ({ data, filter }) => {
  const filteredData = useMemoWithCompare(
    () => data.filter(item => item.name.includes(filter)),
    [data, filter],
    (prevDeps, nextDeps) => 
      prevDeps[0].length === nextDeps[0].length && 
      prevDeps[1] === nextDeps[1]
  );
  
  return <List items={filteredData} />;
};
```

### Rendering Optimization
- **Virtual Scrolling**: Efficient list rendering
- **Intersection Observer**: Lazy loading components
- **Web Workers**: Offload heavy computations
- **Request Animation**: Smooth animations

#### Virtual Scrolling Implementation
```typescript
// ✅ Advanced virtual scrolling
import { VariableSizeList } from 'react-window';

const VirtualizedTable = ({ items, columns }) => {
  const getItemSize = useCallback((index) => {
    // Calculate item height based on content
    const item = items[index];
    const baseHeight = 50;
    const extraLines = Math.floor(item.description.length / 50);
    return baseHeight + (extraLines * 20);
  }, [items]);

  const Row = ({ index, style }) => {
    const item = items[index];
    
    return (
      <div style={style} className="border-b p-2">
        {columns.map(column => (
          <div key={column.key} className="font-medium">
            {item[column.key]}
          </div>
        ))}
      </div>
    );
  };

  return (
    <VariableSizeList
      height={600}
      itemCount={items.length}
      itemSize={getItemSize}
      children={Row}
      overscanCount={5}
    />
  );
};
```

### Network Optimization
- **Request Deduplication**: Avoid duplicate requests
- **Response Caching**: Intelligent caching strategies
- **Compression**: Enable response compression
- **CDN Integration**: Distribute content globally

#### Request Optimization
```typescript
// ✅ Request deduplication
const requestCache = new Map();

const optimizedFetch = async (url, options = {}) => {
  const cacheKey = `${url}-${JSON.stringify(options)}`;
  
  if (requestCache.has(cacheKey)) {
    return requestCache.get(cacheKey);
  }
  
  const controller = new AbortController();
  options.signal = controller.signal;
  
  const requestPromise = fetch(url, options);
  requestCache.set(cacheKey, requestPromise);
  
  try {
    const response = await requestPromise;
    
    // Cache successful responses
    if (response.ok) {
      setTimeout(() => {
        requestCache.delete(cacheKey);
      }, 5000); // Clear after 5 seconds
    }
    
    return response;
  } catch (error) {
    requestCache.delete(cacheKey);
    throw error;
  }
};

// ✅ Batch requests
const batchRequests = async (requests) => {
  const batchSize = 10;
  const batches = [];
  
  for (let i = 0; i < requests.length; i += batchSize) {
    batches.push(requests.slice(i, i + batchSize));
  }
  
  const results = [];
  for (const batch of batches) {
    const batchResults = await Promise.allSettled(
      batch.map(({ url, options }) => optimizedFetch(url, options))
    );
    results.push(...batchResults);
  }
  
  return results;
};
```

## Performance Testing

### Load Testing
- **Page Load Performance**: Measure key metrics
- **Bundle Size Analysis**: Regular bundle analysis
- **Memory Usage Testing**: Monitor memory consumption
- **Network Performance**: Analyze request patterns

#### Performance Testing Setup
```bash
# ✅ Lighthouse CI integration
npm install --save-dev @lhci/cli

# lhci.json configuration
{
  "ci": {
    "collect": {
      "numberOfRuns": 3,
      "settings": {
        "chromeFlags": "--headless"
      }
    },
    "assert": {
      "assertions": {
        "categories:performance": ["warn", {"minScore": 0.8}],
        "categories:accessibility": ["error", {"minScore": 0.9}],
        "categories:best-practices": ["warn", {"minScore": 0.8}],
        "categories:seo": ["warn", {"minScore": 0.8}]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}

# Run performance tests
npm run build:static
lhci autorun
```

### Benchmarking
- **Component Benchmarks**: Measure component performance
- **API Benchmarks**: Test API response times
- **Rendering Benchmarks**: Measure render performance
- **User Flow Benchmarks**: Test critical user journeys

#### Benchmark Implementation
```typescript
// ✅ Component benchmarking
import { measure } from 'react-performance-testing';

const ComponentBenchmark = ({ Component, props }) => {
  const [metrics, setMetrics] = useState(null);
  
  useEffect(() => {
    const measureComponent = async () => {
      const result = await measure(() => {
        return <Component {...props} />;
      });
      
      setMetrics({
        renderTime: result.renderTime,
        componentCount: result.componentCount,
        reRenderCount: result.reRenderCount,
      });
    };
    
    measureComponent();
  }, [Component, props]);
  
  return (
    <div>
      <Component {...props} />
      {metrics && (
        <div className="performance-metrics">
          <div>Render Time: {metrics.renderTime}ms</div>
          <div>Component Count: {metrics.componentCount}</div>
          <div>Re-render Count: {metrics.reRenderCount}</div>
        </div>
      )}
    </div>
  );
};
```

## Performance Monitoring

### Real-time Monitoring
- **Performance Budgets**: Set and track budgets
- **Alerting**: Notify on performance degradation
- **Trend Analysis**: Track performance over time
- **User Experience Metrics**: Monitor real user performance

#### Performance Budget Implementation
```typescript
// ✅ Performance budget tracking
const PERFORMANCE_BUDGETS = {
  bundleSize: {
    total: 500 * 1024, // 500KB
    chunks: {
      vendor: 200 * 1024, // 200KB
      main: 100 * 1024,  // 100KB
    }
  },
  webVitals: {
    LCP: 2500, // 2.5s
    FID: 100,  // 100ms
    CLS: 0.1,  // 0.1
    FCP: 1800, // 1.8s
  },
  apiResponse: {
    average: 1000, // 1s
    p95: 2000,    // 2s
  }
};

const checkPerformanceBudgets = (metrics) => {
  const violations = [];
  
  // Check bundle size
  if (metrics.bundleSize > PERFORMANCE_BUDGETS.bundleSize.total) {
    violations.push({
      type: 'bundle-size',
      current: metrics.bundleSize,
      budget: PERFORMANCE_BUDGETS.bundleSize.total,
      severity: 'high'
    });
  }
  
  // Check web vitals
  Object.entries(PERFORMANCE_BUDGETS.webVitals).forEach(([metric, budget]) => {
    if (metrics[metric] > budget) {
      violations.push({
        type: 'web-vital',
        metric,
        current: metrics[metric],
        budget,
        severity: 'medium'
      });
    }
  });
  
  // Report violations
  if (violations.length > 0) {
    reportPerformanceViolations(violations);
  }
};
```

This performance optimization guide provides comprehensive strategies for optimizing DOP-FE across all aspects of application performance, from bundle optimization to runtime performance and monitoring.