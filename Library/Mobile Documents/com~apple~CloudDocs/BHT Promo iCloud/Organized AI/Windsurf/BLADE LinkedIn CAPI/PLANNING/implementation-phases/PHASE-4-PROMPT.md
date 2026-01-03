# Phase 4: Test & Publish

## Context Files to Read First
1. `PLANNING/implementation-phases/PHASE-3-COMPLETE.md` - Validation passed
2. `DOCUMENTATION/PROGRAMMATIC-TEST-PUBLISH.md` - Technical reference

## Objective
Generate preview URL for testing, create container version, publish to live, and verify deployment - all programmatically via GTM API.

---

## Prerequisites
- [ ] Phase 3 complete (validation passed)
- [ ] No merge conflicts
- [ ] No compiler errors

---

## Tasks

### Task 4.1: Generate Quick Preview

Create a preview URL without permanent version:

```
gtm_workspace action=quickPreview
  accountId=4702245012
  containerId=42412215
  workspaceId=86
```

**Capture from response:**
- `quickPreviewUrl` - Tag Assistant debug URL

**Example URL format:**
```
https://tagassistant.google.com/#/?source=gtm&id=GTM-W9S77T7&gtm_auth=XXX&gtm_preview=XXX
```

**Optional:** Share preview URL with user for manual verification before proceeding.

---

### Task 4.2: Create Container Version

Save workspace as numbered version:

```
gtm_workspace action=createVersion
  accountId=4702245012
  containerId=42412215
  workspaceId=86
  createOrUpdateConfig={
    "name": "LinkedIn Insight Tag - BLADE Westchester",
    "description": "Automated deployment via Claude Code GTM Agent\n\nChanges:\n- LinkedIn InsightTag 2.0 template from Community Gallery\n- CONST - LinkedIn Partner ID variable\n- CJS - LinkedIn Event ID variable (deduplication)\n- Cookie - li_fat_id variable\n- LinkedIn - Insight Tag Base (All Pages)\n- LinkedIn - Lead Conversion (CompleteRegistration, Rule 25208314)\n\nDeduplication: Event IDs match server-side CAPI for accurate attribution."
  }
```

**Capture from response:**
- `containerVersionId` (e.g., "47")
- `fingerprint` (e.g., "1735500000000")

**Verify:** `compilerError` is `false`

---

### Task 4.3: Publish Version to Live

Push the version to production:

```
gtm_version action=publish
  accountId=4702245012
  containerId=42412215
  containerVersionId=[VERSION_ID_FROM_TASK_4.2]
  fingerprint=[FINGERPRINT_FROM_TASK_4.2]
```

**Expected:** Version published successfully

---

### Task 4.4: Verify Live Version

Confirm the correct version is now live:

```
gtm_version action=live
  accountId=4702245012
  containerId=42412215
```

**Verify in response:**
- `containerVersionId` matches what was published
- `name` is "LinkedIn Insight Tag - BLADE Westchester"

---

## Success Criteria

- [ ] Preview URL generated
- [ ] Container version created
- [ ] Version published to live
- [ ] Live version verified

---

## Output

Deployment summary:
```
╔══════════════════════════════════════════════════════════════╗
║     BLADE LINKEDIN INSIGHT TAG - DEPLOYMENT COMPLETE         ║
╠══════════════════════════════════════════════════════════════╣
║ Preview URL: [URL]                                           ║
║ Version Created: v[XX]                                       ║
║ Version Name: LinkedIn Insight Tag - BLADE Westchester       ║
║ Published: ✅                                                 ║
║ Live Version Confirmed: ✅                                    ║
╠══════════════════════════════════════════════════════════════╣
║ 🚀 NO MANUAL GTM UI REQUIRED                                 ║
╚══════════════════════════════════════════════════════════════╝
```

---

## Rollback Procedure (If Needed)

If issues discovered after publish:

### Step 1: List Previous Versions

```
gtm_version_header action=list
  accountId=4702245012
  containerId=42412215
```

### Step 2: Get Previous Version Details

```
gtm_version action=get
  accountId=4702245012
  containerId=42412215
  containerVersionId=[PREVIOUS_VERSION_ID]
```

### Step 3: Republish Previous Version

```
gtm_version action=publish
  accountId=4702245012
  containerId=42412215
  containerVersionId=[PREVIOUS_VERSION_ID]
  fingerprint=[PREVIOUS_FINGERPRINT]
```

---

## Completion

After all tasks complete successfully:

1. Create `PLANNING/implementation-phases/PHASE-4-COMPLETE.md`:

```markdown
# Phase 4: Test & Publish - COMPLETE

**Completed:** [TIMESTAMP]

## Deployment Results
| Step | Result |
|------|--------|
| Preview Generated | ✅ |
| Version Created | ✅ v[XX] |
| Published to Live | ✅ |
| Live Verified | ✅ |

## Version Details
- **Version ID:** [XX]
- **Version Name:** LinkedIn Insight Tag - BLADE Westchester
- **Fingerprint:** [FINGERPRINT]

## Preview URL
[URL]

## All Phases Complete
Implementation finished. LinkedIn Insight Tag is now live on www.blade.com.
```

2. Update `PLANNING/IMPLEMENTATION-MASTER-PLAN.md` status to COMPLETE

---

## Post-Deployment Verification (Manual)

After deployment, recommend user verify:

1. **LinkedIn Tag Helper** - Chrome extension shows pixel firing
2. **LinkedIn Campaign Manager** - Conversions → Verify "Last received" updates
3. **GTM Preview Mode** - Tags fire on expected triggers
4. **Network Tab** - Requests to `px.ads.linkedin.com` visible
