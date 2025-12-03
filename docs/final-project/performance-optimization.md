# Tối ưu hóa Hiệu suất DOP-FE

## Mục lục
- [Tổng quan](#tổng-quan)
- [Kỹ thuật Tối ưu hóa Bundle](#kỹ-thuật-tối-ưu-hóa-bundle)
  - [Code Splitting](#code-splitting)
  - [Tree Shaking](#tree-shaking)
  - [Minification và Compression](#minification-và-compression)
- [Tối ưu hóa Runtime](#tối-ưu-hóa-runtime)
  - [Component Optimization](#component-optimization)
  - [State Management](#state-management)
  - [Image và Asset Optimization](#image-và-asset-optimization)
  - [API Optimization](#api-optimization)
- [Turbopack và Static Export](#turbopack-và-static-export)
  - [Turbopack Configuration](#turbopack-configuration)
  - [Static Export Benefits](#static-export-benefits)
- [Query Caching với React Query](#query-caching-với-react-query)
  - [Cache Configuration](#cache-configuration)
  - [Optimistic Updates](#optimistic-updates)
- [Công cụ Monitoring và Analysis](#công-cụ-monitoring-và-analysis)
  - [Performance Metrics](#performance-metrics)
  - [Bundle Analysis](#bundle-analysis)
  - [Runtime Profiling](#runtime-profiling)
- [Best Practices](#best-practices)
  - [Performance Budgets](#performance-budgets)
  - [Testing Strategies](#testing-strategies)
  - [Continuous Monitoring](#continuous-monitoring)
- [Tài liệu Liên quan](#tài-liệu-liên-quan)

## Tổng quan

DOP-FE được xây dựng với kiến trúc hiện đại tập trung vào hiệu suất, sử dụng Next.js 15.5.4 với Turbopack, React 19.1.0, và các công cụ tối ưu hóa tiên tiến. Tài liệu này cung cấp hướng dẫn chi tiết về các kỹ thuật tối ưu hóa hiệu suất được áp dụng trong dự án, từ bundle optimization đến runtime performance và monitoring.

## Kỹ thuật Tối ưu hóa Bundle

### Code Splitting

#### Route-based Splitting
Next.js App Router tự động thực hiện route-based code splitting, giúp giảm kích thước bundle ban đầu và chỉ tải các trang cần thiết khi người dùng điều hướng.

```typescript
// Route-based splitting được thực hiện tự động
// src/app/[locale]/page.tsx -> Tạo riêng bundle cho trang chủ
// src/app/[locale]/admin/page.tsx -> Tạo riêng bundle cho trang admin
```

#### Component-based Splitting
Sử dụng dynamic imports cho các component nặng để lazy loading:

```typescript
// Dynamic component import với loading state
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <div>Loading...</div>,
  ssr: false // Tùy chọn: tắt server-side rendering
});

// Dynamic import cho eKYC component
const EkycDialog = dynamic(() => import('@/components/ekyc/ekyc-dialog'), {
  loading: () => <div>Initializing eKYC...</div>
});
```

#### Vendor Splitting
Turbopack tự động phân tách các thư viện third-party vào các chunks riêng biệt:

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns', '@radix-ui/react-icons']
  }
};
```

### Tree Shaking

#### Import Optimization
Chỉ import những gì cần thiết để giảm kích thước bundle:

```typescript
// ✅ Good: Specific imports
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { format } from 'date-fns';
import { ChevronLeft } from 'lucide-react';

// ❌ Bad: Whole library imports
import * as UI from '@/components/ui';
import * as React from 'react';
import * as Icons from 'lucide-react';
```

#### Side-effect Management
Đánh dấu các module không có side effects:

```json
// package.json
{
  "sideEffects": false,
  "sideEffects": [
    "*.css",
    "./src/lib/theme/index.ts"
  ]
}
```

### Minification và Compression

#### JavaScript Minification
Turbopack sử dụng Terser để minify JavaScript:

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  // Turbopack tự động minify trong production build
  // Có thể tùy chỉnh qua webpack config nếu cần
};
```

#### CSS Optimization
Tailwind CSS với PostCSS tự động optimize CSS:

```typescript
// tailwind.config.js
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // PurgeCSS tự động remove unused CSS trong production
  purge: {
    enabled: process.env.NODE_ENV === 'production',
  }
};
```

## Tối ưu hóa Runtime

### Component Optimization

#### React.memo Usage
Sử dụng React.memo để tránh re-render không cần thiết:

```typescript
// Memoized component với custom comparison
const MemoizedFormField = React.memo(({ field, value, onChange }) => {
  return (
    <div className="form-field">
      <label>{field.label}</label>
      <input 
        value={value} 
        onChange={(e) => onChange(field.name, e.target.value)} 
      />
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function
  return prevProps.value === nextProps.value && 
         prevProps.field.name === nextProps.field.name;
});
```

#### useMemo Usage
Memoize các tính toán tốn kém:

```typescript
// Memoize expensive filtering operations
const filteredItems = useMemo(() => {
  return items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
}, [items, searchTerm]);

// Memoize complex calculations
const formValidation = useMemo(() => {
  return generateZodSchema(fields, t);
}, [fields, t]);
```

#### useCallback Usage
Tạo stable function references:

```typescript
// Stable event handlers
const handleSubmit = useCallback(async (data: FormData) => {
  try {
    await onSubmit(data);
    toast.success('Form submitted successfully');
  } catch (error) {
    toast.error('Submission failed');
  }
}, [onSubmit]);

// Stable functions for child components
const updateField = useCallback((fieldName: string, value: any) => {
  setFormData(prev => ({ ...prev, [fieldName]: value }));
}, []);
```

### State Management

#### Zustand Optimization
Sử dụng selective subscriptions để tránh re-render không cần thiết:

```typescript
// ✅ Good: Selective subscriptions
const useUserName = () => useAuthStore(state => state.user?.name);
const useIsLoggedIn = () => useAuthStore(state => !!state.user);

// ❌ Bad: Subscribing to entire store
const useAuth = () => useAuthStore(); // Sẽ re-render khi bất kỳ state nào thay đổi

// ✅ Good: Memoized selectors
const useActiveFlows = () => {
  return useAuthStore(
    useCallback(
      state => state.flows.filter(flow => flow.status === 'active'),
      []
    )
  );
};
```

#### React Query Configuration
Tối ưu hóa caching và refetching:

```typescript
// src/lib/query-client.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors except 408, 429
        if (error && typeof error === "object" && "status" in error) {
          const status = error.status as number;
          if (status >= 400 && status < 500 && status !== 408 && status !== 429) {
            return false;
          }
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: false,
    },
    mutations: {
      retry: (failureCount, error) => {
        // Similar retry logic for mutations
        if (error && typeof error === "object" && "status" in error) {
          const status = error.status as number;
          if (status >= 400 && status < 500 && status !== 408 && status !== 429) {
            return false;
          }
        }
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});
```

### Image và Asset Optimization

#### Static Image Optimization
Với static export, cần optimize images thủ công:

```typescript
// Optimized image component cho static export
const OptimizedImage = ({ src, alt, width, height, className }) => {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading="lazy"
      decoding="async"
    />
  );
};
```

#### Asset Compression
Sử dụng appropriate formats và compression:

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  images: {
    unoptimized: true, // Tắt optimization cho static export
    // Manual optimization needed:
    // - WebP format cho modern browsers
    // - Responsive images với srcset
    // - Lazy loading cho images below fold
  },
};
```

### API Optimization

#### Request Batching
Gom nhóm các request liên quan:

```typescript
// Batch multiple API calls
const loadFormData = async (formId: string) => {
  const [formConfig, userData, options] = await Promise.all([
    apiClient.GET('/forms/{id}', { params: { path: { id: formId } } }),
    apiClient.GET('/user/profile'),
    apiClient.GET('/forms/{id}/options', { params: { path: { id: formId } } })
  ]);
  
  return { formConfig, userData, options };
};
```

#### Optimistic Updates
Cung cấp immediate feedback:

```typescript
// Optimistic update helper
const optimisticallyUpdateQuery = <T>(
  queryKey: readonly string[],
  updateFn: (oldData: T | undefined) => T,
  rollbackFn?: (oldData: T | undefined) => void,
) => {
  const previousData = queryClient.getQueryData<T>(queryKey);
  
  queryClient.setQueryData(queryKey, updateFn);
  
  return () => {
    if (rollbackFn) {
      rollbackFn(previousData);
    } else {
      queryClient.setQueryData(queryKey, previousData);
    }
  };
};
```

## Turbopack và Static Export

### Turbopack Configuration

Turbopack là bundler thế hệ mới cho Next.js với hiệu suất vượt trội:

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  // Enable static export cho deployment flexibility
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  generateBuildId: async () => "build",
};
```

#### Lợi ích của Turbopack
- **Build速度快**: Tăng tốc độ build lên đến 53% so với Webpack
- **HMR hiệu quả**: Hot Module Replacement nhanh hơn và đáng tin cậy hơn
- **Memory usage thấp**: Tiêu thụ bộ nhớ ít hơn trong quá trình development
- **Parallel processing**: Tận dụng đa nhân CPU để tăng tốc độ build

### Static Export Benefits

Static export cho phép deploy DOP-FE trên các nền tảng static hosting:

```typescript
// package.json scripts
{
  "scripts": {
    "build": "tsc --noEmit && next build --turbopack",
    "build:static": "tsc --noEmit && next build --turbopack",
    "start": "next start"
  }
}
```

#### Lợi ích của Static Export
- **Deployment đơn giản**: Không cần server-side runtime
- **CDN-friendly**: Tối ưu cho CDN và edge caching
- **Security giảm thiểu**: Bề mặt tấn công nhỏ hơn
- **Cost hiệu quả**: Chi phí hosting thấp hơn

## Query Caching với React Query

### Cache Configuration

React Query được cấu hình để tối ưu hóa caching:

```typescript
// src/lib/query-client.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: false,
    },
  },
});
```

#### Cache Strategies
- **Stale-while-revalidate**: Hiển thị data cũ trong khi fetch data mới
- **Background refetching**: Tự động refresh data khi hết hạn
- **Intelligent retry**: Exponential backoff cho failed requests

### Optimistic Updates

Optimistic updates cung cấp immediate UI feedback:

```typescript
// Example mutation với optimistic update
const updateFlowMutation = useMutation({
  mutationFn: updateFlow,
  onMutate: async (newFlow) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['flows'] });
    
    // Snapshot previous value
    const previousFlows = queryClient.getQueryData(['flows']);
    
    // Optimistically update
    queryClient.setQueryData(['flows'], (old: any[]) => 
      old.map(flow => flow.id === newFlow.id ? newFlow : flow)
    );
    
    return { previousFlows };
  },
  onError: (err, newFlow, context) => {
    // Rollback on error
    queryClient.setQueryData(['flows'], context?.previousFlows);
  },
  onSettled: () => {
    // Refetch after error or success
    queryClient.invalidateQueries({ queryKey: ['flows'] });
  },
});
```

## Công cụ Monitoring và Analysis

### Performance Metrics

#### Core Web Vitals
Theo dõi các metrics quan trọng:

```typescript
// Web Vitals tracking
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  // Gửi đến analytics service
  const analyticsData = {
    name: metric.name,
    value: Math.round(metric.value),
    id: metric.id,
    delta: metric.delta,
    rating: metric.rating,
  };

  // Gửi đến Vercel Analytics
  if (window.va) {
    window.va('track', 'Web Vitals', analyticsData);
  }
}

// Initialize monitoring
getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

#### Performance Budgets
Đặt và theo dõi budgets:

```typescript
// Performance budgets configuration
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
```

### Bundle Analysis

#### Bundle Analyzer
Phân tích composition của bundle:

```bash
# Install bundle analyzer
npm install --save-dev @next/bundle-analyzer

# next.config.ts
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);

# Usage
ANALYZE=true npm run build:static
```

#### Bundle Optimization Tips
- **Dynamic imports**: Cho heavy components và libraries
- **Tree shaking**: Remove unused code
- **Vendor splitting**: Tách third-party libraries
- **Code splitting**: Theo routes và features

### Runtime Profiling

#### React Profiler
Sử dụng React Profiler để identify performance issues:

```typescript
// Performance profiler wrapper
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

        // Flag performance issues
        if (actualDuration > baseDuration * 2) {
          console.warn(`Performance issue detected in ${id}`);
        }
      }}
    >
      {children}
    </Profiler>
  );
};
```

#### Memory Usage Monitoring
Theo dõi memory consumption:

```typescript
// Memory monitoring
const useMemoryMonitor = () => {
  useEffect(() => {
    const checkMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        console.log('Memory usage:', {
          used: Math.round(memory.usedJSHeapSize / 1048576) + ' MB',
          total: Math.round(memory.totalJSHeapSize / 1048576) + ' MB',
          limit: Math.round(memory.jsHeapSizeLimit / 1048576) + ' MB',
        });
      }
    };

    const interval = setInterval(checkMemory, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);
};
```

## Best Practices

### Performance Budgets

#### Setting Budgets
Đặt realistic performance budgets:

```typescript
// Performance budget enforcement
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
  
  return violations;
};
```

#### Budget Enforcement
Integrate budget checks vào CI/CD:

```yaml
# .github/workflows/performance.yml
name: Performance Checks
on: [pull_request]

jobs:
  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build:static
      - run: npm run lighthouse:ci
      - run: npm run bundle-size:check
```

### Testing Strategies

#### Performance Testing
Automate performance testing:

```typescript
// Performance test example
describe('Performance Tests', () => {
  it('should load homepage within performance budget', async () => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000); // 3 seconds
  });

  it('should have bundle size within budget', async () => {
    const bundleStats = await analyzeBundle();
    expect(bundleStats.total).toBeLessThan(500 * 1024); // 500KB
  });
});
```

#### Load Testing
Test với realistic user loads:

```typescript
// Load testing with Artillery
// artillery.yml
config:
  target: 'https://dop-fe.vercel.app'
  phases:
    - duration: 60
      arrivalRate: 10
    - duration: 120
      arrivalRate: 20
    - duration: 60
      arrivalRate: 50

scenarios:
  - flow:
      - get:
          url: '/'
      - think: 5
      - get:
          url: '/credit-cards'
      - think: 3
      - get:
          url: '/loans'
```

### Continuous Monitoring

#### Real User Monitoring
Thu thập real user performance data:

```typescript
// RUM implementation
const useRealUserMonitoring = () => {
  useEffect(() => {
    // Track page load performance
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const loadTime = navigation.loadEventEnd - navigation.fetchStart;
      
      // Send to analytics
      if (window.va) {
        window.va('track', 'Page Load Time', { 
          value: loadTime,
          page: window.location.pathname 
        });
      }
    });

    // Track Core Web Vitals
    getCLS(sendToAnalytics);
    getFID(sendToAnalytics);
    getFCP(sendToAnalytics);
    getLCP(sendToAnalytics);
    getTTFB(sendToAnalytics);
  }, []);
};
```

#### Performance Alerts
Setup alerts cho performance degradation:

```typescript
// Performance alerting
const checkPerformanceAlerts = (metrics) => {
  const alerts = [];
  
  // Check for significant performance degradation
  if (metrics.LCP > PERFORMANCE_BUDGETS.webVitals.LCP * 1.5) {
    alerts.push({
      type: 'performance-degradation',
      metric: 'LCP',
      current: metrics.LCP,
      threshold: PERFORMANCE_BUDGETS.webVitals.LCP * 1.5,
      severity: 'high'
    });
  }
  
  // Send alerts
  if (alerts.length > 0) {
    sendAlerts(alerts);
  }
};
```

## Tài liệu Liên quan

- **[Project Architecture Overview](project-architecture-overview.md)** - Tổng quan kiến trúc hệ thống
- **[Dependencies and Integrations](dependencies-and-integrations.md)** - Dependencies và integrations
- **[Configuration and Environment Setup](configuration-and-environment-setup.md)** - Cấu hình và môi trường
- **[Deployment Guide](deployment-guide.md)** - Hướng dẫn triển khai
- **[API Documentation](api-documentation.md)** - Tài liệu API

Tối ưu hóa hiệu suất là một quá trình liên tục, không phải là một lần thiết lập. Bằng cách áp dụng các kỹ thuật và best practices này, DOP-FE có thể cung cấp trải nghiệm người dùng vượt trội với tốc độ tải nhanh, responsiveness tốt, và hiệu suất ổn định trên mọi thiết bị và điều kiện mạng.