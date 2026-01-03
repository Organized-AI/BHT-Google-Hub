# BLADE LinkedIn Insight Tag Implementation Plan

## Current Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        BLADE GTM Setup                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────┐      ┌──────────────────────┐       │
│  │   Web Container      │      │   Server Container   │       │
│  │   www.blade.com      │      │   ServerSide - Blade │       │
│  │   GTM-W9S77T7        │      │   GTM-KJHX6KJ7       │       │
│  │   (42412215)         │      │   (175099610)        │       │
│  ├──────────────────────┤      ├──────────────────────┤       │
│  │ ✅ Facebook Pixel    │      │ ✅ LI CAPI - Lead    │       │
│  │ ✅ Google Tags       │ ───► │ ✅ Stape LI CAPI     │       │
│  │ ✅ Microsoft/Bing    │      │                      │       │
│  │ ❌ LinkedIn Insight  │      │ Conversion Rule:     │       │
│  │    (TO BE ADDED)     │      │ 25208314             │       │
│  └──────────────────────┘      └──────────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

## Implementation Strategy

**Dual-Tracking Architecture:**
- **Client-Side (Insight Tag)**: For pageviews, audience building, and basic conversion tracking
- **Server-Side (CAPI)**: For enhanced matching, ad-blocker bypass, and high-fidelity conversion data

**Deduplication**: Both client & server events share the same `event_id` to prevent double-counting.

---

## Deduplication Architecture

```
   User Action (Form Submit)
         │
         ▼
   ┌─────────────┐
   │ Generate    │
   │ event_id:   │
   │ "abc123xyz" │
   └─────────────┘
         │
    ─────┴─────
   │           │
   ▼           ▼
 Client     Server
 Insight    CAPI
 Tag        Tag
   │           │
   └─────┬─────┘
         ▼
   LinkedIn
   Deduplication
   (Counts as 1)
```

---

## GTM Tag Summary

| Tag Name | Trigger | Event ID |
|----------|---------|----------|
| LinkedIn - Insight Tag Base | All Pages | N/A |
| LinkedIn - Lead Conversion | CompleteRegistration | `{{DL_event_id}}` |
