# 🔥 zo.roast Code Review Report: eKYC API Integration

**Feature Branch**: `001-ekyc-api-integration`  
**Audited By**: The Sr. Principal Engineer from Hell  
**Date**: 2026-01-12T17:45:00Z  
**Files Audited**: 13 files (5 implementation, 4 test, 1 performance, 3 supporting)

---

## 🎯 SCORCHED EARTH SCORE: 6.5/10

**Verdict**: **Barely Acceptable** - This code works, but it's held together by duct tape and prayers. 

---

## 📋 AUDIT & ROAST CHECKLIST

### 1. TypeScript Violations & Type Safety

#### 🔴 CRITICAL: Type Assertions and `any` Usage

**File**: [`src/lib/ekyc/ekyc-api-mapper.ts:84`](src/lib/ekyc/ekyc-api-mapper.ts:84)
```typescript
const extendedResponse = ekycResponse as ExtendedEkycResponse;
```
**Roast**: Oh, look! A type assertion! Because why bother with proper type safety when you can just CAST YOUR PROBLEMS AWAY. This `as` casting is lazy and defeats the entire purpose of TypeScript. You're extending the type at runtime? Bold move for a statically-typed language.

**File**: [`src/lib/ekyc/ekyc-api-mapper.ts:382`](src/lib/ekyc/ekyc-api-mapper.ts:382)
```typescript
return {
  img_front: (data as any).base64_doc_img_front || "",
  img_back: (data as any).base64_doc_img_back || "",
};
```
**Roast**: `(data as any)`?! Really?! In 2026? You might as well write JavaScript at this point. This is an insult to the TypeScript gods. What's next? `@ts-ignore` everywhere? This is how runtime errors are born.

**File**: [`src/lib/ekyc/validators.ts:266`](src/lib/ekyc/validators.ts:266)
```typescript
const extendedResponse = ekycResponse as any;
```
**Roast**: Another `as any`! You people are obsessed. This is the fourth Circle of TypeScript Hell.

#### 🟡 MODERATE: Missing Type Guards

**File**: [`src/lib/ekyc/audit-logger.ts:195`](src/lib/ekyc/audit-logger.ts:195)
```typescript
metadata: metadata ? sanitizeObject(metadata) as Record<string, unknown> : undefined,
```
**Roast**: Type assertion on sanitized data? If your sanitization function is properly typed, you shouldn't need to assert. This screams "I don't know what my function returns."

---

### 2. Performance Issues

#### 🟢 GOOD: Cache Configuration
**File**: [`src/hooks/use-ekyc-config.ts:44-45`](src/hooks/use-ekyc-config.ts:44)
```typescript
staleTime: 5 * 60 * 1000, // 5 minutes cache TTL
gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
```
**Praise**: Finally, someone understands caching. Reasonable TTL values.

#### 🟡 MODERATE: Unnecessary Re-renders
**File**: [`src/hooks/use-ekyc-config.ts:48-56`](src/hooks/use-ekyc-config.ts:48)
```typescript
// Log cache status using useEffect
useEffect(() => {
  if (query.isSuccess && query.data) {
    // If data is fetched from cache (isFetching is false but we have data), it's a cache hit
    if (!query.isFetching && query.isFetched) {
      // Data was served from cache
    }
  }
}, [query.isSuccess, query.data, query.isFetching, query.isFetched]);
```
**Roast**: What is this?! An entire useEffect that does NOTHING? There's a comment block inside but no actual logic. This is dead code that runs on every render. DELETE IT. Or implement the cache analytics you're pretending to track. This is amateur hour.

#### 🔴 CRITICAL: O(n²) Loop in Session Cleanup
**File**: [`src/lib/ekyc/session-manager.ts:346-369`](src/lib/ekyc/session-manager.ts:346)
```typescript
export function cleanupExpiredSessions(): number {
  let cleanedCount = 0;

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    // ... parsing and checking
  }
  return cleanedCount;
}
```
**Roast**: Iterating through localStorage with a numerical index? `localStorage.length` can include keys from OTHER parts of your app! Every time you call this, you're scanning potentially HUNDREDS of unrelated localStorage keys. This is O(n) where n is ALL localStorage keys, not just eKYC sessions. For a cleanup function that should be rare, this is sloppy. At least filter by key prefix first.

#### 🟢 GOOD: Exponential Backoff Implementation
**File**: [`src/hooks/use-submit-ekyc-result.ts:53-58`](src/hooks/use-submit-ekyc-result.ts:53)
```typescript
function exponentialBackoff(attempt: number): number {
  const delay = Math.min(Math.pow(2, attempt) * 1000, 10000);
  return delay + Math.random() * 500; // jitter
}
```
**Praise**: Proper exponential backoff with jitter. This is how you prevent thundering herd. Someone actually read a distributed systems blog post.

---

### 3. Error Handling

#### 🔴 CRITICAL: Silent Failures in localStorage
**File**: [`src/lib/ekyc/session-manager.ts:93-97`](src/lib/ekyc/session-manager.ts:93)
```typescript
try {
  localStorage.setItem(getStorageKey(leadId), JSON.stringify(session));
} catch (error) {
  console.error("[Session] Failed to store session:", error);
}
```
**Roast**: You catch the error, log it, and THEN RETURN THE SESSION OBJECT ANYWAY?! The session wasn't saved but you pretend it was! This is a lie. Callers will think the session is persisted but it's not. Return `null` or throw. This is how you get "it works on my machine" bugs.

**File**: [`src/lib/ekyc/session-manager.ts:142-153`](src/lib/ekyc/session-manager.ts:142)
```typescript
session.status = newStatus;
session.updatedAt = new Date().toISOString();

try {
  localStorage.setItem(getStorageKey(leadId), JSON.stringify(session));
} catch (error) {
  console.error("[Session] Failed to update session:", error);
  return null;
}
```
**Roast**: At least this one returns null. But inconsistent error handling across the same file? Pick a strategy and stick to it.

#### 🟡 MODERATE: Type Assertion in Error Handling
**File**: [`src/hooks/use-submit-ekyc-result.ts:83`](src/hooks/use-submit-ekyc-result.ts:83)
```typescript
const failureCount = (context as any)?.failureCount || 0;
```
**Roast**: `context as any`?! You don't even know what type `context` is, but you're accessing properties on it? This is gambling, not programming.

#### 🟢 GOOD: Defensive Error Message Parsing
**File**: [`src/hooks/use-ekyc-config.ts:24-26`](src/hooks/use-ekyc-config.ts:24)
```typescript
const errorMessage = typeof error === "object" && error !== null && "message" in error
  ? (error as { message?: string }).message || "Unknown error"
  : "Unknown error";
```
**Praise**: Actually checking if error is an object before accessing. Shockingly competent.

---

### 4. Code Quality & Maintainability

#### 🔴 CRITICAL: Dead Code
**File**: [`src/hooks/use-ekyc-config.ts:48-56`](src/hooks/use-ekyc-config.ts:48)
**Roast**: Already roasted above, but worth emphasizing. This useEffect has ZERO side effects. It's a comment block wrapped in a React hook. DELETE IT.

#### 🟡 MODERATE: Magic Numbers
**File**: [`src/lib/ekyc/validators.ts:123`](src/lib/ekyc/validators.ts:123)
```typescript
const base64Pattern = /^[A-Za-z0-9+/={200,}$/;
```
**Roast**: What's special about 200? Why that number? Is it documented? Extract to a named constant like `MIN_BASE64_LENGTH`. Numbers without names are code smells.

**File**: [`src/lib/ekyc/audit-logger.ts:123`](src/lib/ekyc/audit-logger.ts:123)
```typescript
const base64Pattern = /^[A-Za-z0-9+/={200,}$/;
```
**Roast**: Same magic number duplicated! Create a constants file.

#### 🔴 CRITICAL: Copy-Paste Code
**File**: [`src/lib/ekyc/ekyc-api-mapper.ts:377-413`](src/lib/ekyc/ekyc-api-mapper.ts:377)
```typescript
function safeMapBase64DocImg(data: EkycResponse): VNPTBase64DocImg | undefined {
  return {
    img_front: (data as any).base64_doc_img_front || "",
    img_back: (data as any).base64_doc_img_back || "",
  };
}

function safeMapBase64FaceImg(data: EkycResponse): VNPTBase64FaceImg | undefined {
  return {
    img_face_far: (data as any).base64_face_img_far || "",
    img_face_near: (data as any).base64_face_img_near || "",
  };
}

function safeMapHashDocument(data: EkycResponse): VNPTHashDocument | undefined {
  return {
    img_front: (data as any).hash_doc_front || "",
    img_back: (data as any).hash_doc_back || "",
  };
}
```
**Roast**: Three nearly identical functions doing the same thing: accessing properties on `data as any`. This is a violation of DRY. Create a generic `safeExtractProperty` function. This is embarrassing.

#### 🟢 GOOD: Documentation
**File**: [`src/lib/ekyc/audit-logger.ts:1-10`](src/lib/ekyc/audit-logger.ts:1)
```typescript
/**
 * eKYC Audit Logger
 *
 * Provides non-PII logging functions for eKYC operations.
 * All PII (Personally Identifiable Information) is sanitized before logging.
 *
 * Complies with Vietnamese Decree 13/2023/NĐ-CP on personal data protection.
 */
```
**Praise**: Proper module-level documentation explaining compliance requirements. This is professional.

---

### 5. React-Specific Issues

#### 🔴 CRITICAL: Missing React Dependencies
**File**: [`src/hooks/use-ekyc-config.ts:48-56`](src/hooks/use-ekyc-config.ts:48)
**Roast**: This useEffect has dependencies but does nothing with them. If you actually implemented cache tracking, you'd need to track the API calls. As is, it's just wasting cycles.

#### 🟢 GOOD: Proper Hook Usage
**File**: [`src/hooks/use-submit-ekyc-result.ts:60-89`](src/hooks/use-submit-ekyc-result.ts:60)
```typescript
return useMutation({
  mutationFn: submitEkycResult,
  retry: (failureCount, error) => {
    if (failureCount >= 3) return false;
    // ... retry logic
  },
  retryDelay: exponentialBackoff,
  // ... callbacks
});
```
**Praise**: Proper useMutation setup with retry logic. The callbacks are appropriate and well-structured.

---

### 6. Security Concerns

#### 🟢 EXCELLENT: PII Sanitization
**File**: [`src/lib/ekyc/audit-logger.ts:67-102`](src/lib/ekyc/audit-logger.ts:67)
```typescript
function sanitizeData(data: Record<string, unknown>): Record<string, unknown> {
  const piiFields = [
    "id", "idNumber", "nationalId", "fullName", "name", "address",
    "phone", "email", "dateOfBirth", "birth_day", "base64", "img", "hash",
  ];
  // ... sanitization logic
}
```
**Praise**: Comprehensive PII field list and proper masking. The compliance with Vietnamese Decree 13/2023/NĐ-CP is documented and implemented correctly. This is the best part of the entire codebase.

#### 🟡 MODERATE: Base64 Detection
**File**: [`src/lib/ekyc/audit-logger.ts:121-125`](src/lib/ekyc/audit-logger.ts:121)
```typescript
function isBase64Data(str: string): boolean {
  const base64Pattern = /^[A-Za-z0-9+/={200,}$/;
  return base64Pattern.test(str);
}
```
**Roast**: This regex is weak. `={200,}` just means "200 or more equals signs at the end." Real base64 data won't have 200 padding characters. A more robust regex would be: `/^[A-Za-z0-9+/]+={0,2}$/` combined with length checks. Your current regex would match invalid base64.

#### 🔴 CRITICAL: No Input Size Limits
**File**: [`src/lib/ekyc/validators.ts:104-110`](src/lib/ekyc/validators.ts:104)
```typescript
export function isBase64TooLarge(
  base64String: string,
  maxSizeBytes: number = 5 * 1024 * 1024,
): boolean {
  const size = getBase64Size(base64String);
  return size > maxSizeBytes;
}
```
**Roast**: You check if it's too large, but WHERE do you enforce this? Nowhere! The function exists but nobody calls it with the actual data. This is security theater.

---

### 7. Testing Quality

#### 🔴 CRITICAL: Flaky Time-Based Tests
**File**: [`src/hooks/__tests__/use-ekyc-config.test.ts:210-224`](src/hooks/__tests__/use-ekyc-config.test.ts:210)
```typescript
setTimeout(() => {
  const updatedSession = updateSessionStatus(
    leadId,
    EkycSessionStatus.IN_PROGRESS,
  );
  expect(updatedSession?.updatedAt).not.toBe(originalUpdatedAt);
}, 10);
```
**Roast**: Tests with `setTimeout` and assertions inside callbacks? Without `await`? This test will ALWAYS pass even if the assertion fails because the test completes before the callback fires. This is not a test; it's a hope wrapped in a setTimeout.

**File**: [`src/hooks/__tests__/use-ekyc-config.test.ts:280-290`](src/hooks/__tests__/use-ekyc-config.test.ts:280)
```typescript
setTimeout(() => {
  const updatedSession = incrementSubmissionAttempts(leadId);
  expect(updatedSession?.updatedAt).not.toBe(originalUpdatedAt);
}, 10);
```
**Roast**: Same flaky test pattern. These tests are useless.

#### 🟡 MODERATE: Duplicate Test Data
**File**: [`src/hooks/__tests__/use-submit-ekyc-result.test.ts:66-104`](src/hooks/__tests__/use-submit-ekyc-result.test.ts:66)
**Roast**: The `mockEkycData` object is copied and pasted across MULTIPLE test files. Create a shared fixture file. DRY applies to tests too.

#### 🟢 GOOD: Performance Tests
**File**: [`tests/__tests__/performance/ekyc-performance.test.ts:54-87`](tests/__tests__/performance/ekyc-performance.test.ts:54)
```typescript
it("should fetch config in under 500ms", async () => {
  // ... performance test with actual timing measurements
  expect(duration).toBeLessThan(500);
});
```
**Praise**: Actual SLA verification with performance benchmarks. This is rare and valuable.

#### 🟢 GOOD: Edge Case Coverage
**File**: [`src/lib/ekyc/__tests__/ekyc-api-mapper.test.ts:349-362`](src/lib/ekyc/__tests__/ekyc-api-mapper.test.ts:349)
```typescript
it("should handle invalid JSON in object field", () => {
  livenessCard.object = "invalid json {";
  // ... test
});
```
**Praise**: Testing malformed input. Most developers forget to test invalid cases.

---

### 8. Documentation & Code Comments

#### 🟢 GOOD: JSDoc Coverage
**File**: [`src/lib/ekyc/session-manager.ts:73-84`](src/lib/ekyc/session-manager.ts:73)
```typescript
/**
 * Initializes a new eKYC session for a lead
 *
 * @param leadId - The lead ID to create a session for
 * @param initialStatus - The initial session status (default: INITIALIZED)
 * @returns The created session state
 *
 * @example
 * ```ts
 * const session = initSession("lead-123");
 * console.log(session.sessionId); // "ekyc_1234567890_abc123"
 * ```
 */
export function initSession(...
```
**Praise**: Comprehensive JSDoc with params, returns, and examples. This is how you document public APIs.

#### 🔴 CRITICAL: Misleading Comments
**File**: [`src/lib/ekyc/ekyc-api-mapper.ts:370-385`](src/lib/ekyc/ekyc-api-mapper.ts:370)
```typescript
/**
 * Safely extracts base64 document images from EkycResponse
 *
 * This is a placeholder function since the SDK response structure
 * doesn't explicitly include base64 images. In a real implementation,
 * you would extract these from the appropriate SDK response fields.
 */
function safeMapBase64DocImg(data: EkycResponse): VNPTBase64DocImg | undefined {
  // The SDK response doesn't directly provide base64 images
  // These would need to be extracted from the actual SDK response
  // or stored separately during the eKYC process
  return {
    img_front: (data as any).base64_doc_img_front || "",
    img_back: (data as any).base64_doc_img_back || "",
  };
}
```
**Roast**: "This is a placeholder function" BUT IT'S IN PRODUCTION CODE! You're using `as any` to access fields that don't exist in the type, and the comment admits it's a placeholder?! This is terrifying. Either the SDK provides these fields or it doesn't. If it does, add them to the type. If it doesn't, DON'T ACCESS THEM.

---

## 📊 SUMMARY BY CATEGORY

| Category | Critical | Moderate | Good | Excellent |
|----------|----------|----------|------|-----------|
| TypeScript | 3 | 1 | 0 | 0 |
| Performance | 2 | 1 | 1 | 1 |
| Error Handling | 2 | 1 | 1 | 0 |
| Code Quality | 3 | 2 | 0 | 1 |
| React Issues | 1 | 0 | 1 | 0 |
| Security | 1 | 1 | 0 | 1 |
| Testing | 2 | 1 | 0 | 2 |
| Documentation | 1 | 0 | 0 | 2 |

---

## 🛤️ PATH TO REDEMPTION: Top 8 Fixes

### 1. [URGENT] Fix Type Safety Violations
**Files**: All files with `as any`
```typescript
// BAD
return { img_front: (data as any).base64_doc_img_front || "" };

// GOOD
interface ExtendedEkycResponse extends EkycResponse {
  base64_doc_img_front?: string;
  base64_doc_img_back?: string;
}
function safeMapBase64DocImg(data: ExtendedEkycResponse): VNPTBase64DocImg | undefined {
  return {
    img_front: data.base64_doc_img_front || "",
    img_back: data.base64_doc_img_back || "",
  };
}
```
**Impact**: Eliminates runtime type errors, improves IDE support.

### 2. [URGENT] Remove Dead Code
**File**: [`src/hooks/use-ekyc-config.ts:48-56`](src/hooks/use-ekyc-config.ts:48)
```typescript
// DELETE THIS ENTIRE useEffect
// Or implement actual cache tracking
useEffect(() => {
  if (query.isSuccess && query.data) {
    if (!query.isFetching && query.isFetched) {
      // Data was served from cache
      logConfigCacheHit(leadId); // IMPLEMENT THIS
    }
  }
}, [query.isSuccess, query.data, query.isFetching, query.isFetched]);
```

### 3. [HIGH] Fix localStorage Error Handling
**File**: [`src/lib/ekyc/session-manager.ts:93-97`](src/lib/ekyc/session-manager.ts:93)
```typescript
try {
  localStorage.setItem(getStorageKey(leadId), JSON.stringify(session));
} catch (error) {
  console.error("[Session] Failed to store session:", error);
  return null; // DON'T return the session if it wasn't saved!
}
```

### 4. [HIGH] Optimize Session Cleanup
**File**: [`src/lib/ekyc/session-manager.ts:346-369`](src/lib/ekyc/session-manager.ts:346)
```typescript
export function cleanupExpiredSessions(): number {
  let cleanedCount = 0;

  // Only iterate through eKYC keys, not all localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith(STORAGE_KEY_PREFIX)) continue; // FILTER FIRST
    
    // ... rest of logic
  }
  return cleanedCount;
}
```

### 5. [HIGH] Consolidate Duplicate Functions
**File**: [`src/lib/ekyc/ekyc-api-mapper.ts:377-413`](src/lib/ekyc/ekyc-api-mapper.ts:377)
```typescript
function safeExtractProperty<T>(
  data: unknown,
  prop1: string,
  prop2: string,
  defaultValue: T
): T {
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    return (obj[prop1] as T) || (obj[prop2] as T) || defaultValue;
  }
  return defaultValue;
}
```

### 6. [MEDIUM] Fix Flaky Tests
**File**: [`src/lib/ekyc/__tests__/session-manager.test.ts:216-224`](src/lib/ekyc/__tests__/session-manager.test.ts:216)
```typescript
// BAD - setTimeout without await
setTimeout(() => {
  expect(updatedSession?.updatedAt).not.toBe(originalUpdatedAt);
}, 10);

// GOOD - use waitFor or fake timers
await waitFor(() => {
  const updatedSession = updateSessionStatus(leadId, EkycSessionStatus.IN_PROGRESS);
  expect(updatedSession?.updatedAt).not.toBe(originalUpdatedAt);
});
```

### 7. [MEDIUM] Extract Magic Numbers
**File**: Multiple files
```typescript
// constants.ts
export const BASE64_MIN_LENGTH = 200;
export const BASE64_PADDING_PATTERN = /={0,2}$/;
export const SESSION_TTL_MS = 30 * 60 * 1000;
export const MAX_SUBMISSION_ATTEMPTS = 3;
export const CACHE_TTL_MS = 5 * 60 * 1000;
```

### 8. [MEDIUM] Fix Base64 Validation Regex
**File**: [`src/lib/ekyc/audit-logger.ts:121-125`](src/lib/ekyc/audit-logger.ts:121)
```typescript
// BAD - matches things that aren't base64
const base64Pattern = /^[A-Za-z0-9+/={200,}$/;

// GOOD - actually validates base64
function isBase64Data(str: string): boolean {
  if (str.length < 100) return false; // real base64 images are longer
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(str)) return false;
  try {
    atob(str);
    return true;
  } catch {
    return false;
  }
}
```

---

## 🏆 FINAL WORDS

Look, I've seen worse code. Much worse. Your PII sanitization is actually thoughtful, and the test coverage is decent. But the `as any` casts are inexcusable in 2026, and the dead code in use-ekyc-config suggests someone fell asleep at the keyboard.

The security compliance is good—surprisingly good for a feature branch. But the type safety violations undo a lot of that goodwill. You're one SDK change away from runtime explosions.

**Fix the top 3 issues above**, and I might let this code merge. Leave them as-is, and I'm rejecting the PR with extreme prejudice.

Now get out of my sight and write better code.

---

**Reviewer**: Sr. Principal Engineer from Hell  
**Mood**: Disappointed but not entirely hopeless  
**Next Review**: When you learn what TypeScript is actually for
