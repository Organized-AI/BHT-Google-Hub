# Phase 0: Template Installation

## Context Files to Read First
1. `CONFIG/config.json` - GTM account/container IDs
2. `DOCUMENTATION/PROGRAMMATIC-TEMPLATE-INSTALL.md` - Technical reference

## Objective
Install LinkedIn InsightTag 2.0 template from Community Gallery programmatically - no manual GTM UI required.

---

## Prerequisites
- [ ] GTM MCP server authenticated
- [ ] User has provided LinkedIn Partner ID (or will provide when prompted)

---

## Tasks

### Task 0.1: Verify MCP Connection

```
gtm_workspace action=getStatus
  accountId=4702245012
  containerId=42412215
  workspaceId=86
```

**Expected:** Response with workspace status (confirms MCP is working)

**If auth error:** Run `rm -rf ~/.mcp-auth` and restart Claude Desktop

---

### Task 0.2: Check for Existing Template

```
gtm_template action=list
  accountId=4702245012
  containerId=42412215
  workspaceId=86
```

**Check:** Does "LinkedIn InsightTag" or similar already exist?
- If YES: Skip to Task 0.5, capture existing template ID
- If NO: Continue to Task 0.3

---

### Task 0.3: Install Template via Gallery Reference (Method 1)

```
gtm_template action=create
  accountId=4702245012
  containerId=42412215
  workspaceId=86
  createOrUpdateConfig={
    "name": "LinkedIn InsightTag 2.0",
    "galleryReference": {
      "host": "github.com",
      "owner": "linkedin",
      "repository": "linkedin-gtm-community-template",
      "version": "c07099c0e0cf0ade2057ee4016d3da9f32959169",
      "templateDeveloperId": "github.com_linkedin",
      "isModified": false
    }
  }
```

**Expected:** Template created with ID format `cvt_42412215_XXX`

**If fails:** Proceed to Task 0.4 (fallback method)

---

### Task 0.4: Install Template via templateData (Method 2 - Fallback)

If Task 0.3 fails, download template and create with raw data:

```bash
# Download template
curl -s "https://raw.githubusercontent.com/linkedin/linkedin-gtm-community-template/main/template.tpl" > /tmp/linkedin-template.tpl
```

Then create template with `templateData` field containing the file contents.

---

### Task 0.5: Verify Template Installation

```
gtm_template action=list
  accountId=4702245012
  containerId=42412215
  workspaceId=86
```

**Capture and store:**
- Template ID (e.g., `cvt_42412215_123`)
- Template name (should be "LinkedIn InsightTag 2.0")

---

## Success Criteria

- [ ] Template created or already exists
- [ ] Template ID captured (format: `cvt_42412215_XXX`)
- [ ] No errors in workspace

---

## Output

Store template ID for Phase 2:

```
TEMPLATE_ID: cvt_42412215_[XXX]
```

---

## Completion

After all tasks complete successfully:

1. Create `PLANNING/implementation-phases/PHASE-0-COMPLETE.md`:

```markdown
# Phase 0: Template Installation - COMPLETE

**Completed:** [TIMESTAMP]
**Template ID:** cvt_42412215_[XXX]
**Method Used:** galleryReference / templateData

## Results
- [x] MCP connection verified
- [x] Template installed
- [x] Template ID captured

## Next Phase
Proceed to Phase 1: Variable Creation
```

2. Continue to Phase 1
