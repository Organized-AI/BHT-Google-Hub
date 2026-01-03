# Multi-Platform Ad Tracking Implementation Path

## Current State: LinkedIn Only

```
BLADE GTM Setup (Current)
├── Web Container (GTM-W9S77T7)
│   ├── LinkedIn Insight Tag Base
│   └── LinkedIn Lead Conversion
└── Server Container (GTM-KJHX6KJ7)
    └── LinkedIn CAPI (via Stape)
```

## Target State: All Major Platforms

```
BLADE GTM Setup (Target)
├── Web Container (GTM-W9S77T7)
│   ├── LinkedIn Insight Tag Base + Conversions
│   ├── Meta Pixel Base + Conversions
│   ├── Google Ads Conversion Linker + Tags
│   └── TikTok Pixel Base + Conversions
│
└── Server Container (GTM-KJHX6KJ7)
    ├── LinkedIn CAPI
    ├── Meta Conversions API
    ├── Google Ads Enhanced Conversions
    └── TikTok Events API
```

---

## Platform Implementation Matrix

| Platform | Web Template | Server Template | Event ID Field | Dedup Window |
|----------|-------------|-----------------|----------------|--------------|
| LinkedIn | InsightTag 2.0 | Stape CAPI | `event_id` | 48 hours |
| Meta | Facebook Pixel | Stape CAPI | `eventID` | 48 hours |
| Google Ads | Native GTM | Native GTM | `transaction_id` | Automatic |
| TikTok | TikTok Pixel | Stape Events API | `event_id` | 48 hours |

---

## Phase A: Meta Ads (Facebook/Instagram)

### A1. Credentials Required

| Credential | Where to Get |
|------------|--------------|
| **Pixel ID** | Meta Events Manager → Data Sources → Pixel ID |
| **Access Token** | Meta Events Manager → Settings → Generate Access Token |

### A2. Web Container Setup

**Template Installation:**
```json
{
  "name": "Facebook Pixel",
  "galleryReference": {
    "host": "github.com",
    "owner": "nicobentin",
    "repository": "facebook-pixel-gtm-template",
    "version": "main"
  }
}
```

**Tags to Create:**

| Tag Name | Event | Trigger |
|----------|-------|---------|
| Meta - Pixel Base | PageView | All Pages (2147479553) |
| Meta - Lead | Lead | CompleteRegistration (305) |
| Meta - Purchase | Purchase | Purchase (10) |

### A3. Server Container Setup

**Template Installation:**
```json
{
  "name": "Facebook CAPI",
  "galleryReference": {
    "host": "github.com",
    "owner": "stape-io",
    "repository": "facebook-conversion-api-tag",
    "version": "main"
  }
}
```

**Tags to Create:**

| Tag Name | Event | Trigger | User Data |
|----------|-------|---------|-----------|
| Meta CAPI - PageView | PageView | GA4 PageView | _fbp, _fbc |
| Meta CAPI - Lead | Lead | GA4 Lead | email, phone, fn, ln |
| Meta CAPI - Purchase | Purchase | GA4 Purchase | email, phone, value |

### A4. Variables Needed

| Variable | Type | Purpose |
|----------|------|---------|
| `CONST - Meta Pixel ID` | Constant | Your Pixel ID |
| `CONST - Meta Access Token` | Constant | CAPI token (sGTM only) |
| `Cookie - _fbp` | 1st Party Cookie | Facebook browser ID |
| `Cookie - _fbc` | 1st Party Cookie | Facebook click ID |

---

## Phase B: Google Ads

### B1. Credentials Required

| Credential | Where to Get |
|------------|--------------|
| **Conversion ID** | Google Ads → Tools → Conversions → ID (AW-XXXXXXXXX) |
| **Conversion Label** | Same location, per-action label |

### B2. Web Container Setup

**No template needed - native GTM tags:**

| Tag Name | Type | Trigger |
|----------|------|---------|
| Google Ads - Conversion Linker | `cl` | All Pages |
| Google Ads - Lead | `awct` | CompleteRegistration (305) |
| Google Ads - Purchase | `awct` | Purchase (10) |

**Tag Configuration (Lead):**
```
Type: awct (Google Ads Conversion Tracking)
Parameters:
  - conversionId: AW-XXXXXXXXX
  - conversionLabel: AbCdEfGh
  - conversionValue: {{DL_value}} (optional)
  - currencyCode: USD
  - transactionId: {{DL_transaction_id}}
```

### B3. Server Container Setup (Enhanced Conversions)

**Native GTM tag for enhanced conversions:**

| Tag Name | Type | User Data |
|----------|------|-----------|
| Google Ads EC - Lead | Google Ads Conversion | email, phone |
| Google Ads EC - Purchase | Google Ads Conversion | email, phone, address |

### B4. Variables Needed

| Variable | Type | Purpose |
|----------|------|---------|
| `CONST - GAds Conversion ID` | Constant | AW-XXXXXXXXX |
| `CONST - GAds Lead Label` | Constant | Conversion label |
| `CONST - GAds Purchase Label` | Constant | Conversion label |
| `DL_value` | Data Layer | Conversion value |
| `DL_currency` | Data Layer | Currency (USD) |

---

## Phase C: TikTok Ads

### C1. Credentials Required

| Credential | Where to Get |
|------------|--------------|
| **Pixel ID** | TikTok Ads Manager → Assets → Events → Web Events |
| **Access Token** | TikTok Events Manager → Settings → Generate Token |

### C2. Web Container Setup

**Template Installation:**
```json
{
  "name": "TikTok Pixel",
  "galleryReference": {
    "host": "github.com",
    "owner": "nicobentin",
    "repository": "tiktok-pixel-template",
    "version": "main"
  }
}
```

**Tags to Create:**

| Tag Name | Event | Trigger |
|----------|-------|---------|
| TikTok - Pixel Base | PageView | All Pages (2147479553) |
| TikTok - Lead | CompleteRegistration | CompleteRegistration (305) |
| TikTok - Purchase | PlaceAnOrder | Purchase (10) |

### C3. Server Container Setup

**Template Installation:**
```json
{
  "name": "TikTok Events API",
  "galleryReference": {
    "host": "github.com",
    "owner": "stape-io",
    "repository": "tiktok-events-api-tag",
    "version": "main"
  }
}
```

**Tags to Create:**

| Tag Name | Event | User Data |
|----------|-------|-----------|
| TikTok EAPI - Lead | CompleteRegistration | email, phone, ttp, ttclid |
| TikTok EAPI - Purchase | PlaceAnOrder | email, phone, value |

### C4. Variables Needed

| Variable | Type | Purpose |
|----------|------|---------|
| `CONST - TikTok Pixel ID` | Constant | Your Pixel ID |
| `CONST - TikTok Access Token` | Constant | Events API token (sGTM) |
| `Cookie - _ttp` | 1st Party Cookie | TikTok browser ID |
| `URL - ttclid` | URL Parameter | TikTok click ID |

---

## Shared Infrastructure

### Unified Event ID Generator

All platforms must use the SAME event ID for deduplication:

```javascript
// CJS - Unified Event ID
function() {
  // Check dataLayer first
  var dl = window.dataLayer || [];
  for (var i = dl.length - 1; i >= 0; i--) {
    if (dl[i] && dl[i].event_id) return dl[i].event_id;
  }

  // Generate new
  return 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}
```

### Existing Variables to Reuse

From your current config:

| Variable | Used By |
|----------|---------|
| `{{DL_email}}` | All platforms |
| `{{DL_first_name}}` | Meta, TikTok |
| `{{DL_last_name}}` | Meta, TikTok |
| `{{DL_event_id}}` | All platforms |
| `{{DL_transaction_id}}` | Google Ads |

### Existing Triggers to Reuse

| Trigger | ID | Used By |
|---------|-----|---------|
| All Pages | 2147479553 | All base/pageview tags |
| CompleteRegistration | 305 | All lead tags |
| Purchase | 10 | All purchase tags |

---

## Architecture: Deduplication Flow

```
User Action → Form Submit → dataLayer.push({event_id: "abc123"})
         ↓
    ┌─────────────────────────────────────────────┐
    │ WEB CONTAINER (Client-Side)                 │
    │ ├── LinkedIn Insight (event_id: abc123)     │
    │ ├── Meta Pixel (eventID: abc123)            │
    │ ├── Google Ads (transaction_id: abc123)     │
    │ └── TikTok Pixel (event_id: abc123)         │
    └──────────────────┬──────────────────────────┘
                       │ GA4 transport carries event_id
                       ▼
    ┌─────────────────────────────────────────────┐
    │ SERVER CONTAINER (Server-Side)              │
    │ ├── LinkedIn CAPI (event_id: abc123) → DEDUP│
    │ ├── Meta CAPI (eventID: abc123) → DEDUP     │
    │ ├── Google EC (transaction_id: abc123)      │
    │ └── TikTok EAPI (event_id: abc123) → DEDUP  │
    └─────────────────────────────────────────────┘
```

---

## Implementation Order (Recommended)

| Order | Platform | Reason |
|-------|----------|--------|
| 1 | LinkedIn | Already in progress |
| 2 | Meta | Highest volume, most common |
| 3 | Google Ads | Often existing, needs enhancement |
| 4 | TikTok | Similar pattern to Meta |

---

## Quick Commands

Once credentials are gathered, use these prompts:

```bash
# Meta Ads
"Deploy Meta Pixel and CAPI for BLADE using Pixel ID: XXXXXXX"

# Google Ads
"Deploy Google Ads conversion tracking for BLADE using ID: AW-XXXXXXX"

# TikTok Ads
"Deploy TikTok Pixel and Events API for BLADE using Pixel ID: XXXXXXX"

# All at once
"Deploy multi-platform tracking for BLADE - I have credentials for Meta, Google Ads, and TikTok ready"
```

---

## Credential Checklist

Before implementation, gather:

### Meta
- [ ] Pixel ID: ________________
- [ ] Access Token: ________________

### Google Ads
- [ ] Conversion ID (AW-): ________________
- [ ] Lead Label: ________________
- [ ] Purchase Label: ________________

### TikTok
- [ ] Pixel ID: ________________
- [ ] Access Token: ________________

### LinkedIn (Already have)
- [ ] Partner ID: [FROM_CAMPAIGN_MANAGER]
- [ ] Lead Conversion ID: 25208314

---

## Validation Checklist

Per platform after deployment:

- [ ] Web tag fires on correct trigger (check GTM Preview)
- [ ] Server tag receives event (check sGTM logs)
- [ ] Event ID matches client ↔ server
- [ ] User data hashed correctly (Meta, TikTok)
- [ ] Platform dashboard shows conversions
- [ ] Dedup working (not double-counting)

---

## Resources

| Platform | API Docs | Template Repo |
|----------|----------|---------------|
| LinkedIn | [CAPI Docs](https://learn.microsoft.com/linkedin/marketing/integrations/ads-reporting/conversions-api) | linkedin/linkedin-gtm-community-template |
| Meta | [Conversions API](https://developers.facebook.com/docs/marketing-api/conversions-api) | stape-io/facebook-conversion-api-tag |
| Google | [Enhanced Conversions](https://developers.google.com/google-ads/api/docs/conversions/enhanced-conversions) | Native GTM |
| TikTok | [Events API](https://business-api.tiktok.com/portal/docs?id=1771101027431425) | stape-io/tiktok-events-api-tag |
