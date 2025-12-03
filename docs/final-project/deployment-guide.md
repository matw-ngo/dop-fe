# Hướng Dẫn Triển Khai DOP-FE

## Mục Lục

1. [Tổng Quan](#tổng-quan)
2. [Quá Trình Build](#quá-trình-build)
3. [Triển Khai Tĩnh](#triển-khai-tĩnh)
4. [Nền Tảng Hosting](#nền-tảng-hosting)
5. [Cấu Hình Môi Trường](#cấu-hình-môi-trường)
6. [Giám Sát và Bảo Trì](#giám-sát-và-bảo-trì)
7. [Kiểm Tra Triển Khai](#kiểm-tra-triển-khai)
8. [Gỡ Rối](#gỡ-rối)

## Tổng Quan

DOP-FE là ứng dụng Next.js được xây dựng với TypeScript và được cấu hình để xuất tĩnh (static export). Điều này cho phép triển khai ứng dụng trên bất kỳ nền tảng hosting tĩnh nào mà không cần máy chủ.

### Đặc Điểm Chính

- **Framework**: Next.js 15.5.4 với Turbopack
- **Ngôn ngữ**: TypeScript
- **Styling**: Tailwind CSS
- **Internationalization**: next-intl (hỗ trợ tiếng Việt và tiếng Anh)
- **Build Mode**: Static Export (`output: "export"`)
- **API Integration**: OpenAPI với client tự động tạo

## Quá Trình Build

### Phát Triển

```bash
# Khởi động máy chủ phát triển
npm run dev

# Tùy chỉnh cổng
npm run dev -- --port 3001

# Bật chế độ gỡ lỗi
DEBUG=* npm run dev
```

### Build Sản Xuất

```bash
# Build sản xuất với kiểm tra TypeScript
npm run build

# Build tĩnh cho triển khai
npm run build:static
```

### Cấu Hình Build

File [`next.config.ts`](../next.config.ts:1) chứa cấu hình quan trọng:

```typescript
const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  output: "export",           // Xuất tĩnh
  trailingSlash: true,         // Đảm bảo trailing slashes đúng
  images: {
    unoptimized: true,       // Tắt tối ưu ảnh cho xuất tĩnh
  },
  generateBuildId: async () => "build", // ID build nhất quán
};
```

### Cấu Trúc Output

Sau khi chạy `npm run build:static`, thư mục `out/` sẽ được tạo với cấu trúc:

```
out/
├── [locale]/
│   ├── index.html
│   ├── admin/
│   ├── user-onboarding/
│   └── _next/static/
├── _next/
└── robots.txt
```

## Triển Khai Tĩnh

### Lợi Ích Của Static Export

- **Linh hoạt Hosting**: Có thể triển khai trên bất kỳ hosting tĩnh nào
- **Hiệu Suất**: Không cần xử lý phía máy chủ
- **Thân Thiện CDN**: Dễ dàng phân phối qua CDN
- **Bảo Mật**: Giảm bề mặt tấn công

### Chuẩn Bị Triển Khai

1. **Kiểm tra build cục bộ**:
   ```bash
   npm run build:static
   npx serve out  # Kiểm tra tệp tĩnh cục bộ
   ```

2. **Xác thực tệp đã tạo**:
   - Kiểm tra tất cả các trang đã tạo đúng
   - Xác minh tài sản tĩnh được tối ưu
   - Đảm bảo kích thước bundle trong giới hạn chấp nhận

## Nền Tảng Hosting

### Vercel

#### Cấu Hình

1. **Kết nối Repository**:
   - Đăng nhập vào dashboard Vercel
   - Nhấp vào "New Project"
   - Kết nối Git repository
   - Import dự án DOP-FE

2. **Cấu hình Build**:
   ```json
   {
     "name": "dop-fe",
     "buildCommand": "npm run build:static",
     "outputDirectory": "out",
     "installCommand": "npm install",
     "framework": "nextjs"
   }
   ```

3. **Biến Môi Trường**:
   ```bash
   NEXT_PUBLIC_API_URL=https://your-api-domain.com/v1
   NEXT_PUBLIC_USE_MOCK_API=false
   ```

#### File Cấu Hình Vercel

```json
// vercel.json
{
  "buildCommand": "npm run build:static",
  "outputDirectory": "out",
  "installCommand": "npm install",
  "framework": "nextjs",
  "functions": {},
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

### Netlify

#### Cấu Hình Site

1. **Tạo Site**:
   - Đăng nhập vào dashboard Netlify
   - Nhấp vào "New site from Git"
   - Kết nối repository
   - Chọn DOP-FE

2. **Cài Đặt Build**:
   ```bash
   # Cài đặt build
   Build command: npm run build:static
   Publish directory: out
   Node version: 18
   
   # Biến môi trường
   NEXT_PUBLIC_API_URL=https://your-api-domain.com/v1
   NEXT_PUBLIC_USE_MOCK_API=false
   ```

3. **Quy Tắc Chuyển Hướng**:
   ```bash
   # netlify.toml
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

#### File Cấu Hình Netlify

```toml
# netlify.toml
[build]
  base = "/"
  command = "npm run build:static"
  publish = "out"
  
[build.environment]
  NODE_VERSION = "18"
  
[[redirects]]
  from = "/admin/*"
  to = "/admin/index.html"
  status = 200
  
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Hosting Tĩnh Khác

#### Triển Khai Bằng Upload Tệp

1. **Quá Trình Build**:
   ```bash
   npm run build:static
   # Output được tạo trong thư mục /out
   ```

2. **Upload Tệp**:
   ```bash
   # Sử dụng rsync để upload hiệu quả
   rsync -avz --delete out/ user@server:/var/www/html/
   
   # Sử dụng scp để upload đơn giản
   scp -r out/* user@server:/var/www/html/
   ```

3. **Cấu Hình Máy Chủ**:
   ```apache
   # Apache .htaccess
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule ^(.*)$ index.html [QSA,L]
   </IfModule>
   ```

   ```nginx
   # Cấu hình Nginx
   server {
     listen 80;
     server_name your-domain.com;
     root /var/www/html;
     index index.html;
     
     location / {
       try_files $uri $uri/ /index.html;
     }
     
     location /_next/static/ {
       expires 1y;
       add_header Cache-Control "public, immutable";
     }
   }
   ```

#### Cấu Hình CDN

```bash
# Ví dụ Cloudflare
# 1. Thêm domain vào Cloudflare
# 2. Thiết lập quy tắc trang cho caching
# 3. Cấu hình SSL/TLS
# 4. Thiết lập bản ghi DNS

# Quy tắc cache cho tài sản tĩnh
_cache-control: public, max-age=31536000, immutable
```

## Cấu Hình Môi Trường

### Biến Môi Trường Bắt Buộc

```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://your-api-domain.com/v1
NEXT_PUBLIC_USE_MOCK_API=false
```

### Biến Môi Trường Tùy Chọn

```bash
# eKYC Configuration
EKYC_ENVIRONMENT=production
EKYC_BACKEND_URL=https://ekyc-backend.com
EKYC_AUTH_TOKEN=your-production-token
EKYC_TOKEN_KEY=your-token-key
EKYC_TOKEN_ID=your-token-id

# Analytics
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_DEBUG=false
```

### Biến Môi Trường Bảo Mật

```bash
# Không bao giờ hiển thị trong mã phía client
API_SECRET_KEY=your-secret-key
DATABASE_URL=your-database-url
```

### Cấu Hình Build-time

```typescript
// Cấu hình qua NEXT_PUBLIC_API_URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dop-stg.datanest.vn/v1';
```

```typescript
// Feature toggles build-time
const ENABLE_ANALYTICS = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true';
const ENABLE_DEBUG = process.env.NEXT_PUBLIC_ENABLE_DEBUG === 'true';
```

### Phát Hiện Môi Trường

```typescript
// Phát hiện môi trường phía client
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

// Lựa chọn URL API
const getApiUrl = () => {
  if (isDevelopment) {
    return 'https://dop-stg.datanest.vn/v1';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'https://dop.datanest.vn/v1';
};
```

## Giám Sát và Bảo Trì

### Giám Sát Hiệu Suất

#### Core Web Vitals

```typescript
// Giám sát tích hợp Next.js
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  // Gửi đến dịch vụ analytics của bạn
  gtag('event', metric.name, {
    value: Math.round(metric.value),
    event_category: 'Web Vitals',
  });
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

#### Vercel Analytics (nếu sử dụng Vercel)

```typescript
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <>
      <Analytics />
      {/* Nội dung ứng dụng của bạn */}
    </>
  );
}
```

#### Theo Dõi Lỗi

```typescript
// Error boundary toàn cục
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    // Ghi log lỗi đến dịch vụ giám sát
    console.error('Lỗi bị bắt bởi boundary:', error, errorInfo);
    
    // Gửi đến dịch vụ theo dõi lỗi
    trackError(error, errorInfo);
  }
}
```

### Quản Lý Log

#### Log Ứng Dụng

```typescript
// Logging có cấu trúc
const logger = {
  info: (message, data) => {
    console.log(JSON.stringify({
      level: 'info',
      message,
      data,
      timestamp: new Date().toISOString()
    }));
  },
  error: (message, error) => {
    console.error(JSON.stringify({
      level: 'error',
      message,
      error: error?.stack || error,
      timestamp: new Date().toISOString()
    }));
  }
};
```

#### Log Lỗi

```typescript
// Logging lỗi API
const logApiError = (endpoint, error, response) => {
  logger.error('Lỗi API', {
    endpoint,
    status: response?.status,
    message: error.message,
    timestamp: new Date().toISOString()
  });
};
```

#### Log Hiệu Suất

```typescript
// Giám sát hiệu suất
const measurePerformance = (name, fn) => {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  
  logger.info('Chỉ số Hiệu suất', {
    name,
    duration: end - start,
    timestamp: new Date().toISOString()
  });
  
  return result;
};
```

## Kiểm Tra Triển Khai

### Kiểm Tra Trước Triển Khai

- [ ] **Chất Lượng Code**:
  - [ ] Tất cả tests đang chạy (`npm test`)
  - [ ] Linting sạch (`npm run lint`)
  - [ ] Biên dịch TypeScript thành công
  - [ ] Không có lỗi console trong phát triển

- [ ] **Thiết Lập Môi Trường**:
  - [ ] Biến môi trường sản xuất được cấu hình
  - [ ] Endpoints API được cập nhật cho sản xuất
  - [ ] Feature flags được đặt phù hợp
  - [ ] Chứng chỉ SSL được cấu hình

- [ ] **Xác Minh Build**:
  - [ ] Build sản xuất thành công (`npm run build:static`)
  - [ ] Tệp tĩnh được tạo đúng
  - [ ] Tối ưu tài sản hoạt động
  - [ ] Kích thước bundle trong giới hạn chấp nhận

### Kiểm Tra Sau Triển Khai

- [ ] **Kiểm Tra Chức Năng**:
  - [ ] Tất cả các trang tải đúng
  - [ ] Điều hướng hoạt động đúng
  - [ ] Form gửi thành công
  - [ ] Tích hợp API hoạt động
  - [ ] Luồng xác thực hoạt động

- [ ] **Xác Minh Hiệu Suất**:
  - [ ] Thời gian tải trang chấp nhận được
  - [ ] Core Web Vitals trong ngưỡng
  - [ ] Không có layout shifts (CLS)
  - [ ] First contentful paint nhanh (FCP)

- [ ] **Kiểm Tra Bảo Mật**:
  - [ ] HTTPS được cấu hình đúng
  - [ ] Không có cảnh báo nội dung hỗn hợp
  - [ ] Header bảo mật có mặt
  - [ ] Dữ liệu nhạy cảm không bị lộ

- [ ] **Thiết Lập Giám Sát**:
  - [ ] Theo dõi lỗi được cấu hình
  - [ ] Analytics được cài đặt đúng
  - [ ] Giám sát hiệu suất hoạt động
  - [ ] Tổng hợp log hoạt động

## Gỡ Rối

### Vấn Đề Phổ Biến

#### Build Thất Bại

```bash
# Xóa cache build
rm -rf .next
rm -rf node_modules/.cache

# Cài đặt lại
npm install

# Kiểm tra phiên bản Node.js
node --version  # Nên là 18.17+ hoặc 20+
```

#### Vấn Đề Xuất Tĩnh

```bash
# Kiểm tra các route động không thể xuất
npm run build:static

# Xem lại next.config.ts để tương thích xuất tĩnh
# Đảm bảo không có API routes đang được sử dụng
```

#### Vấn Đề Biến Môi Trường

```bash
# Xác minh biến môi trường
echo $NEXT_PUBLIC_API_URL

# Kiểm tra biến thiếu
npm run build 2>&1 | grep "NEXT_PUBLIC_"

# Kiểm tra với dữ liệu mẫu
NEXT_PUBLIC_USE_MOCK_API=true npm run dev
```

#### Vấn Đề Hiệu Suất

```bash
# Phân tích kích thước bundle
npm run build
npx next-bundle-analyzer

# Kiểm tra các dependencies lớn
npm ls --depth=0 | grep -E '^\w+@[0-9]+\.[0-9]+\.[0-9]+$'

# Tối ưu hình ảnh và tài sản
# Kiểm tra các tài sản chưa tối ưu
```

### Công Cụ Gỡ Rối

#### Kiểm Tra Cục Bộ

```bash
# Build sản xuất cục bộ
npm run build:static
npx serve out  # Kiểm tra tệp tĩnh cục bộ

# Kiểm tra với biến sản xuất
NODE_ENV=production npm run build:static
```

#### Phân Tích Mạng

```bash
# Kiểm tra kết nối API
curl -I $NEXT_PUBLIC_API_URL/health

# Kiểm tra header CORS
curl -H "Origin: https://your-domain.com" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     $NEXT_PUBLIC_API_URL
```

#### Gỡ Rối Hiệu Suất

```bash
# Kiểm tra Lighthouse
npx lighthouse https://your-domain.com --output html --output-path ./lighthouse-report.html

# WebPageTest
# Kiểm tra từ nhiều vị trí
# Kiểm tra thời gian tải và điểm hiệu suất
```

### Cấu Hình Nâng Cao

#### Cấu Hình Máy Chủ Tùy Chỉnh

```nginx
# Cấu hình Nginx nâng cao
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    # Cấu hình SSL
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    # Header bảo mật
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
    
    # Nén Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # Cache tài sản tĩnh
    location /_next/static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # Ứng dụng chính
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache";
    }
}
```

#### Triển Khai Đa Môi Trường

```yaml
# Ví dụ GitHub Actions
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Build
        run: npm run build:static
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.API_URL }}
          NEXT_PUBLIC_USE_MOCK_API: false
          
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

Hướng dẫn triển khai này bao gồm các khía cạnh thiết yếu của việc triển khai DOP-FE đến nhiều nền tảng khác nhau trong khi duy trì các tiêu chuẩn về hiệu suất, bảo mật và độ tin cậy.