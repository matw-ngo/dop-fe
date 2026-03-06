# Form Submission Cases - Quick Reference

## 📋 All Possible Cases

### Case Matrix

| #   | Flow Type   | OTP Position  | Phone in Data | Consent | Result                                       |
| --- | ----------- | ------------- | ------------- | ------- | -------------------------------------------- |
| 1   | Single-step | No OTP        | N/A           | N/A     | Stay on page or navigate to next             |
| 2   | Single-step | Has OTP       | No            | No      | Consent Modal → Phone Modal → OTP → Navigate |
| 3   | Single-step | Has OTP       | No            | Yes     | Phone Modal → OTP → Navigate                 |
| 4   | Single-step | Has OTP       | Yes           | Yes     | OTP Modal → Navigate                         |
| 5   | Multi-step  | No OTP        | N/A           | N/A     | Next step or Submit                          |
| 6   | Multi-step  | OTP at middle | No            | No      | Consent → Phone → OTP → Continue wizard      |
| 7   | Multi-step  | OTP at middle | No            | Yes     | Phone → OTP → Continue wizard                |
| 8   | Multi-step  | OTP at middle | Yes           | Yes     | OTP → Continue wizard                        |
| 9   | Multi-step  | OTP at last   | No            | No      | Consent → Phone → OTP → Submit               |
| 10  | Multi-step  | OTP at last   | No            | Yes     | Phone → OTP → Submit                         |
| 11  | Multi-step  | OTP at last   | Yes           | Yes     | OTP → Submit                                 |
| 12  | Multi-OTP   | Multiple OTPs | Varies        | Varies  | Multiple verification points                 |

---

## 🎯 Case Details

### CASE 1: Simple Form (No OTP, Single Step)

```
User fills form → Submit → Validate → Stay/Navigate
```

**Example**: Newsletter signup, contact form

---

### CASE 2: Homepage with OTP (No Consent, No Phone)

```
User fills form → Submit → Validate
  → Consent Modal → User grants consent
  → Phone Modal → User enters phone
  → Create Lead API
  → OTP Modal → User enters OTP
  → Verify OTP → Create session
  → Navigate to /loan-info?leadId=X&token=Y
```

**Example**: First-time user on homepage

---

### CASE 3: Homepage with OTP (Has Consent, No Phone)

```
User fills form → Submit → Validate
  → Phone Modal → User enters phone
  → Create Lead API
  → OTP Modal → User enters OTP
  → Verify OTP → Create session
  → Navigate to /loan-info?leadId=X&token=Y
```

**Example**: Returning user on homepage

---

### CASE 4: Homepage with OTP (Has Consent, Has Phone)

```
User fills form (including phone) → Submit → Validate
  → Create Lead API (with phone from form)
  → OTP Modal → User enters OTP
  → Verify OTP → Create session
  → Navigate to /loan-info?leadId=X&token=Y
```

**Example**: User filled phone in form

---

### CASE 5: Multi-Step Wizard (No OTP)

```
Step 1: Fill → Next → Validate → Move to Step 2
Step 2: Fill → Next → Validate → Move to Step 3
Step 3: Fill → Submit → Validate → Submit API → Success
```

**Example**: 3-step loan application without verification

---

### CASE 6: Multi-Step with OTP at Middle (No Consent, No Phone)

```
Step 1: Fill → Next → Move to Step 2
Step 2 (OTP): Fill → Next → Validate
  → Consent Modal → Grant consent
  → Phone Modal → Enter phone
  → Create Lead API
  → OTP Modal → Enter OTP
  → Verify → Create session
  → Move to Step 3 (CANNOT GO BACK to 1-2)
Step 3: Fill → Next → Move to Step 4
Step 4: Fill → Submit → Submit API → Success
```

**Example**: Secure multi-step with mid-flow verification

---

### CASE 7: Multi-Step with OTP at Middle (Has Consent, No Phone)

```
Step 1: Fill → Next → Move to Step 2
Step 2 (OTP): Fill → Next → Validate
  → Phone Modal → Enter phone
  → Create Lead API
  → OTP Modal → Enter OTP
  → Verify → Create session
  → Move to Step 3 (CANNOT GO BACK)
Step 3+: Continue wizard → Submit
```

---

### CASE 8: Multi-Step with OTP at Middle (Has Consent, Has Phone)

```
Step 1: Fill → Next → Move to Step 2
Step 2 (OTP): Fill (including phone) → Next → Validate
  → Create Lead API
  → OTP Modal → Enter OTP
  → Verify → Create session
  → Move to Step 3 (CANNOT GO BACK)
Step 3+: Continue wizard → Submit
```

---

### CASE 9: Multi-Step with OTP at Last (No Consent, No Phone)

```
Step 1: Fill → Next → Move to Step 2
Step 2: Fill → Next → Move to Step 3
Step 3 (OTP + Submit): Fill → Submit → Validate
  → Consent Modal → Grant consent
  → Phone Modal → Enter phone
  → Create Lead API
  → OTP Modal → Enter OTP
  → Verify → Create session
  → Navigate to next page or Success
```

**Example**: Final verification before submission

---

### CASE 10: Multi-Step with OTP at Last (Has Consent, No Phone)

```
Step 1-2: Complete steps
Step 3 (OTP + Submit): Fill → Submit → Validate
  → Phone Modal → Enter phone
  → Create Lead API
  → OTP Modal → Enter OTP
  → Verify → Create session
  → Navigate or Success
```

---

### CASE 11: Multi-Step with OTP at Last (Has Consent, Has Phone)

```
Step 1-2: Complete steps
Step 3 (OTP + Submit): Fill (including phone) → Submit → Validate
  → Create Lead API
  → OTP Modal → Enter OTP
  → Verify → Create session
  → Navigate or Success
```

---

### CASE 12: Multi-OTP Flow

```
Step 1: Fill → Next
Step 2 (Phone OTP): Verify phone → Create session #1 → Next
  → CANNOT GO BACK to Step 1-2
Step 3: Fill → Next
Step 4 (Email OTP): Verify email → Create session #2 → Next
  → CANNOT GO BACK to Step 1-4
Step 5: Fill → Submit → Success
```

**Example**: High-security application with multiple verifications

---

## 🔄 Navigation Patterns

### Pattern A: Stay on Page

- Single-step form
- No next step in flow
- User sees success message on same page

### Pattern B: Navigate to Next Step

- Multi-step wizard
- Move to next step in same page
- Wizard progress updates

### Pattern C: Navigate to Different Page

- After OTP verification
- Navigate to `/loan-info?leadId=X&token=Y`
- New page loads with lead context

### Pattern D: Navigate with Navigation Lock

- After OTP verification in middle step
- Continue wizard but cannot go back
- Verification session active

---

## 🚨 Error Cases

### E1: Validation Failed

```
Submit → Validate → FAIL
  → Show inline errors
  → Auto-scroll to first error
  → Show toast (if showToastOnError)
  → User fixes → Retry
```

### E2: Phone Validation Failed

```
Phone Modal → Enter phone → Validate → FAIL
  → Toast: "Invalid phone" or "Telco not supported"
  → User re-enters → Retry
```

### E3: Lead Creation Failed

```
Create Lead API → FAIL
  → Toast: "Submission failed"
  → Stay on form
  → User can retry
```

### E4: OTP Verification Failed

```
OTP Modal → Enter OTP → Verify → FAIL
  → Toast: "Invalid OTP" or "OTP expired"
  → User re-enters → Retry
```

### E5: Configuration Error

```
sendOtp: true BUT phone_number not required
  → Toast: "Configuration error"
  → Stay on form
  → Need to fix flow config
```

---

## 📊 Modal Sequence

### Sequence 1: Full Flow (No Consent, No Phone)

```
1. Consent Modal
2. Phone Modal
3. OTP Modal
4. Navigate
```

### Sequence 2: Partial Flow (Has Consent, No Phone)

```
1. Phone Modal
2. OTP Modal
3. Navigate
```

### Sequence 3: Minimal Flow (Has Consent, Has Phone)

```
1. OTP Modal
2. Navigate
```

### Sequence 4: No Modal (No OTP)

```
1. Navigate directly
```

---

## 🎨 Visual Summary

```
┌─────────────────────────────────────────────────────────────┐
│                    SUBMISSION DECISION TREE                  │
└─────────────────────────────────────────────────────────────┘

                        [User Submits]
                              │
                    ┌─────────┴─────────┐
                    │                   │
              [Single Step]      [Multi-Step]
                    │                   │
            ┌───────┴───────┐          │
            │               │          │
        [No OTP]        [Has OTP]      │
            │               │          │
            │       ┌───────┴───────┐  │
            │       │               │  │
            │   [No Phone]    [Has Phone]
            │       │               │  │
            │   ┌───┴───┐          │  │
            │   │       │          │  │
            │ [No C] [Has C]       │  │
            │   │       │          │  │
            ▼   ▼       ▼          ▼  ▼
         CASE1 CASE2  CASE3     CASE4 CASE5-12

Legend:
C = Consent
OTP = One-Time Password
Phone = phone_number in form data
```

---

## 🔍 Quick Lookup

**Need to find which case applies?**

1. **Is it multi-step?**
   - No → Cases 1-4
   - Yes → Cases 5-12

2. **Does it have OTP?**
   - No → Case 1 or 5
   - Yes → Continue

3. **Where is OTP?**
   - Middle step → Cases 6-8
   - Last step → Cases 9-11
   - Multiple → Case 12

4. **Has consent?**
   - No → Even-numbered cases (2, 6, 9)
   - Yes → Odd-numbered cases (3, 7, 10)

5. **Has phone in data?**
   - No → Cases 2, 3, 6, 7, 9, 10
   - Yes → Cases 4, 8, 11

---

## 📝 Notes

- **Consent Modal**: Only shows if no valid consent exists
- **Phone Modal**: Only shows if phone not in form data AND required
- **OTP Modal**: Always shows when `sendOtp: true` and lead created
- **Navigation Lock**: Activated after OTP verification
- **Session Storage**: Verification session persisted across page reloads
- **Error Recovery**: All errors allow retry without losing data

---

## 🔗 Related Files

- Full flow diagram: `docs/form-submission-flow.md`
- Navigation security: `docs/navigation-security.md`
- Test profiles: `src/__tests__/msw/profiles/`
- Components:
  - `src/components/loan-application/DynamicLoanForm.tsx`
  - `src/components/form-generation/wizard/StepWizard.tsx`
  - `src/components/form-generation/wizard/WizardNavigation.tsx`
