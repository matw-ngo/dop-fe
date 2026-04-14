# E2E Tests

## Overview

This directory contains end-to-end tests for critical user flows using Playwright.

## Test Files

### `loan-submission-smoke.spec.ts`

Critical smoke test for the complete loan submission flow.

**Coverage:**
- Navigate to loan application form
- Fill form with valid data
- Submit form (POST /leads)
- Handle OTP verification
- Submit lead info (POST /leads/{id}/submit-info)
- Verify matched products display

## VPN Requirement

**IMPORTANT:** The staging API requires VPN connection.

### Staging API Details
- **URL:** https://dop-stg.datanest.vn/
- **IP:** 10.20.0.240 (private)
- **Access:** VPN required

### Without VPN
- API requests will fail with network errors
- Tests will skip API-dependent scenarios
- Use mock API fallback: `NEXT_PUBLIC_USE_MOCK_API="true"`

### With VPN
- Full end-to-end testing with real API
- Actual OTP verification flow
- Real product matching from distribution engine

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Connect to VPN
```bash
# Connect to your VPN client
# Verify API access:
curl https://dop-stg.datanest.vn/v1/health
```

### 3. Run Tests

**With VPN (Real API):**
```bash
npm run test:e2e
```

**Without VPN (Mock API):**
```bash
NEXT_PUBLIC_USE_MOCK_API="true" npm run test:e2e
```

**Run specific test:**
```bash
npx playwright test e2e/loan-submission-smoke.spec.ts
```

**Run with UI:**
```bash
npx playwright test --ui
```

**Debug mode:**
```bash
npx playwright test --debug
```

## Test Structure

### Main Flow Test
Tests the complete happy path:
1. Fill loan application form
2. Submit and create lead
3. Verify phone number
4. Enter OTP code
5. Submit additional info
6. View matched products

### Error Handling Tests
- API errors without VPN
- Phone number validation
- Terms agreement requirement

### Mock API Tests
- Fallback when VPN unavailable
- Mocked endpoints for all API calls

## Expected Behavior

### With VPN Connected
```
✓ VPN Connected - Using real staging API
✓ Lead created: <lead-id>
✓ Lead info submitted - X products matched
✓ X products displayed
✓ Loan submission flow completed successfully
```

### Without VPN
```
⚠️  VPN NOT CONNECTED
   Staging API (10.20.0.240) is not accessible
   Tests will use mock API or skip API-dependent scenarios
   To test with real API:
   1. Connect to VPN
   2. Verify: curl https://dop-stg.datanest.vn/v1/health
   3. Re-run tests
```

## Selectors Used

The test uses flexible selectors to handle different UI states:

- **Form fields:** `input[name="expected_amount"]`, `input[name="loan_period"]`
- **Buttons:** Role-based with regex patterns `/tiếp theo|submit|đăng ký/i`
- **Modals:** Text-based with regex `/nhập số điện thoại|phone number/i`
- **OTP inputs:** `input[type="text"][maxlength="1"]`
- **Product cards:** `[data-testid="product-card"]`

## Test Data

### Valid Test Data
- **Phone:** 0901234567 (Viettel)
- **Loan Amount:** 50,000,000 VND
- **Loan Period:** 12 months
- **OTP (Mock):** 123456 or 000000

### Invalid Test Data
- **Phone:** 123 (invalid format)

## Screenshots

Test failures automatically capture:
- Screenshot on failure
- Video recording (retained on failure)
- Full page screenshot at completion

Location: `test-results/`

## Troubleshooting

### Test Fails with Network Error
**Problem:** Cannot reach staging API
**Solution:** 
1. Verify VPN connection
2. Check API health: `curl https://dop-stg.datanest.vn/v1/health`
3. Use mock API: `NEXT_PUBLIC_USE_MOCK_API="true"`

### OTP Verification Fails
**Problem:** OTP code not accepted
**Solution:**
- With real API: Use actual OTP sent to phone
- With mock API: Use "123456" or "000000"

### Selectors Not Found
**Problem:** UI elements not found
**Solution:**
1. Check if page loaded: `await page.waitForLoadState("networkidle")`
2. Verify element exists in current UI
3. Update selectors if UI changed

### Test Timeout
**Problem:** Test exceeds timeout
**Solution:**
1. Increase timeout in test: `{ timeout: 30000 }`
2. Check if API is responding slowly
3. Verify VPN connection is stable

## CI/CD Integration

### GitHub Actions
```yaml
- name: Run E2E Tests
  run: |
    # Use mock API in CI (no VPN)
    NEXT_PUBLIC_USE_MOCK_API="true" npm run test:e2e
```

### Local Development
```bash
# With VPN - full integration test
npm run test:e2e

# Without VPN - mock API
NEXT_PUBLIC_USE_MOCK_API="true" npm run test:e2e
```

## Best Practices

1. **Always document VPN requirements** in test files
2. **Provide mock API fallback** for CI/CD
3. **Use flexible selectors** (role-based, text-based with regex)
4. **Handle multiple UI states** (loading, error, success)
5. **Add clear console logging** for debugging
6. **Take screenshots** on critical steps
7. **Test error scenarios** not just happy path

## Related Documentation

- [Form Submission Flow](../docs/form-submission/flow-diagram.md)
- [API Documentation](../src/lib/api/README.md)
- [Playwright Config](../playwright.config.ts)
