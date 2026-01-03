# Phase 2: Tag Creation

## Context Files to Read First
1. `CONFIG/config.json` - GTM IDs and trigger IDs
2. `SPECIFICATIONS/tag-specs.md` - Tag specifications
3. `PLANNING/implementation-phases/PHASE-0-COMPLETE.md` - Template ID
4. `PLANNING/implementation-phases/PHASE-1-COMPLETE.md` - Variable confirmation

## Objective
Create 2 LinkedIn tracking tags using the template from Phase 0 and variables from Phase 1.

---

## Prerequisites
- [ ] Phase 0 complete (template installed, ID captured)
- [ ] Phase 1 complete (variables created)
- [ ] Template ID available: `cvt_42412215_[XXX]`

---

## Tasks

### Task 2.1: Load Template ID

Read from Phase 0 completion or list templates:

```
gtm_template action=list
  accountId=4702245012
  containerId=42412215
  workspaceId=86
```

**Capture:** Template ID (e.g., `cvt_42412215_123`)

---

### Task 2.2: Create LinkedIn - Insight Tag Base

```
gtm_tag action=create
  accountId=4702245012
  containerId=42412215
  workspaceId=86
  createOrUpdateConfig={
    "name": "LinkedIn - Insight Tag Base",
    "type": "[TEMPLATE_ID_FROM_PHASE_0]",
    "parameter": [
      {
        "type": "template",
        "key": "partnerId",
        "value": "{{CONST - LinkedIn Partner ID}}"
      }
    ],
    "firingTriggerId": ["2147479553"],
    "tagFiringOption": "oncePerLoad"
  }
```

**Trigger:** All Pages (ID: 2147479553)
**Expected:** Tag created with ID

---

### Task 2.3: Create LinkedIn - Lead Conversion

```
gtm_tag action=create
  accountId=4702245012
  containerId=42412215
  workspaceId=86
  createOrUpdateConfig={
    "name": "LinkedIn - Lead Conversion",
    "type": "[TEMPLATE_ID_FROM_PHASE_0]",
    "parameter": [
      {
        "type": "template",
        "key": "partnerId",
        "value": "{{CONST - LinkedIn Partner ID}}"
      },
      {
        "type": "template",
        "key": "conversionId",
        "value": "25208314"
      },
      {
        "type": "template",
        "key": "eventId",
        "value": "{{CJS - LinkedIn Event ID}}"
      }
    ],
    "firingTriggerId": ["305"],
    "tagFiringOption": "oncePerEvent"
  }
```

**Trigger:** CompleteRegistration (ID: 305)
**Expected:** Tag created with ID

---

### Task 2.4: Verify All Tags Created

```
gtm_tag action=list
  accountId=4702245012
  containerId=42412215
  workspaceId=86
```

**Filter for LinkedIn tags in response:**
- [ ] `LinkedIn - Insight Tag Base` exists with All Pages trigger
- [ ] `LinkedIn - Lead Conversion` exists with CompleteRegistration trigger

---

## Success Criteria

- [ ] 2 tags created successfully
- [ ] Base tag fires on All Pages (2147479553)
- [ ] Lead Conversion fires on CompleteRegistration (305)
- [ ] Tags use correct template type
- [ ] Tags reference correct variables

---

## Output

Tags created:
```
1. LinkedIn - Insight Tag Base
   - Tag ID: [TAG_ID]
   - Template: [TEMPLATE_ID]
   - Trigger: All Pages (2147479553)

2. LinkedIn - Lead Conversion
   - Tag ID: [TAG_ID]
   - Template: [TEMPLATE_ID]
   - Trigger: CompleteRegistration (305)
   - Conversion ID: 25208314
```

---

## Completion

After all tasks complete successfully:

1. Create `PLANNING/implementation-phases/PHASE-2-COMPLETE.md`:

```markdown
# Phase 2: Tag Creation - COMPLETE

**Completed:** [TIMESTAMP]
**Template ID Used:** [TEMPLATE_ID]

## Tags Created
| Name | Tag ID | Trigger |
|------|--------|---------|
| LinkedIn - Insight Tag Base | [ID] | All Pages |
| LinkedIn - Lead Conversion | [ID] | CompleteRegistration |

## Next Phase
Proceed to Phase 3: Validation
```

2. Continue to Phase 3
