# Phase 4: Programmatic Test & Publish

## Phase 4A: Validate Workspace

```
gtm_workspace action=getStatus
  accountId=4702245012
  containerId=42412215
  workspaceId=86
```

**Check:** `mergeConflict[]` must be empty

---

## Phase 4B: Generate Quick Preview

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

**Confirm:** Live version matches published

---

## Rollback (If Needed)

```
gtm_version_header action=list
  accountId=4702245012
  containerId=42412215

gtm_version action=publish
  accountId=4702245012
  containerId=42412215
  containerVersionId=[PREVIOUS_VERSION]
```
