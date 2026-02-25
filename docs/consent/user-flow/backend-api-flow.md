# Consent System: API Integration & Backend Flow

## 1. Initial Load & Verification Flow

When a user visits a page, the client must determine if the user needs to sign a consent agreement by resolving the required `consent_purpose_id` and checking their current status against their active `session_id`.

```mermaid
sequenceDiagram
    participant Client as Frontend
    participant API as Backend Services

    %% Configuration resolution
    Note over Client,API: Phase 1: Determine Required Consent
    Client->>API: GET /flows/{tenant_id}
    API-->>Client: 200 OK (Returns active flow steps)

    Client->>Client: Deduce active consent_purpose_id from Step mapping

    %% Fetch the active purpose.
    Client->>API: GET /consent-purpose/{id}
    API-->>Client: 200 OK (Returns purpose object including latest_version_id)

    %% Session verification
    Note over Client,API: Phase 2: Check Session Status
    Client->>API: GET /consent?session_id={uuid}&action=grant
    API-->>Client: 200 OK (Returns existing consent record if found)

    Note over Client: Client compares the user's fetched consent_version_id <br/>against the latest version. If missing or outdated, prompts User.
```

## 2. User Action: Agree to Terms

If the user evaluates the modal and decides to accept the terms, the frontend creates a new consent record and logs the action.

```mermaid
sequenceDiagram
    participant Client as Frontend
    participant API as Backend Services

    %% Data Categories Fetch (for display)
    Note over Client,API: Display Preparation
    Client->>API: GET /data-category
    API-->>Client: 200 OK (Returns available data categories)

    %% Consent Creation & Logging
    Note over Client,API: Execution Transaction
    Client->>API: POST /consent
    Note right of Client: Body: { tenant_id, consent_version_id, session_id, source: "web", lead_id? }
    API-->>Client: 201 Created (Returns new consent_id)

    Client->>API: POST /consent-log
    Note right of Client: Body: { tenant_id, consent_id, action: "grant", action_by: "user", source: "web" }
    API-->>Client: 201 Created (Returns log_id)
```

## 3. User Action: Reject / Revoke Consent

### Case A: User has existing consent and wants to revoke

If a user comes back and explicitly revokes consent (already agreed before).

```mermaid
sequenceDiagram
    participant Client as Frontend
    participant API as Backend Services

    Client->>API: PATCH /consent/{consent_id}
    Note right of Client: Body: { action: "revoke" }
    API-->>Client: 200 OK (Updates consent with revoke action)

    Client->>API: POST /consent-log
    Note right of Client: Body: { tenant_id, consent_id, action: "revoke", action_by: "user", source: "web" }
    API-->>Client: 201 Created (Logs the revocation)
```

### Case B: User rejects on initial prompt (no consent yet)

If user clicks "Reject" when no consent record exists, the modal simply closes with no API calls.

---
