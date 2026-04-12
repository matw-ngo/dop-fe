# Smoke Test Data Reference

This document contains real API response data from `dop-stg.datanest.vn` for smoke testing.

## API Endpoints

### 1. GET /flows/{tenant}

**Request:**

```bash
curl 'https://dop-stg.datanest.vn/flows/11111111-1111-1111-1111-111111111111'
```

**Response:**

```json
{
  "created_at": "2026-01-08T08:00:50.734678Z",
  "description": "finzone default flow of finzone, only contain submit info steps",
  "flow_status": "active",
  "id": "2ff645ad-2f98-4299-95d2-8b890b24c1cf",
  "name": "finzone default flow",
  "steps": [
    {
      "created_at": "2026-01-08T08:00:22.245593Z",
      "have_phone_number": true,
      "have_purpose": true,
      "id": "d7ceabac-ad42-4253-abb4-6c60a0fd0a4f",
      "page": "/index",
      "required_phone_number": true,
      "required_purpose": true,
      "send_otp": true,
      "updated_at": "2026-01-08T08:00:22.245593Z",
      "use_ekyc": false
    },
    {
      "created_at": "2026-01-08T08:00:36.39525Z",
      "have_birthday": true,
      "have_career_status": true,
      "have_career_type": true,
      "have_credit_status": true,
      "have_full_name": true,
      "have_gender": true,
      "have_having_loan": true,
      "have_income": true,
      "have_income_type": true,
      "have_location": true,
      "have_national_id": true,
      "id": "76ba90f3-abe5-4c74-bb49-350e7314a9e6",
      "page": "/submit-info",
      "required_birthday": true,
      "required_career_status": true,
      "required_career_type": true,
      "required_credit_status": true,
      "required_full_name": true,
      "required_gender": true,
      "required_having_loan": true,
      "required_income": true,
      "required_income_type": true,
      "required_location": true,
      "required_national_id": true,
      "send_otp": false,
      "updated_at": "2026-01-08T08:00:36.39525Z",
      "use_ekyc": false
    }
  ],
  "updated_at": "2026-01-08T08:00:50.734678Z"
}
```

### 2. POST /leads

**Request:**

```bash
curl -X POST 'https://dop-stg.datanest.vn/leads' \
  -H 'Content-Type: application/json' \
  -d '{
    "flow_id": "2ff645ad-2f98-4299-95d2-8b890b24c1cf",
    "tenant": "11111111-1111-1111-1111-111111111111",
    "deviece_info": {},
    "tracking_params": {},
    "info": {
      "flow_id": "2ff645ad-2f98-4299-95d2-8b890b24c1cf",
      "step_id": "d7ceabac-ad42-4253-abb4-6c60a0fd0a4f",
      "purpose": "cd_loan",
      "full_name": "Trung",
      "national_id": "001022311411",
      "phone_number": "0961214444",
      "gender": "female",
      "birthday": "2001-04-04",
      "loan_amount": 65,
      "loan_period": 16,
      "location": "f505aa93-afd0-4c56-a09a-d8598c00b838",
      "career_status": "unemployed",
      "career_type": "asdas",
      "income_type": "cash",
      "income": 7500000,
      "having_loan": "no_loan",
      "credit_status": "bad_debt_last3_year"
    },
    "consent_id": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

**Response:**

```json
{
  "id": "019d672f-48e1-7408-9b2f-330e5fcd2bd5",
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzbWFydGRvcCIsInN1YiI6ImF1dGhlbnRpY2F0aW9uIiwiZXhwIjoxNzc1NjM5MDQ1LCJuYmYiOjE3NzU1NTI2NDUsImlhdCI6MTc3NTU1MjY0NSwidWlkIjoiMDE5ZDY3MmYtNDhlMS03NDA4LTliMmYtMzMwZTVmY2QyYmQ1In0.LoxWwgFWFU9S_y1MdFDwiUg1U0AaNK3XxCpOq-H9k9nnAT5oVIhc9D8z60DDZC128I_Yg9a8fdu07uIuCf_lEAzQCAvi7A-1H-i4gX-vCr1pWE2w5zeXzYJnOdjtPVlSFxK4vlX5sfZyEvyIgzgY8PnA6tkh_5CaA6lpnqc1gOMbFMbvfLxmgVAzd41tzqRLF-Inm2f4fk_JVkBm6yBIRDDl6YKB1H6QlDFUN1JdxarL25DqskJg4tZxQZSBxcEhaTi4QRbH0nqAWPdv-J40E9GswsbcmxCRuNtkN4esE92MxX3YDIOP5bfK9-8AgvxOgBTPNxrflFcIwYwWIm2Gcr-sW0pk4H_MSfxeJGBmUPSAb5JKwxdUY2y_u_BvGCvOwPc0fPre7qAljSo3nCT-01V6tQNVk6L13mJXx9Fw_1DLRCtumNvdQuyjMOkSOWbhpEwOVOEueyykhk7dU-tI5N_bZTC4vzhT3H9sGesJHiTvty-KIS2wgIxHkwT950aMk5R5BytCMYWbqraKM5KGwwKRSCjCFzJMB3fHV1z1_LfeaLViwBafIYYnIkdbHGpBqW4oor5Yukjs-Ds_QytTzELbScgGiVjtEiSFfve3ftn2tg3NfCUx6cnkPAsy8k7u9LjSql__21GAe4Caj1OmBri7Fu_mpM3XubiAxZDDLfI"
}
```

**JWT Token Structure:**

```json
{
  "iss": "smartdop",
  "sub": "authentication",
  "exp": 1775639045,
  "nbf": 1775552645,
  "iat": 1775552645,
  "uid": "019d672f-48e1-7408-9b2f-330e5fcd2bd5"
}
```

### 3. POST /leads/{id}/submit-info

**Request:**

```bash
curl -X POST 'https://dop-stg.datanest.vn/leads/019d672f-48e1-7408-9b2f-330e5fcd2bd5/submit-info' \
  -H 'Content-Type: application/json' \
  -d '{
    "flow_id": "2ff645ad-2f98-4299-95d2-8b890b24c1cf",
    "step_id": "76ba90f3-abe5-4c74-bb49-350e7314a9e6",
    "purpose": "cd_loan",
    "full_name": "Trung",
    "national_id": "001022244244",
    "phone_number": "0961214444",
    "gender": "male",
    "birthday": "2001-03-28",
    "loan_amount": 65,
    "loan_period": 16,
    "location": "107125d4-43f2-4861-a1a6-7b91e2de95b2",
    "career_status": "self_employed",
    "career_type": "fasdasd",
    "income_type": "transfer",
    "income": 15000000,
    "having_loan": "one_loan",
    "credit_status": "bad_debt_last3_year"
  }'
```

**Response:**

```json
{}
```

### 4. POST /leads/{id}/submit-otp

**Request:**

```bash
curl -X POST 'https://dop-stg.datanest.vn/leads/{lead_id}/submit-otp' \
  -H 'Authorization: Bearer {token}' \
  -H 'Content-Type: application/json' \
  -d '{
    "token": "{jwt_token}",
    "otp": "123400"
  }'
```

### 5. GET /leads/{id}

**Request:**

```bash
curl 'https://dop-stg.datanest.vn/leads/019d672f-48e1-7408-9b2f-330e5fcd2bd5'
```

**Response:**

```json
{
  "distribution_status": "pending",
  "is_forwarded": false
}
```

## Key Identifiers for Testing

| Entity               | ID                                     |
| -------------------- | -------------------------------------- |
| Flow ID              | `2ff645ad-2f98-4299-95d2-8b890b24c1cf` |
| Step 1 (index)       | `d7ceabac-ad42-4253-abb4-6c60a0fd0a4f` |
| Step 2 (submit-info) | `76ba90f3-abe5-4c74-bb49-350e7314a9e6` |
| Tenant               | `11111111-1111-1111-1111-111111111111` |
| Consent ID           | `550e8400-e29b-41d4-a716-446655440000` |
| Location 1           | `f505aa93-afd0-4c56-a09a-d8598c00b838` |
| Location 2           | `107125d4-43f2-4861-a1a6-7b91e2de95b2` |

## Flow Configuration Summary

### Step 1: /index (with OTP)

- **ID:** `d7ceabac-ad42-4253-abb4-6c60a0fd0a4f`
- **Fields:** phone_number (required), purpose (required)
- **Features:** send_otp=true, use_ekyc=false

### Step 2: /submit-info

- **ID:** `76ba90f3-abe5-4c74-bb49-350e7314a9e6`
- **Fields:** full_name, national_id, gender, birthday, location, career_status, career_type, income_type, income, having_loan, credit_status (all required)
- **Features:** send_otp=false, use_ekyc=false

## Mock Data Files Updated

1. `src/__tests__/msw/profiles/default.ts` - Default profile with real flow configuration
2. `src/__tests__/msw/handlers/dop.ts` - MSW handlers with realistic response formats
