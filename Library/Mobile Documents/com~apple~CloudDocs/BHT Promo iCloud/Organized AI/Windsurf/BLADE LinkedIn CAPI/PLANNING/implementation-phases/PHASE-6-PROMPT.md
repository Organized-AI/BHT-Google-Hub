# Phase 6: LinkedIn CAPI Purchase Conversion - sGTM Implementation

**Created:** 2026-01-02
**Objective:** Add LinkedIn CAPI Purchase conversion tracking to sGTM container
**LinkedIn Purchase Conversion Rule ID:** 25211994

---

## Pre-Phase Checklist

- [x] Phase 5 completed (Lead CAPI in sGTM)
- [x] LinkedIn Purchase conversion created in Campaign Manager
- [x] LinkedIn Conversion Rule ID: `25211994`
- [x] LinkedIn Access Token variable exists (ID: 69)

---

## GTM Configuration

| Setting | Value |
|---------|-------|
| Account ID | `4702245012` |
| Server Container ID | `175099610` |
| Server Container Public ID | `GTM-KJHX6KJ7` |
| Workspace ID | `3` |

---

## Tasks to Execute

### Task 1: Create Event Data Variables for Purchase

#### Variable 1: ED - Value
```
gtm_variable action=create accountId=4702245012 containerId=175099610 workspaceId=3 name="ED - Value" type="jsm" parameter='[{"type":"template","key":"javascript","value":"return (function() {\n  var event = require(\"getAllEventData\")();\n  return event.value || event[\"x-ga-mp1-ev\"] || event.ecommerce?.value || 0;\n})();"}]'
```

#### Variable 2: ED - Currency
```
gtm_variable action=create accountId=4702245012 containerId=175099610 workspaceId=3 name="ED - Currency" type="jsm" parameter='[{"type":"template","key":"javascript","value":"return (function() {\n  var event = require(\"getAllEventData\")();\n  return event.currency || event.ecommerce?.currency || \"USD\";\n})();"}]'
```

#### Variable 3: ED - Transaction ID
```
gtm_variable action=create accountId=4702245012 containerId=175099610 workspaceId=3 name="ED - Transaction ID" type="jsm" parameter='[{"type":"template","key":"javascript","value":"return (function() {\n  var event = require(\"getAllEventData\")();\n  return event.transaction_id || event.ecommerce?.transaction_id || \"\";\n})();"}]'
```

### Task 2: Create Purchase Trigger

```
gtm_trigger action=create accountId=4702245012 containerId=175099610 workspaceId=3 name="sGTM - CE - Purchase" type="customEvent" customEventFilter='[{"type":"equals","parameter":[{"type":"template","key":"arg0","value":"{{Event Name}}"},{"type":"template","key":"arg1","value":"purchase"}]}]'
```

**Alternative using ED - Event Name variable:**
```
gtm_trigger action=create accountId=4702245012 containerId=175099610 workspaceId=3 name="sGTM - CE - Purchase" type="customEvent" customEventFilter='[{"type":"equals","parameter":[{"type":"template","key":"arg0","value":"{{ED - Event Name}}"},{"type":"template","key":"arg1","value":"purchase"}]}]'
```

### Task 3: Create LinkedIn CAPI Purchase Tag

Use the existing Stape LinkedIn Conversions API template.

```
gtm_tag action=create accountId=4702245012 containerId=175099610 workspaceId=3 name="LinkedIn - CAPI - Purchase Conversion" type="cvt_175099610_XX" firingTriggerId="[NEW_TRIGGER_ID]" parameter='[
  {"type":"template","key":"accessToken","value":"{{CONST - LinkedIn Access Token}}"},
  {"type":"template","key":"conversionRuleId","value":"25211994"},
  {"type":"template","key":"eventId","value":"{{ED - Event ID}}"},
  {"type":"template","key":"conversionValue","value":"{{ED - Value}}"},
  {"type":"template","key":"currency","value":"{{ED - Currency}}"}
]'
```

**Note:** Replace `cvt_175099610_XX` with the actual template ID from the sGTM container.

---

## Manual GTM UI Instructions (Alternative)

If GTM MCP is not available, create these manually:

### Step 1: Create Variables

Go to **sGTM Container → Variables → User-Defined Variables → New**

#### ED - Value
1. Name: `ED - Value`
2. Type: Custom JavaScript
3. Code:
```javascript
const getAllEventData = require('getAllEventData');
const event = getAllEventData();
return event.value || event['x-ga-mp1-ev'] || (event.ecommerce && event.ecommerce.value) || 0;
```

#### ED - Currency
1. Name: `ED - Currency`
2. Type: Custom JavaScript
3. Code:
```javascript
const getAllEventData = require('getAllEventData');
const event = getAllEventData();
return event.currency || (event.ecommerce && event.ecommerce.currency) || 'USD';
```

#### ED - Transaction ID
1. Name: `ED - Transaction ID`
2. Type: Custom JavaScript
3. Code:
```javascript
const getAllEventData = require('getAllEventData');
const event = getAllEventData();
return event.transaction_id || (event.ecommerce && event.ecommerce.transaction_id) || '';
```

### Step 2: Create Trigger

Go to **sGTM Container → Triggers → New**

1. Name: `sGTM - CE - Purchase`
2. Type: Custom
3. Fire on: Some Events
4. Condition: `{{ED - Event Name}}` equals `purchase`

### Step 3: Create Tag

Go to **sGTM Container → Tags → New**

1. Name: `LinkedIn - CAPI - Purchase Conversion`
2. Type: Stape LinkedIn Conversions API (or existing LinkedIn CAPI template)
3. Configuration:
   - **Event Type:** Conversion
   - **Access Token:** `{{CONST - LinkedIn Access Token}}`
   - **Conversion Rule ID:** `25211994`
   - **Event ID:** `{{ED - Event ID}}`
   - **Conversion Value:** `{{ED - Value}}`
   - **Currency:** `{{ED - Currency}}`
4. Trigger: `sGTM - CE - Purchase`

### Step 4: Add User Data (Optional but Recommended)

In the tag configuration, add user data parameters:
- **Email:** `{{User Data - email}}` or from event data
- **First Name:** `{{User Data - first_name}}`
- **Last Name:** `{{User Data - last_name}}`

---

## Web GTM Tag Verification

Ensure `LI GA4 Event - CAPI - Purchase 25211994` in web container sends:

| Parameter | Variable | Required |
|-----------|----------|----------|
| `value` | Dynamic revenue value | Yes |
| `currency` | Currency code | Yes |
| `event_id` | Unique event ID | Yes (dedup) |
| `transaction_id` | Order ID | Recommended |
| `user_data.email` | Customer email | Recommended |

---

## Success Criteria

- [ ] 3 new variables created in sGTM (ED - Value, ED - Currency, ED - Transaction ID)
- [ ] 1 new trigger created (sGTM - CE - Purchase)
- [ ] 1 new tag created (LinkedIn - CAPI - Purchase Conversion)
- [ ] Tag fires on purchase events in Preview Mode
- [ ] LinkedIn Campaign Manager shows Purchase conversion as Active

---

## Post-Phase Verification

1. Open GTM Preview for sGTM container
2. Trigger a test purchase event
3. Verify:
   - Tag fires with status 201
   - Value is passed correctly
   - Event ID is present for deduplication
4. Check LinkedIn Campaign Manager → Analyze → Conversions
5. Wait 24-48 hours for "CAPI - Purchase" to show Active

---

## Git Commit Message

```
feat(sgtm): Add LinkedIn CAPI Purchase conversion tracking

- Create ED - Value variable for dynamic revenue
- Create ED - Currency variable
- Create ED - Transaction ID variable
- Create sGTM - CE - Purchase trigger
- Create LinkedIn - CAPI - Purchase Conversion tag
- Conversion Rule ID: 25211994

🤖 Generated with Claude Code
```
