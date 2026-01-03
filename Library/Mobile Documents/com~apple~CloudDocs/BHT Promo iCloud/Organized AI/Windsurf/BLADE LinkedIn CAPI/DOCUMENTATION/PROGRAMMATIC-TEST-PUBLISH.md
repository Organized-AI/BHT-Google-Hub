# Programmatic GTM Test & Publish

## Overview

This document describes the approach for testing and publishing GTM containers programmatically via the GTM API, eliminating manual UI interaction for the entire QA-to-production workflow.

## GTM API Capabilities for Test & Publish

| Operation | API Action | Purpose |
|-----------|------------|---------|
| Quick Preview | `gtm_workspace quickPreview` | Generate preview URL without creating version |
| Get Workspace Status | `gtm_workspace getStatus` | Check for changes, conflicts, errors |
| Create Version | `gtm_workspace createVersion` | Save workspace as numbered version |
| Publish Version | `gtm_version publish` | Push version to live environment |
| Get Live Version | `gtm_version live` | Retrieve currently published version |
| Environment Preview | `gtm_environment` | Manage staging/QA environments |

---

## Phase 4A: Workspace Validation

```
gtm_workspace action=getStatus
  accountId=4702245012
  containerId=42412215
  workspaceId=86
```

**Verify:** `mergeConflict` is empty array.

---

## Phase 4B: Quick Preview

```
gtm_workspace action=quickPreview
  accountId=4702245012
  containerId=42412215
  workspaceId=86
```

**Output:** `quickPreviewUrl` - Tag Assistant debug URL

---

## Phase 4C: Create Version

```
gtm_workspace action=createVersion
  accountId=4702245012
  containerId=42412215
  workspaceId=86
  createOrUpdateConfig={
    "name": "LinkedIn Insight Tag - BLADE Westchester",
    "description": "Automated deployment via Claude Code"
  }
```

**Capture:** `containerVersionId`, `fingerprint`

---

## Phase 4D: Publish to Live

```
gtm_version action=publish
  accountId=4702245012
  containerId=42412215
  containerVersionId=[VERSION_ID]
  fingerprint=[FINGERPRINT]
```

---

## Phase 4E: Verify Live

```
gtm_version action=live
  accountId=4702245012
  containerId=42412215
```

---

## Rollback Procedure

```
# List versions
gtm_version_header action=list
  accountId=4702245012
  containerId=42412215

# Republish previous
gtm_version action=publish
  accountId=4702245012
  containerId=42412215
  containerVersionId=[PREVIOUS_VERSION_ID]
```

---

## Benefits

1. **Repeatability**: Same process every deployment
2. **Auditability**: Full logs of what was published and when
3. **Speed**: No manual clicking through UI
4. **Integration**: Works with CI/CD pipelines
5. **Rollback**: Automated rollback on test failure
6. **Agent-Friendly**: AI agents can execute entire workflow
