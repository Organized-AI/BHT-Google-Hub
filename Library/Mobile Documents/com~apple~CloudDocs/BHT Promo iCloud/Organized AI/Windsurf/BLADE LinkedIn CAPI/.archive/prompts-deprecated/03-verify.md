# Phase 3: Verify Configuration

## 3.1 Check Workspace Status

```
gtm_workspace action=getStatus
  accountId=4702245012
  containerId=42412215
  workspaceId=86
```

Expected: List of changes pending in workspace

## 3.2 List All Variables

```
gtm_variable action=list
  accountId=4702245012
  containerId=42412215
  workspaceId=86
```

**Expected Variables:**
- [ ] CONST - LinkedIn Partner ID
- [ ] CJS - LinkedIn Event ID
- [ ] Cookie - li_fat_id

## 3.3 List All Tags

```
gtm_tag action=list
  accountId=4702245012
  containerId=42412215
  workspaceId=86
```

**Expected LinkedIn Tags:**
- [ ] LinkedIn - Insight Tag Base
- [ ] LinkedIn - Lead Conversion

## Verification Checklist

| Check | Expected |
|-------|----------|
| Variables created | 3 |
| Tags created | 2 |
| Merge conflicts | None |
