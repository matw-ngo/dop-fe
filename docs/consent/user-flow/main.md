# Consent System Flow Analysis

This document describes the exact implementation of the Consent checking and tracking system inside `dop-fe` for anonymous users via Session IDs, traced directly from the source code implementation.

### High-Level Concepts
The application checks for consent using a `session_id`, bypassing the need for an authenticated user for early-stage consent agreements (like tracking cookies or terms of usage).

The decision to show the `ConsentModal` happens actively at the page or form level, specifically by cross-referencing:
1. The required **Consent Purpose** dictated by the Tenant's active Flow Step.
2. The latest **Consent Version** associated with that Consent Purpose.
3. The actual **User Consent** record tagged to the visitor's locally stored `session_id`.

---

## 1. Application Initialization 

When a user visits a generic entry point (e.g., `app/[locale]/page.tsx` or loads the `DynamicLoanForm`), a few background tasks automatically trigger in parallel via React Query hooks.

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant App as Web App (Page/Form)
    participant Hook as Custom Hooks
    participant Local as Local Storage
    participant API as Backend API

    User->>App: Visits Homepage
    
    %% Session Generation
    App->>Hook: useConsentSession()
    Hook->>Local: Check 'consent_session_id'
    alt Exists & Valid (< 30 days)
        Local-->>Hook: Return existing Session ID
    else Missing or Expired
        Hook->>Hook: Generate UUID v4
        Hook->>Local: Store new Session ID + Timestamp
    end
    Hook-->>App: session_id
    
    %% Flow & Purpose Resolution
    App->>API: GET /flows/{tenant_id} 
    API-->>App: flowConfig
    App->>App: Match current page path to Step (e.g., /index)
    App->>App: Extract consent_purpose_id from Step
```

---

## 2. Consent Verification & Modal Trigger

Once the `consent_purpose_id` and `session_id` are loaded, the app evaluates whether the user has previously yielded to the exact, most recent version of this purpose.

```mermaid
sequenceDiagram
    autonumber
    participant App as Web App
    participant Hook as React Query
    participant API as Backend API

    App->>Hook: useConsentPurpose(purpose_id)
    Hook->>API: GET /consent-purpose/{id}
    API-->>Hook: Return Purpose Object (includes latest_version_id)

    App->>Hook: useUserConsent(session_id)
    Hook->>API: GET /consent?session_id=...&action=grant
    API-->>Hook: user_consent_record

    App->>App: Evaluate Conditions
    
    alt user_consent_record == null
        App->>App: Decision: SHOW MODAL (No previous grant)
    else user_consent.consent_version_id != latest_version_id
        App->>App: Decision: SHOW MODAL (Outdated version)
    else user_consent.action != "grant"
        App->>App: Decision: SHOW MODAL (Revoked or Invalid)
    else All constraints match
        App->>App: Decision: HIDE MODAL (Valid & up-to-date)
    end
```

---

## 3. User Interaction Handling (The Modal)

If the active constraints require action, `<ConsentModal />` is rendered. This modal retrieves data categories and consent terms to display the legal language, then handles user decisions.

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Modal as ConsentModal
    participant Store as Zustand (useConsentStore)
    participant API as Backend API

    note over Modal: Modal is triggered from Step 2's decision.

    Modal->>API: GET /data-category (To list available data categories)

    User->>Modal: Reads terms & Clicks "Agree"

    Modal->>API: POST /consent
    Note right of API: Body: { tenant_id, consent_version_id, session_id, source: "web", lead_id? }
    API-->>Modal: new_consent_id

    Modal->>API: POST /consent-log
    Note right of API: Body: { tenant_id, consent_id, action: "grant", action_by: "user", source: "web" }
    API-->>Modal: log_id

    Modal->>Store: setConsentId(newConsentId)
    Modal->>Store: setConsentStatus("agreed")
    Modal->>Store: setConsentData(...)

    Modal->>User: Close Modal & Proceed with App Flow
```

### User Actions Breakdown

**Scenario 1: User Agrees (New Consent)**
- User has no previous consent record → Modal shown
- User clicks "Agree" → FE calls `POST /consent` (creates new record)
- FE calls `POST /consent-log` with `action: "grant"` (audit trail)
- Modal closes, app proceeds

**Scenario 2: User Rejects (When Consent Already Exists)**
- User has previous consent record (e.g., already agreed before)
- User clicks "Reject" → FE calls `PATCH /consent/{id}` with `action: "revoke"`
- FE calls `POST /consent-log` with `action: "revoke"` (audit trail)
- Modal closes

**Scenario 3: User Rejects (No Consent Yet)**
- User has no previous consent record
- User clicks "Reject" → Modal simply closes, no API calls (no record to revoke)

---

## 4. Consent History Tab (Form đồng thuận > Lịch sử đồng thuận)

The history tab can read data from `GET /consent-log`, but this endpoint currently requires `consent_id` as the filter key.

```mermaid
sequenceDiagram
    autonumber
    participant Modal as ConsentModal
    participant API as Backend API

    Modal->>API: GET /consent?session_id=...&action=grant
    API-->>Modal: consent record (contains id)

    alt consent exists
        Modal->>API: GET /consent-log?consent_id={consent_id}&page=1&page_size=10
        API-->>Modal: consent_logs + pagination
        Modal->>Modal: Render history list
    else no consent
        Modal->>Modal: Render empty history state
    end
```

### Notes

- In current `consent.yaml`, `GET /consent-log` supports query params: `search`, `consent_id`, `action`, `page`, `page_size`.
- `session_id` and `lead_id` are not available as query filters for this endpoint in the current spec.
