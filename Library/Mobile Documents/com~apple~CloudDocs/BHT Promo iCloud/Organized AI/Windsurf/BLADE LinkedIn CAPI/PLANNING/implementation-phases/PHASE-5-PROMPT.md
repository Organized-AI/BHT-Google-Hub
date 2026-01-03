# Phase 5: sGTM Container Audit & LinkedIn CAPI Optimization

**Objective:** Audit the server-side GTM container using the Tidy GTM skill and optimize LinkedIn CAPI tracking for proper deduplication with the web container.

---

## Container Reference

| Setting | Value |
|---------|-------|
| Account ID | `4702245012` |
| Container ID | `175099610` |
| Container Name | ServerSide - Blade |
| Public ID | `GTM-KJHX6KJ7` |
| Workspace ID | `3` |
| Stape URL | `https://yyrcifus.usa.stape.io/` |

---

## Current State Analysis

### Inventory Summary

| Component | Count | Notes |
|-----------|-------|-------|
| Tags | 2 | Both LinkedIn CAPI - potential duplicate |
| Triggers | 1 | Generic "any event" trigger |
| Variables | 0 | No reusable variables |
| Clients | 2 | GA4, GA4_import_1 |
| Templates | 7 | LinkedIn, Meta, TikTok, Snap, Pinterest CAPI |

### Existing Tags

| Tag ID | Name | Type | Trigger | Issue |
|--------|------|------|---------|-------|
| 66 | LI Tag Template - CAPI - Lead 25208314 | cvt_57ZFJ | 65 | Duplicate? Non-standard name |
| 68 | Stape LinkedIn Conversion API | cvt_PBNHC | 65 | Duplicate? Non-standard name |

### Existing Triggers

| Trigger ID | Name | Type | Filter | Issue |
|------------|------|------|--------|-------|
| 65 | LI trigger - CAPI - Lead 25208314 | always | Event Name matches ".+" | TOO GENERIC - fires on ALL events |

### Existing Templates

| Template ID | Name |
|-------------|------|
| 64 | LinkedIn \| CAPI Tag Template |
| 67 | LinkedIn Conversion API (Stape) |
| 14 | Snap ConversionAPI ServerSide |
| 19 | Meta Conversion API |
| 21 | Cookie Extender |
| 27 | TikTok Events API (Official) |
| 54 | Pinterest API for Conversions Tag |

---

## Issues Identified (Tidy GTM Analysis)

| Issue | Severity | Description |
|-------|----------|-------------|
| **Duplicate Tags** | HIGH | Two LinkedIn CAPI tags (66, 68) for same conversion rule 25208314 |
| **Generic Trigger** | HIGH | Trigger fires on ALL events, should only fire on Lead events |
| **No Variables** | MEDIUM | Access Token hardcoded in tags, no reusable variables |
| **Missing Deduplication** | HIGH | No event_id being passed for client/server dedup |
| **Naming Inconsistency** | LOW | Tag names don't follow conventions |

---

## Tasks

### Task 5.1: Create sGTM Variables

Create reusable variables following naming conventions:

#### 5.1.1: CONST - LinkedIn Access Token
```
Type: Constant (c)
Value: [Existing access token from tags]
Purpose: Reusable API access token
```

#### 5.1.2: ED - Event Name
```
Type: Event Data (ed)
Key: event_name
Purpose: Get event name from incoming request
```

#### 5.1.3: ED - Event ID
```
Type: Event Data (ed)
Key: x-li-event-id OR event_id
Purpose: Get event ID for deduplication
```

#### 5.1.4: ED - User Email
```
Type: Event Data (ed)
Key: user_data.email_address OR x-fb-ud-em
Purpose: Get hashed email for enhanced matching
```

### Task 5.2: Fix Trigger

Update trigger to be specific to Lead conversions:

```
Name: sGTM - Lead Event
Type: Custom
Filter: Event Name equals "CompleteRegistration" OR "Lead" OR "lead_form_submit"
```

### Task 5.3: Consolidate Tags

Keep ONE LinkedIn CAPI tag, remove duplicate:

**Keep Tag 68 (Stape LinkedIn Conversion API)** - More feature-rich template
- Update to use variables instead of hardcoded values
- Add event_id parameter for deduplication
- Add user_data parameters for enhanced matching

**Remove Tag 66** - Duplicate

### Task 5.4: Apply Naming Conventions

Rename per Tidy GTM standards:

| Current Name | New Name |
|--------------|----------|
| LI trigger - CAPI - Lead 25208314 | sGTM - CE - Lead |
| Stape LinkedIn Conversion API | LinkedIn - CAPI - Lead Conversion |
| LI Tag Template - CAPI - Lead 25208314 | (DELETE - duplicate) |

### Task 5.5: Validate & Document

1. Check workspace status for conflicts
2. Create version
3. Publish to live
4. Document changes

---

## Execution Commands

### Step 1: Create Variables

```bash
# CONST - LinkedIn Access Token
gtm_variable action=create accountId=4702245012 containerId=175099610 workspaceId=3
  name="CONST - LinkedIn Access Token"
  type="c"
  parameter=[{key: "value", value: "[ACCESS_TOKEN]"}]

# ED - Event Name
gtm_variable action=create accountId=4702245012 containerId=175099610 workspaceId=3
  name="ED - Event Name"
  type="ed"
  parameter=[{key: "eventDataKey", value: "event_name"}]

# ED - Event ID
gtm_variable action=create accountId=4702245012 containerId=175099610 workspaceId=3
  name="ED - Event ID"
  type="ed"
  parameter=[{key: "eventDataKey", value: "event_id"}]
```

### Step 2: Update Trigger

```bash
# Update trigger to be specific
gtm_trigger action=update triggerId=65
  name="sGTM - CE - Lead"
  type="customEvent"
  customEventFilter=[{type: "equals", parameter: [{key: "arg0", value: "{{ED - Event Name}}"}, {key: "arg1", value: "CompleteRegistration"}]}]
```

### Step 3: Update Main Tag

```bash
# Update Tag 68 to use variables and add dedup
gtm_tag action=update tagId=68
  name="LinkedIn - CAPI - Lead Conversion"
  parameter=[
    {key: "accessToken", value: "{{CONST - LinkedIn Access Token}}"},
    {key: "conversionRuleUrn", value: "25208314"},
    {key: "eventId", value: "{{ED - Event ID}}"}
  ]
```

### Step 4: Remove Duplicate Tag

```bash
# Remove duplicate Tag 66
gtm_tag action=remove tagId=66
```

### Step 5: Validate & Publish

```bash
# Check workspace status
gtm_workspace action=getStatus

# Create version
gtm_workspace action=createVersion name="sGTM LinkedIn CAPI Optimization"

# Publish
gtm_version action=publish containerVersionId=[VERSION_ID]
```

---

## Success Criteria

- [ ] Variables created (3-4 new variables)
- [ ] Trigger updated to fire only on Lead events
- [ ] Duplicate tag removed
- [ ] Remaining tag uses variables
- [ ] Naming conventions applied
- [ ] Event deduplication configured
- [ ] Version published to live
- [ ] No workspace conflicts

---

## Deduplication Architecture

```
Web Container (GTM-W9S77T7)          sGTM Container (GTM-KJHX6KJ7)
┌─────────────────────────┐          ┌─────────────────────────┐
│ LinkedIn Insight Tag    │          │ LinkedIn CAPI Tag       │
│ - Partner ID: 1009266   │          │ - Access Token: [...]   │
│ - Conversion: 25208314  │          │ - Conversion: 25208314  │
│ - Event ID: {{CJS...}}  │───────→  │ - Event ID: {{ED...}}   │
└─────────────────────────┘          └─────────────────────────┘
           │                                    │
           └─────────────┬──────────────────────┘
                         ▼
              LinkedIn Conversions API
              (Deduplicates by event_id)
```

---

## Rollback Information

If issues occur, rollback to previous version:
```bash
gtm_version_header action=list accountId=4702245012 containerId=175099610 includeDeleted=false
gtm_version action=publish containerVersionId=[PREVIOUS_VERSION_ID]
```

---

## Completion Template

After completing this phase, create `PHASE-5-COMPLETE.md` with:
- Variables created (IDs)
- Trigger changes made
- Tags modified/removed
- Version published (ID, fingerprint)
- Final container state
