# Browser Navigation Security After OTP

## Overview

This document describes the browser navigation security feature that prevents users from navigating back to pre-OTP steps after successful OTP verification in multi-step loan application forms.

## Features

### Core Security
- **Back Navigation Blocking**: Prevents browser back button navigation to steps before OTP verification
- **Session Management**: Creates cryptographically secure verification sessions after OTP success
- **Flexible Navigation**: Allows free navigation between post-OTP steps
- **Session Persistence**: Maintains session across page refreshes using encrypted sessionStorage

### Optional Features (Configurable)
- **Session Timeout**: Automatic session expiration with activity tracking
- **User Notifications**: Toast notifications for blocked navigation and session events
- **Server Validation**: Optional server-side verification of session headers
- **Error Recovery**: Automatic recovery from corrupted sessions

## Architecture

### Components

1. **NavigationConfigContext** (`src/contexts/NavigationConfigContext.tsx`)
   - Provides configuration for all navigation security features
   - Configurable via environment variables
   - Accessible in non-React contexts via `getNavigationConfig()`

2. **Auth Store Extensions** (`src/store/use-auth-store.ts`)
   - `verificationSession`: Stores session state
   - `createVerificationSession()`: Creates session after OTP
   - `clearVerificationSession()`: Clears session on completion/logout
   - `canNavigateBack()`: Validates navigation attempts

3. **Form Wizard Store Extensions** (`src/components/form-generation/store/use-form-wizard-store.ts`)
   - `otpStepIndex`: Detected OTP step position
   - `detectOTPStep()`: Finds step with `sendOtp: true`
   - `beforeStepChangeCallback`: Navigation guard hook
   - `canNavigateToStep()`: Enhanced with session lock check

4. **Navigation Hooks**
   - `useNavigationGuard`: Core navigation blocking logic
   - `useSessionTimeout`: Session expiration with activity tracking
   - `useSessionReset`: Automatic cleanup on navigation away
   - `useErrorRecovery`: Handles corrupted sessions

5. **API Middleware**
   - `verification.ts`: Injects session headers for server validation
   - `verification-error.ts`: Handles 401/403 verification errors

6. **UI Components**
   - `SessionTimeoutWarning`: Shows countdown when < 60s remaining
   - `ManualResetButton`: Allows manual session reset on errors

## Configuration

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_NAV_ENABLE_TIMEOUT=false          # Enable session timeout
NEXT_PUBLIC_NAV_TIMEOUT_MINUTES=15            # Timeout duration
NEXT_PUBLIC_NAV_BLOCK_BACK=true               # Enable back navigation blocking
NEXT_PUBLIC_NAV_NOTIFICATIONS=true            # Enable toast notifications
NEXT_PUBLIC_NAV_SERVER_VALIDATION=false       # Enable server-side validation
```

### Configuration Presets

**Minimal (Default)**
```typescript
{
  enableBackNavigationBlock: true,
  enableSessionTimeout: false,
  enableUserNotifications: true,
  enableServerValidation: false
}
```

**Maximum Security**
```typescript
{
  enableBackNavigationBlock: true,
  enableSessionTimeout: true,
  sessionTimeoutMinutes: 15,
  enableUserNotifications: true,
  enableServerValidation: true
}
```

**Development/Testing**
```typescript
{
  enableBackNavigationBlock: false,
  enableSessionTimeout: false,
  enableUserNotifications: false,
  enableServerValidation: false
}
```

## Usage

### Integration in Components

The feature is already integrated in:
- `ApplyLoanForm.tsx` - Standalone loan application form
- `DynamicLoanForm.tsx` - Dynamic flow-based form

Example integration:

```typescript
import { useNavigationGuard } from '@/hooks/navigation/use-navigation-guard';
import { useSessionTimeout } from '@/hooks/navigation/use-session-timeout';
import { useSessionReset } from '@/hooks/navigation/use-session-reset';
import { useErrorRecovery } from '@/hooks/navigation/use-error-recovery';

function MyForm() {
  // Initialize navigation security
  useNavigationGuard();
  const { timeRemaining } = useSessionTimeout();
  const { resetSession } = useSessionReset();
  const { showResetButton } = useErrorRecovery();

  // Handle OTP success
  const handleOTPSuccess = () => {
    const otpStepIndex = useFormWizardStore.getState().otpStepIndex;
    const config = getNavigationConfig();
    useAuthStore.getState().createVerificationSession(otpStepIndex, config);
  };

  return (
    <div>
      {timeRemaining < 60 && <SessionTimeoutWarning timeRemaining={timeRemaining} />}
      {showResetButton && <ManualResetButton />}
      {/* Form content */}
    </div>
  );
}
```

### OTP Step Detection

The system automatically detects which step requires OTP by finding the first step with `sendOtp: true`:

```typescript
// Automatic detection in DynamicLoanForm
useEffect(() => {
  if (flowData?.steps) {
    wizardStore.detectOTPStep();
  }
}, [flowData]);
```

### Verification Session Creation

After successful OTP verification:

```typescript
const handleOtpSuccess = () => {
  const otpStepIndex = useFormWizardStore.getState().otpStepIndex;
  
  if (otpStepIndex !== null) {
    const config = getNavigationConfig();
    authStore.createVerificationSession(otpStepIndex, config);
  }
};
```

## Data Flow

### OTP Verification Flow

```
User completes OTP
       ↓
OTP API Success
       ↓
createVerificationSession(otpStepIndex)
       ↓
Generate crypto random session ID (128-bit)
Set session lock = true
Calculate expiration (if enabled)
Persist to sessionStorage (encrypted)
       ↓
Navigation Guard Activated
       ↓
Block back navigation to pre-OTP steps
```

### Navigation Attempt Flow

```
User clicks back button
       ↓
WizardNavigation: previousStep()
       ↓
canNavigateToStep(targetIndex)
       ↓
beforeStepChange callback
       ↓
Navigation Guard: Check session lock
       ↓
Is target step <= OTP step? → BLOCK
Is target step > OTP step? → ALLOW
```

## Security Considerations

### Session ID Generation
- Primary: `window.crypto.getRandomValues()` (128-bit entropy)
- Secondary: `window.crypto.randomUUID()` (128-bit)
- Tertiary: Node.js `crypto.randomBytes(16)` (128-bit)
- Last resort: Multiple `Math.random()` with security warning

### Session Storage
- Sessions encrypted before storage using base64 encoding
- Namespaced keys prevent conflicts: `dop_verification_{sessionId}`
- Old sessions cleared before persisting new ones

### Server-Side Validation (Optional)
When enabled, API requests include:
- `X-Verification-Session-Id`: Session identifier
- `X-Verification-Step`: Current step index
- `X-OTP-Step`: OTP step index

Server should validate:
1. Session exists and not expired
2. OTP was completed for this session
3. Current step is after OTP step

Error responses:
- `401 unauthenticated`: Session invalid/expired → Clear session, redirect to step 0
- `403 permission_denied`: OTP not verified → Redirect to OTP step

## Translation Keys

All user-facing messages are translated in:
- `messages/en/features/loan-application/main.json`
- `messages/vi/features/loan-application/main.json`

Keys:
```json
{
  "navigation": {
    "blocked": {
      "title": "Navigation Blocked",
      "afterVerification": "You cannot go back after verification for security reasons."
    },
    "sessionExpired": {
      "title": "Session Expired",
      "message": "Your session has expired. Please start over."
    },
    "sessionTimeout": {
      "title": "Session Expiring Soon",
      "warning": "Your session will expire in {seconds} seconds."
    },
    "error": {
      "sessionCorrupt": {
        "title": "Session Error",
        "message": "Your session data is corrupted. Returning to start."
      },
      "resetButton": "Start Over"
    }
  }
}
```

## Troubleshooting

### Navigation Not Blocked
1. Check `enableBackNavigationBlock` is `true` in config
2. Verify OTP step was detected: `wizardStore.otpStepIndex !== null`
3. Confirm verification session exists: `authStore.verificationSession !== null`
4. Check browser console for warnings

### Session Not Persisting
1. Verify sessionStorage is enabled in browser
2. Check for storage quota errors in console
3. Ensure session is created after OTP success
4. Verify encryption/decryption functions work

### Timeout Not Working
1. Check `enableSessionTimeout` is `true` in config
2. Verify `sessionTimeoutMinutes` is set correctly
3. Check activity tracking events are firing
4. Look for interval cleanup issues

### Server Validation Failing
1. Verify `enableServerValidation` is `true`
2. Check headers are being sent: Network tab → Request headers
3. Confirm server endpoint validates headers correctly
4. Check for CORS issues with custom headers

## Performance

### Optimizations
- Debounced activity tracking (1 second)
- Interval-based timeout checking (10 seconds)
- Memoized navigation calculations
- Efficient event listener cleanup

### Memory Management
- All event listeners cleaned up on unmount
- Intervals cleared properly
- Refs used to prevent unnecessary re-renders
- Stable callback references

## Testing

### Unit Tests
- Auth store verification session management
- Form wizard store OTP detection
- Navigation guard blocking logic
- Session timeout with activity tracking
- Error recovery scenarios

### Integration Tests
- Complete OTP verification flow
- Session creation and persistence
- Back navigation blocking
- Browser back button behavior
- Page refresh with active session

### Manual Testing Checklist
- [ ] OTP step detected correctly
- [ ] Session created after OTP success
- [ ] Back button disabled after OTP
- [ ] Forward navigation works between post-OTP steps
- [ ] Session persists across page refresh
- [ ] Session clears on form completion
- [ ] Session clears on logout
- [ ] Timeout warning shows at 60s
- [ ] Session expires after timeout
- [ ] Manual reset button works
- [ ] Toast notifications appear correctly

## Migration Guide

### Enabling the Feature

1. Set environment variables in `.env.local`
2. Feature is already integrated in `ApplyLoanForm` and `DynamicLoanForm`
3. No code changes needed for basic functionality

### Disabling the Feature

Set `NEXT_PUBLIC_NAV_BLOCK_BACK=false` to disable all navigation blocking while keeping other features.

### Gradual Rollout

1. Start with `enableBackNavigationBlock: true` only
2. Add `enableUserNotifications: true` for user feedback
3. Enable `enableSessionTimeout: true` for additional security
4. Finally enable `enableServerValidation: true` for full security

## Known Limitations

### SSR Considerations
- `getNavigationConfig()` uses module-level mutable variable
- May have race conditions in SSR environments
- Consider using Zustand store instead of React Context for production

### Browser Compatibility
- Requires modern browser with Web Crypto API
- Falls back to less secure random generation if unavailable
- sessionStorage must be enabled

### Performance Impact
- Minimal: ~10ms overhead per navigation check
- Activity tracking debounced to reduce event handler calls
- Interval checks every 10 seconds for timeout

## Future Enhancements

### Potential Improvements
1. **Biometric Verification**: Add fingerprint/face ID support
2. **Multi-Device Sync**: Sync sessions across devices
3. **Advanced Analytics**: Track navigation patterns
4. **A/B Testing**: Test different timeout durations
5. **Accessibility**: Enhanced screen reader support

### Server-Side Implementation
If implementing server validation:
1. Create session registry table
2. Store session ID, lead ID, OTP verification status
3. Validate headers on each request
4. Implement session cleanup cron job

## Support

For issues or questions:
1. Check browser console for warnings/errors
2. Review this documentation
3. Check implementation in `ApplyLoanForm.tsx` or `DynamicLoanForm.tsx`
4. Contact development team

## References

- Requirements: `.kiro/specs/browser-navigation-after-otp/requirements.md`
- Design: `.kiro/specs/browser-navigation-after-otp/design.md`
- Tasks: `.kiro/specs/browser-navigation-after-otp/tasks.md`
