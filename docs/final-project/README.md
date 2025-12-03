# DOP-FE - Digital Onboarding Platform Frontend Documentation

## Tổng quan

DOP-FE là nền tảng frontend hiện đại cho Digital Onboarding Platform, được xây dựng với Next.js 15.5.4, React 19.1.0 và TypeScript. Tài liệu này cung cấp hướng dẫn toàn diện về kiến trúc, triển khai và bảo trì hệ thống.

### Đặc điểm chính

- **Framework**: Next.js 15.5.4 với Turbopack
- **Ngôn ngữ**: TypeScript với strict mode
- **UI Components**: Radix UI + shadcn/ui với Tailwind CSS 4
- **State Management**: Zustand 5.0.8 + React Query 5.90.2
- **Form Handling**: react-hook-form + Zod validation
- **Internationalization**: next-intl với hỗ trợ tiếng Việt và tiếng Anh
- **Testing**: Vitest + Playwright + Testing Library
- **Documentation**: Storybook 8.6.14
- **Deployment**: Static export với tối ưu hóa hiệu suất

## Bắt đầu nhanh

### Yêu cầu

- Node.js 18.17+ hoặc 20+
- npm hoặc yarn
- Git

### Cài đặt

```bash
# Clone repository
git clone <repository-url>
cd dop-fe

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

### Build sản xuất

```bash
# Build sản xuất
npm run build:static

# Preview sản xuất
npx serve out
```

## Mục lục tài liệu

### Tài liệu cốt lõi

1. **[Tổng quan kiến trúc dự án](project-architecture-overview.md)**
   - Phân tích technology stack
   - Cấu trúc thư mục chi tiết
   - Patterns kiến trúc và quyết định thiết kế
   - Cân nhắc về hiệu suất

2. **[Luồng kinh doanh và quy trình](business-flows-and-processes.md)**
   - Phân tích luồng người dùng
   - Luồng xác thực
   - Luồng dữ liệu và giao dịch
   - API endpoints và xử lý lỗi

3. **[Mô hình dữ liệu và cấu trúc](data-models-and-structures.md)**
   - Mô hình dữ liệu cốt lõi
   - Cấu trúc quản lý trạng thái
   - Mô hình dữ liệu form
   - API payloads và mối quan hệ

4. **[Dependencies và tích hợp](dependencies-and-integrations.md)**
   - Phân tích NPM dependencies
   - Tích hợp bên ngoài (VNPT eKYC, OpenAPI)
   - Cân nhắc về bảo mật
   - Hiệu suất và độ tin cậy

### Tài liệu triển khai

5. **[Trang ứng dụng và Components](application-pages-and-components.md)**
   - Cấu trúc trang với Next.js App Router
   - Hierarchy component (atomic design)
   - Cấu trúc điều hướng
   - Tích hợp component libraries

6. **[Cấu hình và thiết lập môi trường](configuration-and-environment-setup.md)**
   - Phân tích file cấu hình
   - Thiết lập biến môi trường
   - Cấu hình công cụ phát triển
   - Hướng dẫn gỡ rối

7. **[Hướng dẫn triển khai](deployment-guide.md)**
   - Yêu cầu và điều kiện tiên quyết
   - Hướng dẫn từng bước thiết lập
   - Xác minh và kiểm thử
   - Tùy chọn triển khai

### Tài liệu tham khảo

8. **[Tài liệu API](api-documentation.md)**
   - Tham khảo API hoàn chỉnh
   - Tài liệu endpoints
   - Xác thực và ủy quyền
   - Xử lý lỗi

9. **[Tối ưu hóa hiệu suất](performance-optimization.md)**
   - Tối ưu hóa bundle
   - Tối ưu hóa runtime
   - Monitoring và phân tích
   - Kỹ thuật nâng cao

10. **[Thực hành bảo mật tốt nhất](security-best-practices.md)**
    - Xác thực và ủy quyền
    - Bảo vệ dữ liệu
    - Bảo mật môi trường
    - Giám sát bảo mật

### Tài liệu migration

11. **[Ma trận ánh xạ nội dung](content-mapping-matrix.md)**
    - Ánh xạ nội dung từ dự án cũ
    - Xác định khoảng trống và xung đột
    - Cơ hội ưu tiên công nghệ mới
    - Kế hoạch hành động

12. **[Ma trận ánh xạ dependencies](dependencies-mapping-matrix.md)**
    - Ánh xạ dependencies từ dự án cũ
    - Dependencies cần thay thế, loại bỏ và bổ sung
    - Hành động cần thực hiện
    - Rủi ro và giải pháp

13. **[Dependencies và tích hợp hợp nhất](consolidated-dependencies-and-integrations.md)**
    - Tổng hợp dependencies sau khi consolidation
    - Chiến lược migration
    - Tích hợp bên ngoài (VNPT eKYC, OpenAPI)
    - Best practices

## Hướng dẫn nhanh

### Cho nhà phát triển mới

1. Bắt đầu với [Hướng dẫn triển khai](deployment-guide.md)
2. Đọc [Tổng quan kiến trúc dự án](project-architecture-overview.md)
3. Xem lại [Cấu hình và thiết lập môi trường](configuration-and-environment-setup.md)
4. Khám phá [Luồng kinh doanh](business-flows-and-processes.md)

### Cho nhà phát triển frontend

1. Nghiên cứu [Trang ứng dụng và Components](application-pages-and-components.md)
2. Xem lại [Mô hình dữ liệu và cấu trúc](data-models-and-structures.md)
3. Triển khai với [Tài liệu API](api-documentation.md)
4. Áp dụng [Thực hành bảo mật tốt nhất](security-best-practices.md)

### Cho kỹ sư DevOps

1. Triển khai với [Hướng dẫn triển khai](deployment-guide.md)
2. Tối ưu với [Tối ưu hóa hiệu suất](performance-optimization.md)
3. Bảo mật với [Thực hành bảo mật tốt nhất](security-best-practices.md)
4. Giám sát với [Dependencies và tích hợp](dependencies-and-integrations.md)

### Cho migration từ dự án cũ

1. Xem [Ma trận ánh xạ nội dung](content-mapping-matrix.md) để hiểu mapping
2. Tham khảo [Ma trận ánh xạ dependencies](dependencies-mapping-matrix.md) cho migration dependencies
3. Áp dụng [Dependencies và tích hợp hợp nhất](consolidated-dependencies-and-integrations.md) cho implementation
4. Làm theo [Tổng quan kiến trúc dự án](project-architecture-overview.md) cho patterns mới

## Công nghệ và công cụ

### Stack công nghệ chính

- **Frontend Framework**: Next.js 15.5.4 với Turbopack
- **UI Library**: Radix UI + shadcn/ui
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand 5.0.8 + React Query 5.90.2
- **Form Handling**: react-hook-form + Zod
- **Internationalization**: next-intl
- **Testing**: Vitest + Playwright + Testing Library
- **Documentation**: Storybook 8.6.14

### Tích hợp bên ngoài

- **eKYC**: VNPT eKYC SDK v4.0.0
- **API**: OpenAPI với type-safe client
- **Analytics**: Vercel Analytics
- **Deployment**: Static export cho flexible hosting

### Công cụ phát triển

- **Code Quality**: Biome (thay thế ESLint + Prettier)
- **Git Hooks**: Husky + lint-staged
- **Type Safety**: TypeScript strict mode + Zod
- **Bundle Analysis**: webpack-bundle-analyzer
- **Performance**: Lighthouse + Web Vitals

## Quy trình đóng góp

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push đến branch (`git push origin feature/amazing-feature`)
5. Mở Pull Request

## Bảo trì tài liệu

- **Cập nhật thường xuyên**: Tài liệu nên được cập nhật với mỗi major release
- **Đóng góp cộng đồng**: Chào mừng đóng góp qua [Hướng dẫn đóng góp](../migration/new-project/contributing.md)
- **Báo cáo vấn đề**: Báo cáo vấn đề tài liệu qua GitHub issues
- **Kiểm soát phiên bản**: Phiên bản tài liệu theo project releases

## Hỗ trợ

- **Documentation Issues**: [GitHub Issues](link-to-issues)
- **Technical Questions**: [GitHub Discussions](link-to-discussions)
- **Security Issues**: [Security Policy](link-to-security-policy)

## Giấy phép

Dự án này được cấp phép theo [License Name](link-to-license).

---

**Lưu ý**: Tài liệu này được xây dựng theo quy trình 8-step comprehensive documentation process và được cập nhật thường xuyên để phản ánh trạng thái hiện tại của dự án DOP-FE.