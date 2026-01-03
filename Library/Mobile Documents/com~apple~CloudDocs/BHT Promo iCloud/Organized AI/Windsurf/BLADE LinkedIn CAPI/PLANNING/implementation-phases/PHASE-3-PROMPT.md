# Phase 3: Validation

## Context Files to Read First
1. `PLANNING/implementation-phases/PHASE-2-COMPLETE.md` - Tags created
2. `CONFIG/config.json` - Expected configuration values

## Objective
Validate workspace status, check for conflicts, and confirm all components are correctly configured before proceeding to publish.

---

## Prerequisites
- [ ] Phase 0 complete (template installed)
- [ ] Phase 1 complete (variables created)
- [ ] Phase 2 complete (tags created)

---

## Tasks

### Task 3.1: Get Workspace Status

```
gtm_workspace action=getStatus
  accountId=4702245012
  containerId=42412215
  workspaceId=86
```

**Check Response:**

1. **workspaceChange[]** - Should contain:
   - 1 template (LinkedIn InsightTag 2.0)
   - 3 variables (Partner ID, Event ID, li_fat_id)
   - 2 tags (Base, Lead Conversion)

2. **mergeConflict[]** - **MUST BE EMPTY**
   - If not empty, proceed to Task 3.2

3. **compilerError** - Should be `false` or absent

---

### Task 3.2: Sync Workspace (If Conflicts Exist)

Only run if `mergeConflict[]` is not empty:

```
gtm_workspace action=sync
  accountId=4702245012
  containerId=42412215
  workspaceId=86
```

Then re-run Task 3.1 to verify conflicts resolved.

---

### Task 3.3: Verify Variable Count

```
gtm_variable action=list
  accountId=4702245012
  containerId=42412215
  workspaceId=86
```

**Count LinkedIn-related variables:**
- [ ] CONST - LinkedIn Partner ID
- [ ] CJS - LinkedIn Event ID
- [ ] Cookie - li_fat_id

**Total expected: 3**

---

### Task 3.4: Verify Tag Count and Configuration

```
gtm_tag action=list
  accountId=4702245012
  containerId=42412215
  workspaceId=86
```

**Verify LinkedIn tags:**

| Tag Name | Trigger ID | Firing Option |
|----------|------------|---------------|
| LinkedIn - Insight Tag Base | 2147479553 | oncePerLoad |
| LinkedIn - Lead Conversion | 305 | oncePerEvent |

**Total expected: 2**

---

### Task 3.5: Verify Template Exists

```
gtm_template action=list
  accountId=4702245012
  containerId=42412215
  workspaceId=86
```

**Confirm:** LinkedIn InsightTag 2.0 template present

---

## Validation Checklist

| Component | Expected | Actual | Status |
|-----------|----------|--------|--------|
| Template | 1 | | ⏳ |
| Variables | 3 | | ⏳ |
| Tags | 2 | | ⏳ |
| Merge Conflicts | 0 | | ⏳ |
| Compiler Errors | 0 | | ⏳ |

---

## Success Criteria

- [ ] Workspace status retrieved successfully
- [ ] No merge conflicts
- [ ] No compiler errors
- [ ] 3 LinkedIn variables confirmed
- [ ] 2 LinkedIn tags confirmed
- [ ] All tags have correct triggers

---

## Output

Validation summary:
```
✅ Workspace Status: Clean
✅ Template: cvt_42412215_[XXX]
✅ Variables: 3 created
✅ Tags: 2 created
✅ Merge Conflicts: None
✅ Ready for Preview & Publish
```

---

## Completion

After all tasks complete successfully:

1. Create `PLANNING/implementation-phases/PHASE-3-COMPLETE.md`:

```markdown
# Phase 3: Validation - COMPLETE

**Completed:** [TIMESTAMP]

## Validation Results
| Check | Result |
|-------|--------|
| Workspace Status | ✅ Clean |
| Merge Conflicts | ✅ None |
| Compiler Errors | ✅ None |
| Template Count | ✅ 1 |
| Variable Count | ✅ 3 |
| Tag Count | ✅ 2 |

## Components Verified
- LinkedIn InsightTag 2.0 template
- CONST - LinkedIn Partner ID
- CJS - LinkedIn Event ID
- Cookie - li_fat_id
- LinkedIn - Insight Tag Base
- LinkedIn - Lead Conversion

## Next Phase
Proceed to Phase 4: Test & Publish
```

2. Continue to Phase 4
