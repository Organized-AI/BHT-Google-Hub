# Pre-Phase Hook

Execute these checks before starting any phase.

---

## 1. MCP Authentication Check

Before any GTM operations, verify MCP is authenticated:

```
gtm_workspace action=getStatus
  accountId=4702245012
  containerId=42412215
  workspaceId=86
```

**If auth error:**
```bash
rm -rf ~/.mcp-auth
# Restart Claude Desktop
# Re-authenticate via OAuth
```

---

## 2. Previous Phase Completion Check

For Phase N (where N > 0):

```bash
# Check if PHASE-(N-1)-COMPLETE.md exists
cat PLANNING/implementation-phases/PHASE-$(($PHASE-1))-COMPLETE.md
```

**If not found:** Complete previous phase first.

---

## 3. Configuration Validation

Verify config.json has required values:

```bash
cat CONFIG/config.json | grep -E "(partnerId|accountId|containerId)"
```

**Check for placeholders:**
- `[GET_FROM_CAMPAIGN_MANAGER]` - Need Partner ID
- `[AUTO_GENERATED_AFTER_INSTALL]` - Will be set after Phase 0

---

## 4. Workspace State Check

Before modifying GTM:

```
gtm_workspace action=getStatus
  accountId=4702245012
  containerId=42412215
  workspaceId=86
```

**If `mergeConflict[]` is not empty:**
```
gtm_workspace action=sync
  accountId=4702245012
  containerId=42412215
  workspaceId=86
```

---

## Pre-Phase Checklist

| Check | Command | Expected |
|-------|---------|----------|
| MCP Auth | gtm_workspace getStatus | Response without auth error |
| Previous Phase | cat PHASE-X-COMPLETE.md | File exists (for X>0) |
| Config Values | grep partnerId config.json | Valid 6-7 digit number |
| Workspace Clean | gtm_workspace getStatus | mergeConflict[] empty |

---

## Automatic Execution

In agent mode, run these checks automatically before each phase:

```javascript
async function prePhaseHook(phaseNumber) {
  // 1. Check MCP auth
  const status = await gtm_workspace({ action: "getStatus", ... });
  if (status.error?.includes("auth")) throw new Error("MCP auth required");
  
  // 2. Check previous phase (skip for phase 0)
  if (phaseNumber > 0) {
    const prevComplete = await readFile(`PHASE-${phaseNumber-1}-COMPLETE.md`);
    if (!prevComplete) throw new Error(`Phase ${phaseNumber-1} not complete`);
  }
  
  // 3. Check for merge conflicts
  if (status.mergeConflict?.length > 0) {
    await gtm_workspace({ action: "sync", ... });
  }
  
  return { ready: true };
}
```
