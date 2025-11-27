# Prompt Template Tạo Documentation Cho Frontend Project

## Giới Thiệu

Đây là prompt template chi tiết để tạo bộ documentation hoàn chỉnh cho frontend project theo quy trình 8-step. Prompt này được thiết kế để giúp bạn tạo documentation chất lượng cao tương tự như project finzone-frontend.

### Quy Trình 8-Step Documentation

1. **Project Architecture Overview** - Tổng quan về kiến trúc project
2. **Business Flows and Processes** - Các luồng nghiệp vụ và quy trình
3. **Data Models and Structures** - Mô hình dữ liệu và cấu trúc
4. **Dependencies and Integrations** - Phụ thuộc và tích hợp
5. **Application Pages and Components** - Các trang và component của ứng dụng
6. **Configuration and Environment Setup** - Cấu hình và thiết lập môi trường
7. **Application Replication Guide** - Hướng dẫn sao chép ứng dụng
8. **Additional Documentation** - Documentation bổ sung (nếu cần)

---

## Hướng Dẫn Sử Dụng Prompt

### Bước 1: Cung Cấp Thông Tin Project

Bạn cần cung cấp thông tin cơ bản về project của mình. Hãy trả lời các câu hỏi sau:

**Thông Tin Chung:**
- Tên project:
- Loại project (React, Vue, Angular, Next.js, etc.):
- Mô tả ngắn gọn về project:
- Ngôn ngữ lập trình chính:
- Framework/Library chính:

**Thông Tin Kỹ Thuật:**
- State management (Redux, Zustand, Vuex, etc.):
- Styling approach (CSS Modules, Styled Components, Tailwind, etc.):
- Build tools (Webpack, Vite, etc.):
- Testing framework (Jest, Cypress, etc.):
- Deployment platform (Vercel, Netlify, AWS, etc.):

**Thông Tin Nghiệp Vụ:**
- Lĩnh vực hoạt động (E-commerce, Finance, Education, etc.):
- Người dùng mục tiêu:
- Các tính năng chính:
- Các bên thứ ba tích hợp (payment gateways, analytics, etc.):

### Bước 2: Chuẩn Bị Source Code

Để AI có thể phân tích và tạo documentation chính xác, hãy đảm bảo:

1. **Cung cấp access đến source code** (GitHub repository, local files, hoặc code snippets)
2. **Đảm bảo file cấu hình có sẵn** (package.json, tsconfig.json, etc.)
3. **Cung cấp cấu trúc thư mục** chính của project
4. **Chuẩn bị các file config quan trọng** (.env.example, webpack.config.js, etc.)

### Bước 3: Chọn Template Phù Hợp

Dựa vào loại project của bạn, prompt sẽ tự động điều chỉnh:

- **React Project**: Tập trung vào components, hooks, state management
- **Vue Project**: Tập trung vào components, composables, Vue ecosystem
- **Angular Project**: Tập trung vào modules, services, Angular architecture
- **Next.js Project**: Bao gồm cả SSR, routing, API routes
- **Nuxt.js Project**: Tập trung vào SSR, auto-imports, Nuxt modules

---

## Template Chi Tiết Cho Từng Step

### Step 1: Project Architecture Overview

**Yêu cầu thông tin:**
- Technology stack và version
- Directory structure và purpose
- Architecture patterns được sử dụng
- Key design decisions
- Performance considerations

**Template câu hỏi:**
```
Hãy phân tích kiến trúc của project [TÊN_PROJECT] và tạo documentation bao gồm:

1. **Technology Stack**:
   - Framework và version chính
   - Libraries quan trọng và version
   - Build tools và configuration
   - Testing framework

2. **Directory Structure**:
   - Mô tả cấu trúc thư mục chính
   - Giải thích purpose của từng thư mục
   - Các file quan trọng trong mỗi thư mục

3. **Architecture Patterns**:
   - Design patterns được áp dụng
   - State management approach
   - Component organization
   - Data flow architecture

4. **Key Decisions**:
   - Lý do chọn technology stack
   - Các quyết định kiến trúc quan trọng
   - Trade-offs được xem xét

5. **Performance Considerations**:
   - Optimization strategies
   - Bundle size considerations
   - Lazy loading implementation
   - Caching strategies
```

**Output format mong muốn:**
```markdown
# [TÊN_PROJECT] Project Architecture Overview

## Technology Stack

### Core Frameworks and Languages
- **Framework**: [Framework] [Version]
- **Language**: [Language] [Version]
- **Build Tools**: [Tools]

### UI and Styling
- **Styling**: [Styling approach]
- **UI Library**: [UI library nếu có]
- **CSS Framework**: [CSS framework]

### State Management and Utilities
- **State Management**: [State management library]
- **HTTP Client**: [HTTP client]
- **Other Utilities**: [Các utilities khác]

## Directory Structure and Purposes

### Root Configuration
```
[Cấu trúc thư mục với giải thích]
```

### App Router/Components
```
[Cấu trúc components/pages]
```

## Key Observations
- [Các quan sát quan trọng về project]
```

### Step 2: Business Flows and Processes

**Yêu cầu thông tin:**
- User journeys chính
- Authentication flows
- Data input processes
- API interactions
- Error handling

**Template câu hỏi:**
```
Hãy phân tích các luồng nghiệp vụ của project [TÊN_PROJECT] và tạo documentation bao gồm:

1. **User Journeys**:
   - Các user flow chính
   - Steps trong mỗi flow
   - Entry và exit points

2. **Authentication Flows**:
   - Login/registration process
   - Session management
   - Permission handling

3. **Data Input and Transaction Flows**:
   - Form submission processes
   - Validation rules
   - Data transformation

4. **API Endpoints**:
   - Các API endpoints chính
   - Request/response formats
   - Error handling

5. **Error Handling**:
   - Error codes và messages
   - User feedback mechanisms
   - Recovery processes
```

### Step 3: Data Models and Structures

**Yêu cầu thông tin:**
- Data models chính
- State management structure
- API payloads
- Validation schemas
- Data relationships

**Template câu hỏi:**
```
Hãy phân tích các mô hình dữ liệu của project [TÊN_PROJECT] và tạo documentation bao gồm:

1. **Core Data Models**:
   - Interfaces/types chính
   - Properties và types
   - Validation rules

2. **State Management**:
   - Store structure
   - Actions và reducers
   - State organization

3. **API Payloads**:
   - Request/response formats
   - Data transformation
   - Error responses

4. **Data Relationships**:
   - Model relationships
   - Foreign keys và references
   - Data flow diagrams
```

### Step 4: Dependencies and Integrations

**Yêu cầu thông tin:**
- NPM dependencies và purpose
- External services và APIs
- Third-party integrations
- Security considerations

**Template câu hỏi:**
```
Hãy phân tích dependencies và integrations của project [TÊN_PROJECT] và tạo documentation bao gồm:

1. **NPM Dependencies**:
   - Production dependencies
   - Development dependencies
   - Purpose của từng package

2. **External Integrations**:
   - Third-party services
   - API endpoints
   - Authentication methods

3. **API Management**:
   - API configuration
   - Error codes
   - Rate limiting

4. **Security Considerations**:
   - Authentication methods
   - Data protection
   - CORS configuration
```

### Step 5: Application Pages and Components

**Yêu cầu thông tin:**
- Page structure và routing
- Component hierarchy
- Reusable components
- Navigation structure

**Template câu hỏi:**
```
Hãy phân tích pages và components của project [TÊN_PROJECT] và tạo documentation bao gồm:

1. **Pages**:
   - Route structure
   - Page components
   - Main features của mỗi page

2. **Components**:
   - Reusable components
   - Component hierarchy
   - Props và interfaces

3. **Module Hierarchy**:
   - Feature modules
   - Sub-components
   - Shared components

4. **Navigation Structure**:
   - Desktop navigation
   - Mobile navigation
   - Routing logic
```

### Step 6: Configuration and Environment Setup

**Yêu cầu thông tin:**
- Configuration files
- Environment variables
- Setup instructions
- Development tools

**Template câu hỏi:**
```
Hãy phân tích configuration và setup của project [TÊN_PROJECT] và tạo documentation bao gồm:

1. **Configuration Files**:
   - File purposes
   - Main settings
   - Build configuration

2. **Environment Variables**:
   - Development variables
   - Production variables
   - Security considerations

3. **Setup Instructions**:
   - Installation steps
   - Development server
   - Build process

4. **Development Tools**:
   - Linting và formatting
   - Testing setup
   - Debug configuration
```

### Step 7: Application Replication Guide

**Yêu cầu thông tin:**
- Prerequisites
- Step-by-step setup
- Troubleshooting
- Deployment options

**Template câu hỏi:**
```
Hãy tạo hướng dẫn replication cho project [TÊN_PROJECT] bao gồm:

1. **Prerequisites**:
   - System requirements
   - Required software
   - Account requirements

2. **Detailed Steps**:
   - Clone và setup
   - Configuration
   - Running development

3. **Verification Steps**:
   - Functional testing
   - Performance testing
   - Security testing

4. **Troubleshooting**:
   - Common issues
   - Solutions
   - Debug techniques
```

### Step 8: Additional Documentation

**Tùy chọn dựa trên nhu cầu:**
- API documentation
- Contributing guidelines
- Deployment guides
- Performance optimization

---

## Best Practices Cho Frontend Documentation

### 1. Structure và Organization
- Sử dụng consistent naming convention
- Organize theo logical hierarchy
- Include table of contents
- Use cross-references

### 2. Content Quality
- Cung cấp concrete examples
- Include code snippets
- Add screenshots/diagrams khi cần
- Keep examples up-to-date

### 3. Technical Accuracy
- Verify code examples
- Include version information
- Document edge cases
- Update regularly

### 4. User Experience
- Write for different skill levels
- Include troubleshooting sections
- Provide quick start guides
- Use clear, concise language

---

## Examples và Templates

### Example 1: React Project Documentation

```markdown
# E-commerce Frontend Project Architecture Overview

## Technology Stack

### Core Frameworks and Languages
- **React**: 18.2.0
- **TypeScript**: 5.0.4
- **Vite**: 4.4.0

### UI and Styling
- **Styling**: CSS Modules
- **UI Library**: Ant Design
- **CSS Framework**: Tailwind CSS 3.3.0

## Directory Structure and Purposes

### Source Code
```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── services/           # API services
├── utils/              # Utility functions
└── types/              # TypeScript type definitions
```

## Key Features
- Product catalog với filtering và sorting
- Shopping cart với persistent state
- User authentication và profile management
- Payment integration với multiple providers
```

### Example 2: Vue Project Documentation

```markdown
# Blog Platform Project Architecture Overview

## Technology Stack

### Core Frameworks and Languages
- **Vue.js**: 3.3.0
- **TypeScript**: 5.0.4
- **Nuxt.js**: 3.8.0

### State Management and Utilities
- **State Management**: Pinia 2.1.0
- **HTTP Client**: Axios 1.6.0
- **Vue Router**: 4.2.0

## Directory Structure and Purposes

### Application Structure
```
├── components/          # Reusable components
├── pages/              # Nuxt pages
├── composables/         # Vue composables
├── stores/             # Pinia stores
├── middleware/         # Nuxt middleware
└── plugins/            # Vue plugins
```

## Key Features
- Markdown-based blog posts với syntax highlighting
- Category và tag system
- Comment system với moderation
- SEO optimization với meta tags
```

---

## Tips Để Tạo Documentation Hiệu Quả

### 1. Planning Phase
- Identify target audience
- Define scope của documentation
- Create outline trước khi viết
- Gather all necessary information

### 2. Writing Phase
- Start với high-level overview
- Provide detailed examples
- Include troubleshooting sections
- Use consistent formatting

### 3. Review Phase
- Technical accuracy check
- Peer review process
- User testing của examples
- Update based on feedback

### 4. Maintenance
- Regular updates với code changes
- Version control của documentation
- User feedback incorporation
- Performance monitoring

---

## Final Checklist

Trước khi hoàn thành documentation, hãy kiểm tra:

### Content Quality
- [ ] All 8 steps được cover
- [ ] Examples là current và working
- [ ] Technical terms được giải thích
- [ ] Code snippets được formatted correctly

### Structure và Organization
- [ ] Table of contents hoàn chỉnh
- [ ] Logical flow của thông tin
- [ ] Cross-references được include
- [ ] Index section được provide

### Technical Accuracy
- [ ] Version numbers được specify
- [ ] Dependencies được list correctly
- [ ] Configuration examples work
- [ ] Security considerations được include

### User Experience
- [ ] Quick start guide available
- [ ] Troubleshooting section comprehensive
- [ ] Multiple skill levels addressed
- [ ] Contact information được provide

---

## Sử Dụng Prompt Template Này

1. **Copy toàn bộ prompt** vào AI chat của bạn
2. **Replace placeholders** với thông tin project của bạn
3. **Cung cấp source code** hoặc access để AI phân tích
4. **Review output** và điều chỉnh nếu cần
5. **Iterate** cho đến khi hài lòng với kết quả

Prompt template này được thiết kế để tạo documentation comprehensive và professional cho bất kỳ frontend project nào. Hãy adapt dựa trên specific needs của project bạn!