# Flow Xử Lý Session ID trong Hệ Thống Consent

**Tài liệu:** Session ID Cookie Management
**Ngày tạo:** 2026-03-03
**Phiên bản:** 1.0

## Tổng Quan

Hệ thống consent sử dụng session ID được lưu trong cookie để theo dõi phiên làm việc của người dùng. Session ID này được tạo tự động, lưu trữ trong cookie với thời hạn 30 ngày, và được sử dụng để liên kết các hành động consent với phiên làm việc cụ thể.

## Kiến Trúc

### 1. Cookie Configuration

```typescript
Cookie Name: "consent_session_id"
Max-Age: 2592000 seconds (30 ngày)
Secure: true (chỉ HTTPS)
SameSite: Lax (bảo vệ CSRF, cho phép navigation từ external sites)
HttpOnly: false (JavaScript có thể truy cập)
Path: / (available toàn bộ application)
Format: UUID v4 (ví dụ: 550e8400-e29b-41d4-a716-446655440000)
```

### 2. Các Component Chính

```
┌─────────────────────────────────────────────────────────────┐
│                    useConsentSession Hook                    │
│  - Tạo/lấy session ID từ cookie                             │
│  - Module-level caching để tối ưu performance              │
│  - Migration từ localStorage (backward compatibility)       │
│  - Fallback to in-memory khi cookie bị disable             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Cookie Utility Layer                      │
│  src/lib/utils/cookie.ts                                    │
│  - setCookie(): Ghi cookie với options                      │
│  - getCookie(): Đọc cookie value                            │
│  - deleteCookie(): Xóa cookie                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Browser Cookie Storage                    │
│  - Automatic 30-day expiry                                  │
│  - Cross-tab synchronization                                │
│  - HTTPS-only transmission                                  │
└─────────────────────────────────────────────────────────────┘


## User Experience & Modal Behavior

### Modal Closing Restrictions

Để đảm bảo user phải đồng ý consent trước khi tiếp tục, các modal được cấu hình như sau:

**Main Consent Modal (bottom variant):**
- ❌ Không thể đóng bằng click outside
- ❌ Không thể đóng bằng ESC key
- ✅ Chỉ đóng khi user nhấn "Tiếp tục" (grant consent)

**Terms Detail Modal (center variant):**
- ❌ Không có nút X (close button)
- ❌ Không thể đóng bằng click outside
- ❌ Không thể đóng bằng ESC key
- ✅ Chỉ đóng khi user nhấn "Tiếp tục" (grant consent)

```typescript
// ConsentDialog với disableOutsideClose prop
<ConsentDialog
  open={open}
  onOpenChange={onOpenChange}
  title={t("form.title")}
  variant="bottom"
  disableOutsideClose={true}  // ← Prevent closing outside
>
  {/* Content */}
</ConsentDialog>

// Implementation trong ConsentDialog
const handleOpenChange = (newOpen: boolean) => {
  if (disableOutsideClose && !newOpen) {
    return; // Block closing
  }
  onOpenChange(newOpen);
};

// Block các interaction events
<DialogPrimitive.Content
  onEscapeKeyDown={(e) => {
    if (disableOutsideClose) e.preventDefault();
  }}
  onPointerDownOutside={(e) => {
    if (disableOutsideClose) e.preventDefault();
  }}
  onInteractOutside={(e) => {
    if (disableOutsideClose) e.preventDefault();
  }}
>
```

## Flow Chi Tiết

### 1. Khởi Tạo Session ID (First Visit)

```typescript
// Component sử dụng hook
const sessionId = useConsentSession();

// Flow bên trong hook:
┌─────────────────────────────────────────────────────────────┐
│ 1. Check module-level cache                                 │
│    → Nếu có cached value → return ngay lập tức              │
└─────────────────────────────────────────────────────────────┘
                              │ (cache miss)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Check cookie: getCookie("consent_session_id")            │
│    → Nếu có cookie → cache + return value                   │
└─────────────────────────────────────────────────────────────┘
                              │ (no cookie)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Check localStorage (migration)                           │
│    → Nếu có legacy data và còn valid (< 30 days)           │
│    → Migrate to cookie + cleanup localStorage              │
└─────────────────────────────────────────────────────────────┘
                              │ (no legacy data)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Generate new UUID v4                                     │
│    const newSessionId = uuidv4();                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Write to cookie                                          │
│    setCookie("consent_session_id", newSessionId, {         │
│      maxAge: 2592000,  // 30 days                          │
│      secure: true,                                          │
│      sameSite: "Lax",                                       │
│      path: "/"                                              │
│    })                                                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Cache + Return session ID                                │
│    cachedSessionId = newSessionId;                          │
│    setSessionId(newSessionId);                              │
└─────────────────────────────────────────────────────────────┘
```

### 2. Sử Dụng Session ID trong Consent Flow

```typescript
// ConsentModal.tsx - Session ID được tạo tự động khi component mount
const sessionId = useConsentSession();

// Flow 1: User nhấn "Tiếp tục" ở main modal
const handleGrantConsent = async () => {
  if (!consentPurpose?.latest_version_id) {
    setError("Missing required configuration");
    return;
  }

  // Session ID đã được tạo sẵn từ useConsentSession()
  const result = await grantConsent({
    userId,
    consentVersionId: consentPurpose.latest_version_id,
    sessionId,  // ← Session ID được gửi lên API
  });

  if (result) {
    setShowTermsModal(false);
    setOpen(false);  // ← Chỉ đóng modal khi consent thành công
    onSuccess?.(result.consentId);
  }
};

// Flow 2: User click vào link "điều khoản" → mở Terms Modal
const handleViewTerms = () => {
  setShowTermsModal(true);  // Session ID vẫn giữ nguyên
};

// Flow 3: User nhấn "Tiếp tục" ở Terms Modal
// → Gọi cùng handleGrantConsent() với session ID đã có

// API Request Body
{
  tenant_id: "...",
  lead_id: userId,
  consent_version_id: "...",
  session_id: sessionId,  // ← Liên kết consent với session
  source: "web"
}
```

### Integration Points

**Point 1: Main Consent Modal - Nhấn "Tiếp tục"**
```typescript
// ConsentForm component
<Button
  onClick={onGrant}  // → handleGrantConsent()
  disabled={isSubmitting}
  loading={isSubmitting}
>
  {isSubmitting ? t("loading") : t("continueButton")}
</Button>

// Trigger: User nhấn button
// Action: Grant consent với session ID
// Result: Modal đóng, consent được lưu
```

**Point 2: Terms Link - Xem Điều Khoản**
```typescript
// ConsentForm component
{t.rich("agreement", {
  link: (chunks) => (
    <button
      type="button"
      onClick={handleTermsClick}  // → handleViewTerms()
      className="font-medium text-[var(--consent-primary)] underline"
    >
      {chunks}
    </button>
  ),
})}

// Trigger: User click vào link "điều khoản"
// Action: Mở Terms Modal (session ID không thay đổi)
// Result: Hiển thị full terms content
```

**Point 3: Terms Modal - Nhấn "Tiếp tục"**
```typescript
// Terms Modal
<Button
  onClick={handleGrantConsent}  // → Same handler
  disabled={isSubmitting}
  loading={isSubmitting}
>
  {isSubmitting ? t("form.loading") : t("form.continueButton")}
</Button>

// Trigger: User nhấn button trong Terms Modal
// Action: Grant consent với session ID
// Result: Cả 2 modal đóng, consent được lưu
```

### Modal State Management

```typescript
// ConsentModal state
const [showTermsModal, setShowTermsModal] = useState(false);

// Main modal visibility
open && !showTermsModal  // ← Show main modal khi terms modal đóng

// Terms modal visibility
showTermsModal  // ← Show terms modal khi user click link

// Closing behavior
if (result) {
  setShowTermsModal(false);  // Close terms modal
  setOpen(false);            // Close main modal
  onSuccess?.(result.consentId);
}
```

### 3. Check Consent Status theo Session

```typescript
// page.tsx hoặc loan-info/page.tsx
const sessionId = useConsentSession();

// Query consent status cho session hiện tại
const { data: userConsent } = useUserConsent({
  sessionId: sessionId || undefined,
  enabled: !!sessionId
});

// Logic kiểm tra
if (!userConsent) {
  // Chưa có consent record cho session này → show modal
  openConsentModal({ consentPurposeId: "..." });
} else if (userConsent.consent_version_id !== latestVersionId) {
  // Version cũ → show modal để update
  openConsentModal({ consentPurposeId: "..." });
} else if (userConsent.action !== "grant") {
  // User đã decline hoặc revoke → show modal
  openConsentModal({ consentPurposeId: "..." });
}
```

## Tính Năng Đặc Biệt

### 1. Module-Level Caching

```typescript
// Biến cache ở module level (ngoài component)
let cachedSessionId: string | null = null;

// Lợi ích:
// - Giảm số lần đọc cookie (performance)
// - Consistent value across multiple hook calls
// - Tránh race conditions khi multiple components mount cùng lúc
```

### 2. Migration từ localStorage

```typescript
// Backward compatibility với version cũ
function migrateFromLocalStorage(): string | null {
  const legacySessionId = localStorage.getItem("consent_session_id");
  const legacyTimestamp = localStorage.getItem("consent_session_id_timestamp");
  
  if (!legacySessionId || !legacyTimestamp) {
    return null; // Không có legacy data
  }
  
  // Validate expiry (30 days)
  const daysDiff = (Date.now() - parseInt(legacyTimestamp)) / (1000 * 60 * 60 * 24);
  
  if (daysDiff > 30) {
    // Expired → cleanup + return null
    localStorage.removeItem("consent_session_id");
    localStorage.removeItem("consent_session_id_timestamp");
    return null;
  }
  
  // Migrate to cookie
  setCookie("consent_session_id", legacySessionId, { maxAge: 2592000, ... });
  
  // Cleanup localStorage
  localStorage.removeItem("consent_session_id");
  localStorage.removeItem("consent_session_id_timestamp");
  
  return legacySessionId;
}
```

### 3. Fallback to In-Memory Storage

```typescript
// Khi cookie write fails (cookies disabled, quota exceeded, etc.)
const success = setCookie("consent_session_id", newSessionId, { ... });

if (!success) {
  // Fallback: Vẫn cache session ID trong memory
  cachedSessionId = newSessionId;
  setSessionId(newSessionId);
  
  console.warn("Cookie write failed, using in-memory storage");
  
  // Lưu ý: Session ID sẽ mất khi refresh page
}
```

### 4. Cookie Support Detection

```typescript
export function isCookieSupported(): boolean {
  if (typeof document === "undefined") {
    return false; // SSR environment
  }
  
  try {
    // Test write + read
    const testKey = "__cookie_test__";
    document.cookie = `${testKey}=1; max-age=1`;
    const supported = document.cookie.indexOf(testKey) !== -1;
    
    // Cleanup
    document.cookie = `${testKey}=; max-age=0`;
    
    return supported;
  } catch (error) {
    return false;
  }
}

// Sử dụng
if (!isCookieSupported()) {
  console.warn("Cookies disabled, consent features may not work properly");
}
```

## Error Handling

### 1. Cookie Read Failures

```typescript
// getCookie() returns null on error
const cookieSession = getCookie("consent_session_id");

if (!cookieSession) {
  // Có thể do:
  // - Cookie không tồn tại
  // - Cookie bị corrupt
  // - Browser blocking cookies
  // - SSR environment
  
  // → Fallback: Generate new session ID
}
```

### 2. Cookie Write Failures

```typescript
const success = setCookie("consent_session_id", newSessionId, { ... });

if (!success) {
  // Có thể do:
  // - Cookies disabled by user
  // - Cookie quota exceeded (4KB limit per cookie)
  // - Browser privacy mode
  // - SSR environment
  
  // → Fallback: In-memory storage
  // → Dispatch "consent:error" event
  window.dispatchEvent(new CustomEvent("consent:error", {
    detail: { error: "Cookie write failed", fallbackActive: true }
  }));
}
```

### 3. Migration Failures

```typescript
try {
  const legacyData = localStorage.getItem("consent_session_id");
  // ... migration logic
} catch (error) {
  console.error("Migration failed:", error);
  
  // Cleanup corrupted data
  localStorage.removeItem("consent_session_id");
  localStorage.removeItem("consent_session_id_timestamp");
  
  // Generate new session ID
  return null;
}
```

## Security & Privacy

### 1. Cookie Security Attributes

```typescript
{
  secure: true,      // Chỉ truyền qua HTTPS
  sameSite: "Lax",   // Bảo vệ CSRF, cho phép navigation từ external sites
  httpOnly: false,   // JavaScript có thể truy cập (cần thiết cho client-side logic)
  path: "/",         // Available toàn bộ application
  maxAge: 2592000    // Auto-expire sau 30 ngày
}
```

### 2. GDPR Compliance

```typescript
// Clear all consent cookies (GDPR "right to be forgotten")
export function clearConsentSessionCookie(): void {
  deleteCookie("consent_session_id");
  cachedSessionId = null;
  
  console.info("Session cookie cleared", {
    timestamp: new Date().toISOString()
  });
}

// Sử dụng
function handleGDPRDeletion() {
  clearConsentSessionCookie();
  clearAllConsentCookies(); // Xóa cả consent state
}
```

### 3. Session ID Format

```typescript
// UUID v4 format: 8-4-4-4-12 hexadecimal
// Example: 550e8400-e29b-41d4-a716-446655440000

// Validation
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Version bits (3rd group, first char = '4')
// Variant bits (4th group, first char = 8, 9, a, or b)
```

## Performance Optimization

### 1. Module-Level Cache

```typescript
// Cache ở module level → shared across all hook instances
let cachedSessionId: string | null = null;

// Benefit:
// - First call: Read from cookie (slow)
// - Subsequent calls: Read from cache (instant)
// - Reduces cookie reads by ~90% in typical usage
```

### 2. Lazy Initialization

```typescript
// Session ID chỉ được tạo khi hook được gọi lần đầu
// Không tạo session ID cho users không tương tác với consent flow
```

### 3. Automatic Expiry

```typescript
// Cookie tự động expire sau 30 ngày
// Không cần manual timestamp checking
// Browser tự động cleanup expired cookies
```

## Testing

### 1. Unit Tests

```typescript
// src/hooks/consent/__tests__/use-consent-session.test.ts

describe("useConsentSession", () => {
  it("should generate new session ID when no cookie exists", async () => {
    const { result } = renderHook(() => useConsentSession());
    
    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });
    
    // Verify UUID v4 format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(result.current).toMatch(uuidRegex);
  });
  
  it("should retrieve existing session ID from cookie", async () => {
    const existingId = "550e8400-e29b-41d4-a716-446655440000";
    cookieStore["consent_session_id"] = existingId;
    
    const { result } = renderHook(() => useConsentSession());
    
    await waitFor(() => {
      expect(result.current).toBe(existingId);
    });
  });
  
  // ... 30+ test cases covering all scenarios
});
```

### 2. Property-Based Tests

```typescript
// src/hooks/consent/__tests__/use-consent-session.property.test.ts

// Test với random inputs để verify invariants
fc.assert(
  fc.property(fc.uuid(), (sessionId) => {
    // Session ID phải luôn là valid UUID v4
    expect(sessionId).toMatch(uuidRegex);
  })
);
```

## Troubleshooting

### 1. Session ID không được tạo

**Triệu chứng:** `sessionId` luôn là `null`

**Nguyên nhân:**
- Cookies bị disable trong browser
- SSR environment (server-side rendering)
- Cookie quota exceeded

**Giải pháp:**
```typescript
// Check cookie support
if (!isCookieSupported()) {
  console.warn("Cookies not supported");
  // Show user notification
  // Use alternative storage (localStorage, IndexedDB)
}
```

### 2. Session ID thay đổi sau mỗi refresh

**Triệu chứng:** Session ID mới được tạo mỗi lần reload page

**Nguyên nhân:**
- Cookie write failed (fallback to in-memory)
- Cookie bị block bởi browser privacy settings
- Incorrect cookie path

**Giải pháp:**
```typescript
// Check console logs
// [Consent Session] Cookie write failed, using in-memory storage

// Verify cookie attributes
const success = setCookie("consent_session_id", sessionId, {
  path: "/",  // ← Phải match với path khi read
  secure: true,
  sameSite: "Lax"
});
```

### 3. Migration không hoạt động

**Triệu chứng:** Legacy localStorage data không được migrate

**Nguyên nhân:**
- Timestamp expired (> 30 days)
- Invalid timestamp format
- localStorage access denied

**Giải pháp:**
```typescript
// Check console logs
// [Consent Session] Legacy session expired or invalid

// Manual cleanup
localStorage.removeItem("consent_session_id");
localStorage.removeItem("consent_session_id_timestamp");
```

## Best Practices

### 1. Luôn check session ID trước khi sử dụng

```typescript
const sessionId = useConsentSession();

// ✅ Good: Check null
if (sessionId) {
  await grantConsent({ sessionId, ... });
}

// ❌ Bad: Không check null
await grantConsent({ sessionId, ... }); // sessionId có thể null
```

### 2. Sử dụng enabled flag trong queries

```typescript
const { data: userConsent } = useUserConsent({
  sessionId: sessionId || undefined,
  enabled: !!sessionId  // ← Chỉ query khi có session ID
});
```

### 3. Handle loading state

```typescript
const sessionId = useConsentSession();

if (!sessionId) {
  return <div>Initializing session...</div>;
}

// Proceed with consent flow
```

### 4. Clear session khi cần thiết

```typescript
// Logout
function handleLogout() {
  clearConsentSessionCookie();
  clearAllConsentCookies();
  // ... other logout logic
}

// GDPR deletion
function handleDeleteAccount() {
  clearConsentSessionCookie();
  clearAllConsentCookies();
  // ... delete user data
}
```

## Monitoring & Logging

### 1. Console Logs

```typescript
// Session creation
[Consent Session] Created new session ID
{
  sessionId: "550e8400-e29b-41d4-a716-446655440000",
  timestamp: "2026-03-03T10:30:00.000Z"
}

// Session retrieval
[Consent Session] Retrieved existing session from cookie
{
  sessionId: "550e8400-e29b-41d4-a716-446655440000",
  timestamp: "2026-03-03T10:30:00.000Z"
}

// Migration
[Consent Session] Successfully migrated session ID from localStorage to cookie
{
  source: "localStorage",
  destination: "cookie",
  sessionId: "550e8400-e29b-41d4-a716-446655440000",
  timestamp: "2026-03-03T10:30:00.000Z"
}

// Errors
[Consent Session] Cookie write failed, using in-memory storage
{
  fallbackActive: true,
  timestamp: "2026-03-03T10:30:00.000Z"
}
```

### 2. Custom Events

```typescript
// Listen to consent errors
window.addEventListener("consent:error", (event) => {
  const { error, cookieName, fallbackActive } = event.detail;
  
  // Send to monitoring service
  analytics.track("consent_error", {
    error,
    cookieName,
    fallbackActive
  });
});
```

## Tài Liệu Tham Khảo

### Files

- `src/hooks/consent/use-consent-session.ts` - Hook implementation
- `src/hooks/consent/__tests__/use-consent-session.test.ts` - Unit tests
- `src/lib/utils/cookie.ts` - Cookie utilities
- `src/components/consent/ConsentModal.tsx` - Usage example
- `src/store/use-consent-store.ts` - Consent state management

### Related Documentation

- [Consent System Overview](./README.md)
- [Consent Flow Navigation](./flow-navigation-fix.md)
- [GDPR Compliance](./MIGRATION_CHECKLIST.md)

### External Resources

- [UUID v4 Specification](https://tools.ietf.org/html/rfc4122)
- [HTTP Cookie Specification](https://tools.ietf.org/html/rfc6265)
- [SameSite Cookie Attribute](https://web.dev/samesite-cookies-explained/)
