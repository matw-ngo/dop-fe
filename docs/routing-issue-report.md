# Routing Issue Report: DynamicLoanForm Navigation

**Date:** 2026-03-11  
**Author:** Investigation Report  
**Status:** 🔴 Critical Issue

---

## 1. Vấn đề (Problem)

### 1.1 Hiện tượng
Khi người dùng nhấn nút "Tiếp tục" trong `DynamicLoanForm`, ứng dụng redirect sang các route không tồn tại (404 Not Found).

**Ví dụ cụ thể:**
- User ở trang `/` (homepage)
- Nhấn "Tiếp tục" → redirect sang `/consent` → **404 Error**

### 1.2 Root Cause
Test profiles trong MSW (Mock Service Worker) định nghĩa các `step.page` không tương ứng với routes thực tế trong Next.js app.

**Code gây lỗi:**
```typescript
// src/__tests__/msw/profiles/default.ts
createConsentStep(2, {
  page: "/consent",  // ❌ Route này không tồn tại
})
```

**Logic routing:**
```typescript
// src/components/loan-application/DynamicLoanForm.tsx (line 320)
const nextStep = flowData.steps[currentStepIndex + 1];
if (nextStep) {
  router.push(nextStep.page);  // ← Redirect đến page không tồn tại
}
```

### 1.3 Phạm vi ảnh hưởng

#### Routes không tồn tại (404):
| Profile          | Step | Page Route           | Status |
| ---------------- | ---- | -------------------- | ------ |
| default          | 2    | `/consent`           | ❌ 404  |
| default          | 3    | `/verify-otp`        | ❌ 404  |
| default          | 4    | `/financial-info`    | ❌ 404  |
| default          | 5    | `/submit`            | ❌ 404  |
| otp-at-step-3    | 1    | `/basic-info`        | ❌ 404  |
| otp-at-step-3    | 2    | `/consent`           | ❌ 404  |
| otp-at-step-3    | 4    | `/financial-info`    | ❌ 404  |
| otp-at-step-3    | 5    | `/final-submit`      | ❌ 404  |
| no-otp-flow      | 1    | `/personal-info`     | ❌ 404  |
| no-otp-flow      | 2    | `/consent`           | ❌ 404  |
| no-otp-flow      | 3    | `/financial-info`    | ❌ 404  |
| no-otp-flow      | 4    | `/additional-info`   | ❌ 404  |
| no-otp-flow      | 5    | `/submit`            | ❌ 404  |
| otp-at-step-1    | 1    | `/verify-phone`      | ❌ 404  |
| otp-at-step-1    | 2    | `/personal-info`     | ❌ 404  |
| otp-at-step-1    | 3    | `/financial-info`    | ❌ 404  |
| otp-at-step-1    | 4    | `/additional-info`   | ❌ 404  |
| otp-at-step-1    | 5    | `/submit`            | ❌ 404  |
| otp-at-last-step | 1    | `/personal-info`     | ❌ 404  |
| otp-at-last-step | 2    | `/consent`           | ❌ 404  |
| otp-at-last-step | 3    | `/financial-info`    | ❌ 404  |
| otp-at-last-step | 4    | `/additional-info`   | ❌ 404  |
| otp-at-last-step | 5    | `/verify-and-submit` | ❌ 404  |

#### Routes tồn tại (OK):
| Route                 | Status |
| --------------------- | ------ |
| `/` (index)           | ✅ OK   |
| `/loan-info`          | ✅ OK   |
| `/loan-wizard`        | ✅ OK   |
| `/user-onboarding`    | ✅ OK   |
| `/onboarding-success` | ✅ OK   |

### 1.4 Impact
- **User Experience:** Broken navigation flow, users không thể hoàn thành form
- **Testing:** Tất cả test profiles đều bị ảnh hưởng
- **Development:** Developers không thể test multi-step flow
- **Production Risk:** Nếu API trả về `step.page` không tồn tại → production app sẽ bị lỗi tương tự

---

## 2. Motivation (Tại sao cần fix)

### 2.1 Business Impact
- **Conversion Rate:** Users không thể hoàn thành loan application → mất leads
- **User Trust:** 404 errors làm giảm độ tin cậy của platform
- **Support Cost:** Tăng số lượng support tickets về navigation issues

### 2.2 Technical Debt
- **Inconsistency:** Test data không phản ánh production behavior
- **Maintainability:** Khó debug khi test data khác với production
- **Scalability:** Không thể thêm steps mới mà không tạo routes tương ứng

### 2.3 Development Velocity
- **Blocked Testing:** Không thể test end-to-end flow
- **Manual Testing:** Phải test manually thay vì automated tests
- **Confidence:** Developers không tự tin deploy vì test không reliable

---

## 3. Proposal (Giải pháp đề xuất)

### Option 1: Dynamic Catch-All Route (Recommended ⭐)

**Ưu điểm:**
- ✅ Không cần tạo route cho mỗi step
- ✅ Flexible: API có thể định nghĩa bất kỳ `step.page` nào
- ✅ Backward compatible: Không break existing code
- ✅ Scalable: Dễ thêm steps mới

**Nhược điểm:**
- ⚠️ SEO: Catch-all routes khó optimize cho SEO
- ⚠️ Type Safety: Khó type-check page params

**Implementation:**

```typescript
// src/app/[locale]/[...slug]/page.tsx
"use client";

import { DynamicLoanForm } from "@/components/loan-application/DynamicLoanForm";
import { useParams } from "next/navigation";

export default function DynamicStepPage() {
  const params = useParams();
  const slug = params.slug as string[];
  const page = `/${slug.join("/")}`;

  return <DynamicLoanForm page={page} />;
}
```

**Effort:** 🟢 Low (1-2 hours)

---

### Option 2: Fixed Routes for Each Step

**Ưu điểm:**
- ✅ Type Safety: Mỗi route có type riêng
- ✅ SEO Friendly: Mỗi route có metadata riêng
- ✅ Clear Structure: Dễ hiểu route hierarchy

**Nhược điểm:**
- ❌ High Maintenance: Phải tạo route cho mỗi step
- ❌ Inflexible: API không thể thay đổi `step.page` tự do
- ❌ Code Duplication: Nhiều routes render cùng component

**Implementation:**

```typescript
// src/app/[locale]/consent/page.tsx
export default function ConsentPage() {
  return <DynamicLoanForm page="/consent" />;
}

// src/app/[locale]/verify-otp/page.tsx
export default function VerifyOtpPage() {
  return <DynamicLoanForm page="/verify-otp" />;
}

// ... repeat for each step
```

**Effort:** 🔴 High (1-2 days, 10+ files)

---

### Option 3: Update Test Profiles to Use Existing Routes

**Ưu điểm:**
- ✅ Quick Fix: Chỉ cần update test data
- ✅ No Code Changes: Không thay đổi app logic
- ✅ Safe: Không risk breaking production

**Nhược điểm:**
- ❌ Limited Testing: Không test được multi-step navigation
- ❌ Unrealistic: Test data không giống production
- ❌ Temporary: Không giải quyết root cause

**Implementation:**

```typescript
// src/__tests__/msw/profiles/default.ts
steps: [
  createPersonalInfoStep(1, { page: "/" }),
  createConsentStep(2, { page: "/loan-info" }),
  createOTPStep(3, { page: "/loan-wizard" }),
  createFinancialInfoStep(4, { page: "/user-onboarding" }),
  createPersonalInfoStep(5, { page: "/onboarding-success" }),
]
```

**Effort:** 🟢 Low (30 minutes)

---

## 4. Recommendation

### Recommended Approach: **Option 1 (Dynamic Catch-All Route)**

**Rationale:**
1. **Flexibility:** API-driven navigation là core requirement của DOP
2. **Scalability:** Dễ thêm steps mới mà không cần code changes
3. **Low Effort:** Chỉ cần 1 file mới
4. **Future-Proof:** Support dynamic flows từ admin panel

**Implementation Plan:**

#### Phase 1: Create Dynamic Route (1 hour)
```typescript
// src/app/[locale]/[...slug]/page.tsx
"use client";

import { DynamicLoanForm } from "@/components/loan-application/DynamicLoanForm";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";

export default function DynamicStepPage() {
  const params = useParams();
  const slug = params.slug as string[];
  
  // Validate slug exists
  if (!slug || slug.length === 0) {
    notFound();
  }
  
  const page = `/${slug.join("/")}`;

  return <DynamicLoanForm page={page} />;
}
```

#### Phase 2: Add Route Priority (30 minutes)
Update `middleware.ts` để ensure existing routes có priority cao hơn catch-all:

```typescript
// src/middleware.ts
const publicRoutes = [
  "/",
  "/loan-info",
  "/loan-wizard",
  "/user-onboarding",
  "/onboarding-success",
  // ... existing routes
];
```

#### Phase 3: Update Test Profiles (30 minutes)
Verify tất cả test profiles hoạt động với dynamic route.

#### Phase 4: Add Validation (1 hour)
Thêm validation để ensure `step.page` hợp lệ:

```typescript
// src/components/loan-application/DynamicLoanForm.tsx
useEffect(() => {
  if (!indexStep) {
    console.error(`[DynamicLoanForm] Invalid page: "${page}"`);
    // Optionally redirect to home or show error
  }
}, [indexStep, page]);
```

**Total Effort:** 3 hours

---

## 5. Testing Strategy

### 5.1 Unit Tests
- Test dynamic route renders correct component
- Test page param parsing
- Test invalid page handling

### 5.2 Integration Tests
- Test navigation between steps
- Test OTP flow with dynamic routes
- Test consent modal with dynamic routes

### 5.3 E2E Tests
- Test complete loan application flow
- Test all test profiles
- Test 404 handling for truly invalid routes

---

## 6. Risks & Mitigation

### Risk 1: SEO Impact
**Mitigation:** Add metadata generation for dynamic routes

```typescript
export async function generateMetadata({ params }) {
  const page = `/${params.slug.join("/")}`;
  return {
    title: `Loan Application - ${page}`,
    robots: "noindex", // Dynamic steps shouldn't be indexed
  };
}
```

### Risk 2: Route Conflicts
**Mitigation:** Ensure catch-all route has lowest priority by placing it after specific routes in folder structure

### Risk 3: Invalid Pages
**Mitigation:** Add validation in `DynamicLoanForm` to check if step exists before rendering

---

## 7. Alternatives Considered

### Alternative 1: Single Page Application (SPA)
Render all steps on one page without routing.

**Rejected because:**
- Breaks browser back/forward navigation
- No deep linking support
- Poor UX for long forms

### Alternative 2: Query Parameters
Use query params instead of routes: `/loan-application?step=consent`

**Rejected because:**
- Less SEO friendly
- Harder to share specific steps
- Not RESTful

---

## 8. Success Metrics

- ✅ Zero 404 errors in test profiles
- ✅ All E2E tests passing
- ✅ Navigation flow works for all profiles
- ✅ No regression in existing functionality
- ✅ Development velocity improved (faster to add new steps)

---

## 9. Next Steps

1. **Review & Approval:** Team review this proposal
2. **Implementation:** Follow Phase 1-4 plan
3. **Testing:** Run full test suite
4. **Documentation:** Update routing documentation
5. **Deployment:** Deploy to staging → production

---

## Appendix A: Current Route Structure

```
src/app/[locale]/
├── page.tsx                    # / (homepage)
├── loan-info/
│   └── page.tsx               # /loan-info
├── loan-wizard/
│   └── page.tsx               # /loan-wizard
├── user-onboarding/
│   └── page.tsx               # /user-onboarding
├── onboarding-success/
│   └── page.tsx               # /onboarding-success
└── [MISSING ROUTES]
    ├── consent/               # ❌ Not exists
    ├── verify-otp/            # ❌ Not exists
    ├── financial-info/        # ❌ Not exists
    └── ... (10+ missing)
```

## Appendix B: Affected Files

### Files to Create (Option 1):
- `src/app/[locale]/[...slug]/page.tsx`

### Files to Update (Option 1):
- `src/middleware.ts` (optional, for route priority)
- `src/components/loan-application/DynamicLoanForm.tsx` (add validation)

### Files to Update (Option 3):
- `src/__tests__/msw/profiles/default.ts`
- `src/__tests__/msw/profiles/otp-at-step-3.ts`
- `src/__tests__/msw/profiles/no-otp-flow.ts`
- `src/__tests__/msw/profiles/otp-at-step-1.ts`
- `src/__tests__/msw/profiles/otp-at-last-step.ts`
- `src/__tests__/msw/profiles/with-ekyc.ts`

---

**End of Report**
