# Phase 1: Variable Creation

## Context Files to Read First
1. `CONFIG/config.json` - GTM IDs and LinkedIn Partner ID
2. `SPECIFICATIONS/tag-specs.md` - Variable specifications
3. `PLANNING/implementation-phases/PHASE-0-COMPLETE.md` - Template ID from Phase 0

## Objective
Create 3 GTM variables required for LinkedIn Insight Tag tracking.

---

## Prerequisites
- [ ] Phase 0 complete (template installed)
- [ ] LinkedIn Partner ID obtained from user

---

## Tasks

### Task 1.1: Prompt for Partner ID (If Not Provided)

If `CONFIG/config.json` still has placeholder:

**Ask user:**
> "Please provide your LinkedIn Partner ID from Campaign Manager → Account Assets → Insight Tag"

**Expected format:** 6-7 digit number (e.g., `1234567`)

---

### Task 1.2: Create CONST - LinkedIn Partner ID

```
gtm_variable action=create
  accountId=4702245012
  containerId=42412215
  workspaceId=86
  createOrUpdateConfig={
    "name": "CONST - LinkedIn Partner ID",
    "type": "c",
    "parameter": [
      {
        "type": "template",
        "key": "value",
        "value": "[PARTNER_ID_FROM_USER]"
      }
    ]
  }
```

**Expected:** Variable created with ID

---

### Task 1.3: Create CJS - LinkedIn Event ID

```
gtm_variable action=create
  accountId=4702245012
  containerId=42412215
  workspaceId=86
  createOrUpdateConfig={
    "name": "CJS - LinkedIn Event ID",
    "type": "jsm",
    "parameter": [
      {
        "type": "template",
        "key": "javascript",
        "value": "function() {\n  var dlEventId = {{DL_event_id}};\n  if (dlEventId) return dlEventId;\n  var txnId = {{DL_transaction_id}};\n  if (txnId) return 'li_' + txnId;\n  return 'li_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);\n}"
      }
    ]
  }
```

**Expected:** Variable created with ID

---

### Task 1.4: Create Cookie - li_fat_id

```
gtm_variable action=create
  accountId=4702245012
  containerId=42412215
  workspaceId=86
  createOrUpdateConfig={
    "name": "Cookie - li_fat_id",
    "type": "k",
    "parameter": [
      {
        "type": "template",
        "key": "name",
        "value": "li_fat_id"
      }
    ]
  }
```

**Expected:** Variable created with ID

---

### Task 1.5: Verify All Variables Created

```
gtm_variable action=list
  accountId=4702245012
  containerId=42412215
  workspaceId=86
```

**Verify in response:**
- [ ] `CONST - LinkedIn Partner ID` exists
- [ ] `CJS - LinkedIn Event ID` exists
- [ ] `Cookie - li_fat_id` exists

---

## Success Criteria

- [ ] 3 variables created successfully
- [ ] Partner ID variable contains correct value
- [ ] Event ID variable has JavaScript function
- [ ] Cookie variable references `li_fat_id`

---

## Output

Variables created:
```
1. CONST - LinkedIn Partner ID → ID: [VAR_ID]
2. CJS - LinkedIn Event ID → ID: [VAR_ID]
3. Cookie - li_fat_id → ID: [VAR_ID]
```

---

## Completion

After all tasks complete successfully:

1. Create `PLANNING/implementation-phases/PHASE-1-COMPLETE.md`:

```markdown
# Phase 1: Variable Creation - COMPLETE

**Completed:** [TIMESTAMP]
**Partner ID Used:** [PARTNER_ID]

## Variables Created
| Name | Type | Variable ID |
|------|------|-------------|
| CONST - LinkedIn Partner ID | Constant | [ID] |
| CJS - LinkedIn Event ID | Custom JS | [ID] |
| Cookie - li_fat_id | Cookie | [ID] |

## Next Phase
Proceed to Phase 2: Tag Creation
```

2. Continue to Phase 2
