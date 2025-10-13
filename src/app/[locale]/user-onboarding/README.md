# User Onboarding Flow - Lending Platform

## 📋 Overview

Đây là trang đăng ký tài khoản vay cho lending platform, sử dụng **Data-Driven UI System** với multi-step form và eKYC verification.

## 🚀 URL

```
http://localhost:3000/user-onboarding
```

## 📝 Flow Steps

### Step 1: Thông tin cơ bản (Basic Information)
- Họ và tên
- Email
- Số điện thoại  
- Ngày sinh
- Giới tính
- Địa chỉ hiện tại
- Tỉnh/Thành phố
- Nghề nghiệp
- Thu nhập hàng tháng

**Validation:**
- All fields required
- Email format validation
- Phone number: 10 digits
- Address: minimum 10 characters

### Step 2: Xác thực danh tính (eKYC Verification)
- Facial recognition verification
- Integrated with eKYC SDK
- Language: Vietnamese
- Flow type: FACE

**Validation:**
- eKYC must be completed before proceeding

### Step 3: Xác nhận thông tin (Confirmation)
- Review all entered information
- Shows formatted summary with icons
- Displays eKYC verification status
- Terms and conditions acceptance

## ✨ Features

### 🔄 Data Persistence
- Automatically saves progress to `localStorage`
- Storage key: `user-onboarding-data`
- Users can return and resume where they left off

### ⬅️ Back Navigation
- Users can navigate back to previous steps
- Data is preserved when going back

### 📊 Progress Indicator
- Visual step indicator
- Shows current step and completed steps
- Step-based navigation

### 🔔 Callbacks

#### `onStepComplete`
```typescript
async (stepId, stepData) => {
  // Called after each step is validated
  // Can save to backend incrementally
}
```

#### `onStepChange`
```typescript
(fromStep, toStep) => {
  // Called when navigating between steps
  // Good for analytics tracking
}
```

#### `onComplete`
```typescript
async (allData) => {
  // Called when entire form is submitted
  // Sends to /api/onboarding/complete
}
```

## 🛠️ Technical Stack

- **Framework:** Next.js 14 (App Router)
- **Form Management:** React Hook Form
- **Validation:** Zod (auto-generated)
- **UI Components:** shadcn/ui
- **Icons:** lucide-react
- **Styling:** Tailwind CSS
- **Data-Driven UI:** Custom-built system

## 📦 Components Used

```typescript
// Field builders
import {
  createInputField,
  createSelectField,
  createDatePickerField,
  createEkycField,
  createConfirmationField,
} from '@/lib/field-builder';

// Multi-step builder
import { multiStepForm } from '@/lib/multi-step-form-builder';

// Renderer
import { MultiStepFormRenderer } from '@/components/renderer/MultiStepFormRenderer';
```

## 🔌 API Endpoints

### POST `/api/onboarding/complete`

**Request Body:**
```json
{
  "basic-info": {
    "fullName": "Nguyễn Văn A",
    "email": "example@email.com",
    "phone": "0912345678",
    "dateOfBirth": "1990-01-01",
    "gender": "male",
    "address": "123 Main St, District 1",
    "city": "hcm",
    "occupation": "employee",
    "monthlyIncome": "10to20"
  },
  "ekyc-verification": {
    "ekycVerification": {
      "completed": true,
      "sessionId": "ekyc_session_123",
      "timestamp": "2025-10-07T10:00:00Z"
    }
  },
  "confirmation": {
    "review": {}
  }
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Onboarding completed successfully",
  "data": {
    "userId": "USER_1696680000000",
    "applicationId": "APP_ABC123",
    "status": "pending_review",
    "submittedAt": "2025-10-07T10:00:00Z",
    "estimatedReviewTime": "24-48 hours",
    "email": "example@email.com",
    "phone": "0912345678",
    "ekycSessionId": "ekyc_session_123"
  }
}
```

**Response (Error - Missing eKYC):**
```json
{
  "error": "eKYC verification not completed"
}
```

## 🎨 Customization

### Change Progress Style

```typescript
.setProgressStyle('steps')  // Current: numbered steps
.setProgressStyle('bar')    // Alternative: progress bar
.setProgressStyle('dots')   // Alternative: dot indicators
```

### Disable Data Persistence

```typescript
.persistData(false)  // Don't save to localStorage
```

### Disable Back Navigation

```typescript
.allowBackNavigation(false)  // Can't go back
```

### Add More Steps

```typescript
.addStep(
  'step-id',
  'Step Title',
  [
    createInputField('fieldName', { /* props */ }),
    // ... more fields
  ],
  {
    description: 'Step description',
    icon: <YourIcon className="h-5 w-5" />,
    optional: false,  // Set to true for optional steps
  }
)
```

## 🧪 Testing

### Test the form flow:
1. Start at Step 1, fill in basic info
2. Click "Tiếp theo" → Goes to Step 2
3. Complete eKYC verification
4. Click "Tiếp theo" → Goes to Step 3
5. Review all information
6. Click "Hoàn tất" → Submits to API

### Test localStorage persistence:
1. Fill Step 1 partially
2. Refresh the page
3. Data should be restored

### Test back navigation:
1. Complete Step 1
2. Go to Step 2
3. Click "Quay lại" → Should return to Step 1 with data intact

### Test validation:
1. Try clicking "Tiếp theo" without filling required fields
2. Should show validation errors
3. eKYC step should block if not completed

## 🔒 Security Notes

- Never store sensitive data in localStorage in production
- Always validate on backend
- Use HTTPS for eKYC
- Sanitize user inputs
- Implement rate limiting on API endpoints

## 📚 Related Documentation

- [Data-Driven UI Complete Docs](../../../docs/DATA_DRIVEN_UI_COMPLETE.md)
- [eKYC Integration](../../../docs/EKYC_INTEGRATION.md)
- [Multi-Step Forms Guide](../../../docs/DATA_DRIVEN_UI_COMPLETE.md#multi-step-forms)

## 🚀 Next Steps

For production deployment:

1. **Replace mock API** with real backend endpoint
2. **Add error tracking** (Sentry/DataDog)
3. **Implement analytics** (Google Analytics, Mixpanel)
4. **Add loading states** and better UX feedback
5. **Implement email/SMS notifications**
6. **Add file upload** for supporting documents
7. **Create admin dashboard** to review applications
8. **Add status tracking** page for users

## 👨‍💻 Development

```bash
# Run development server
npm run dev

# Open the page
open http://localhost:3000/user-onboarding

# Check console for step completion logs
```

## 🐛 Troubleshooting

### Form doesn't save to localStorage
- Check browser console for errors
- Verify `persistData(true)` is set
- Check if storage key is unique

### eKYC not loading
- Verify eKYC SDK files are in `/public/`
- Check network tab for script loading errors
- Ensure auth token is configured

### Validation not working
- Check field validation rules are properly defined
- Verify Zod schema generation
- Look for console errors

### Can't submit form
- Check API endpoint is running
- Verify all required fields are filled
- Check eKYC is completed
- Look at network tab for API errors

---

**Built with ❤️ for lending platform**
