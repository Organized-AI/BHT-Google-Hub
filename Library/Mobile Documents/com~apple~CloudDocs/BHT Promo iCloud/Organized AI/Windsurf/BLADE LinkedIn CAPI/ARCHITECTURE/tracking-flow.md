# BLADE LinkedIn Tracking Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         BLADE Website (www.blade.com)                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌──────────────┐                                                      │
│   │   User       │                                                      │
│   │   Browser    │                                                      │
│   └──────┬───────┘                                                      │
│          │                                                               │
│          ▼                                                               │
│   ┌──────────────────────────────────────────────────────────────┐     │
│   │                    GTM Web Container                          │     │
│   │                    (GTM-W9S77T7)                              │     │
│   │  ┌────────────────────────────────────────────────────────┐  │     │
│   │  │ LinkedIn Insight Tag Base                              │  │     │
│   │  │ - Fires: All Pages                                     │  │     │
│   │  │ - Purpose: Pageview, Audience Building                 │  │     │
│   │  └────────────────────────────────────────────────────────┘  │     │
│   │  ┌────────────────────────────────────────────────────────┐  │     │
│   │  │ LinkedIn Lead Conversion                               │  │     │
│   │  │ - Fires: CompleteRegistration                          │  │     │
│   │  │ - Event ID: {{CJS - LinkedIn Event ID}}                │  │     │
│   │  └────────────────────────────────────────────────────────┘  │     │
│   └──────────────────────────┬───────────────────────────────────┘     │
│                              │                                          │
│                              │ (Client-side request)                    │
│                              ▼                                          │
│   ┌──────────────────────────────────────────────────────────────┐     │
│   │                    GTM Server Container                       │     │
│   │                    (GTM-KJHX6KJ7)                             │     │
│   │                    Hosted on Stape                            │     │
│   │  ┌────────────────────────────────────────────────────────┐  │     │
│   │  │ Stape LinkedIn CAPI Tag                                │  │     │
│   │  │ - Receives: All events with Event Name                 │  │     │
│   │  │ - Event ID: Same as client-side                        │  │     │
│   │  │ - Enhanced: SHA256 email, user params                  │  │     │
│   │  └────────────────────────────────────────────────────────┘  │     │
│   └──────────────────────────┬───────────────────────────────────┘     │
│                              │                                          │
└──────────────────────────────┼──────────────────────────────────────────┘
                               │ (Server-to-server API call)
                               ▼
                    ┌──────────────────────┐
                    │   LinkedIn API       │
                    │   (CAPI Endpoint)    │
                    │   ─────────────────  │
                    │   Deduplication:     │
                    │   Matches event_id   │
                    │   from both sources  │
                    └──────────────────────┘
```

## Conversion Flow (Lead)

```
User submits form
    │
    ▼
dataLayer.push({
  event: 'CompleteRegistration',
  event_id: 'abc123',
  email: 'user@example.com'
})
    │
    ├────────────────────────────────────┐
    │                                    │
    ▼                                    ▼
┌─────────────────────┐    ┌─────────────────────┐
│ Client-Side         │    │ Server-Side         │
│ Insight Tag         │    │ CAPI Tag            │
├─────────────────────┤    ├─────────────────────┤
│ event_id: abc123    │    │ event_id: abc123    │
│ conversion: Lead    │    │ conversion: Lead    │
└──────────┬──────────┘    └──────────┬──────────┘
           │                          │
           └──────────┬───────────────┘
                      │
                      ▼
            ┌─────────────────┐
            │ LinkedIn        │
            │ Deduplication   │
            │ ───────────────│
            │ Same event_id  │
            │ = 1 conversion │
            └─────────────────┘
```

## Event ID Strategy

| Event Type | Client-Side Event ID | Server-Side Event ID | Source |
|------------|---------------------|---------------------|--------|
| Lead | {{CJS - LinkedIn Event ID}} | From dataLayer event_id | dataLayer |
| Purchase | {{DL_transaction_id}} | {{DL_transaction_id}} | Transaction ID |
