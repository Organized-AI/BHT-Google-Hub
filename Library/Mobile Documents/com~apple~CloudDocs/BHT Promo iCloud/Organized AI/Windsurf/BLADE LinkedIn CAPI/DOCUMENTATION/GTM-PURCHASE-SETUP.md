# GTM Configuration for LinkedIn CAPI Purchase

**Created:** 2026-01-02
**LinkedIn Conversion Rule ID:** 25211994
**LinkedIn Partner ID:** 1009266

---

## Overview

This guide configures GTM (web container) to pass dynamic revenue, event_id, and user data to your sGTM LinkedIn CAPI Purchase tag.

---

## Part 1: Web GTM Variables to Create/Verify

### 1.1 DataLayer Variable: Revenue/Value

**Variable Name:** `DL_value` or `DL_ecommerce_value`

| Setting | Value |
|---------|-------|
| Variable Type | Data Layer Variable |
| Data Layer Variable Name | `ecommerce.value` OR `value` |
| Data Layer Version | Version 2 |

**Alternative paths to check (depends on your dataLayer structure):**
- `ecommerce.purchase.actionField.revenue`
- `ecommerce.value`
- `value`
- `transaction_total`

### 1.2 DataLayer Variable: Currency

**Variable Name:** `DL_currency`

| Setting | Value |
|---------|-------|
| Variable Type | Data Layer Variable |
| Data Layer Variable Name | `ecommerce.currency` OR `currency` |
| Data Layer Version | Version 2 |
| Default Value | `USD` |

### 1.3 DataLayer Variable: Event ID (for deduplication)

**Variable Name:** `DL_event_id` *(already exists per config)*

| Setting | Value |
|---------|-------|
| Variable Type | Data Layer Variable |
| Data Layer Variable Name | `event_id` |
| Data Layer Version | Version 2 |

**If event_id is not in your dataLayer, create a Custom JavaScript variable:**

**Variable Name:** `CJS_event_id`

```javascript
function() {
  // Generate unique event ID if not present in dataLayer
  var eventId = {{DL_event_id}};
  if (eventId) return eventId;

  // Fallback: generate UUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0;
    var v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
```

### 1.4 User Data Variables (already exist per config)

These should already be configured:
- `{{DL_email}}` - User email (will be hashed by LinkedIn)
- `{{DL_first_name}}` - First name
- `{{DL_last_name}}` - Last name

### 1.5 Cookie Variable: li_fat_id

**Variable Name:** `Cookie_li_fat_id`

| Setting | Value |
|---------|-------|
| Variable Type | 1st Party Cookie |
| Cookie Name | `li_fat_id` |

This captures the LinkedIn click ID when users arrive from LinkedIn ads.

---

## Part 2: GA4 Event Tag Configuration (Web GTM)

Your GA4 tag that fires on Purchase should send these parameters to sGTM:

### Event Parameters to Include

| Parameter | Value | Purpose |
|-----------|-------|---------|
| `value` | `{{DL_value}}` | Dynamic revenue |
| `currency` | `{{DL_currency}}` | Currency code |
| `event_id` | `{{CJS_event_id}}` | Deduplication |
| `transaction_id` | `{{DL_transaction_id}}` | Order ID |

### User Properties (if using user_data)

| Parameter | Value |
|-----------|-------|
| `user_data.email` | `{{DL_email}}` |
| `user_data.address.first_name` | `{{DL_first_name}}` |
| `user_data.address.last_name` | `{{DL_last_name}}` |

---

## Part 3: Server GTM LinkedIn CAPI Tag Configuration

In your **sGTM container (GTM-KJHX6KJ7)**, configure the LinkedIn CAPI Purchase tag:

### Tag Settings

| Field | Value |
|-------|-------|
| **Tag Type** | LinkedIn Conversions API (Stape) |
| **Event Type** | Conversion |
| **Access Token** | `AQVEurPuO6j1P4ncd...` (your token) |
| **Conversion Rule ID** | `25211994` |

### Event Data Mapping

| LinkedIn Field | sGTM Variable | Notes |
|----------------|---------------|-------|
| Event ID | `{{Event ID}}` or `{{event_id}}` | From incoming request |
| Conversion Value | `{{Event Data - value}}` | Dynamic revenue |
| Currency | `{{Event Data - currency}}` | Default: USD |

### User Data Mapping

| LinkedIn Field | sGTM Variable | Notes |
|----------------|---------------|-------|
| Email | `{{User Data - email}}` | Auto-hashed by tag |
| First Name | `{{User Data - first_name}}` | Plain text |
| Last Name | `{{User Data - last_name}}` | Plain text |
| LinkedIn Click ID | `{{li_fat_id}}` | From cookie |

### Trigger

Fire on: **Purchase** events from GA4 client
- Event Name equals `purchase`

---

## Part 4: Verification Checklist

### DataLayer Check
Add this to your browser console on a purchase confirmation page:
```javascript
console.log('DataLayer:', dataLayer);
```

Verify these values exist:
- [ ] `event: 'purchase'`
- [ ] `ecommerce.value` or `value`
- [ ] `ecommerce.currency` or `currency`
- [ ] `event_id` (for deduplication)
- [ ] User data (email, name) if available

### GTM Preview Mode Check

1. Open GTM Preview for **web container (GTM-W9S77T7)**
2. Open GTM Preview for **server container (GTM-KJHX6KJ7)**
3. Complete a test purchase
4. Verify:
   - [ ] GA4 tag fires with correct parameters
   - [ ] sGTM receives the event
   - [ ] LinkedIn CAPI tag fires with status 201

### LinkedIn Campaign Manager Check

After test events:
1. Go to **Analyze → Conversions**
2. Find "CAPI - Purchase" conversion
3. Status should change to **Active** within 24 hours
4. Check for deduplication notice if using both client + server

---

## Part 5: Sample DataLayer Push

If you need to update your website's dataLayer, here's the expected format:

```javascript
dataLayer.push({
  event: 'purchase',
  event_id: 'unique-event-id-12345',  // Critical for deduplication
  ecommerce: {
    transaction_id: 'ORDER-789',
    value: 149.99,
    currency: 'USD',
    items: [/* product array */]
  },
  user_data: {
    email: 'customer@example.com',
    first_name: 'John',
    last_name: 'Doe'
  }
});
```

---

## Quick Reference

| Component | ID/Value |
|-----------|----------|
| LinkedIn Partner ID | `1009266` |
| Purchase Conversion Rule ID | `25211994` |
| Lead Conversion Rule ID | `25208314` |
| Web GTM Container | `GTM-W9S77T7` |
| Server GTM Container | `GTM-KJHX6KJ7` |
| Purchase Trigger ID | `10` |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Value showing $0 | Check `{{DL_value}}` variable path matches your dataLayer |
| Events not deduplicating | Ensure same `event_id` passes to both client & server |
| No user match | Verify `li_fat_id` cookie or email is being sent |
| 401 error in sGTM | Access token expired - regenerate in LinkedIn |
| Events delayed | LinkedIn processes in batches - wait up to 24h |
