# BLADE LinkedIn Insight Tag - Full Automated Execution

## Quick Start
```bash
cd "BLADE LinkedIn CAPI"
claude --dangerously-skip-permissions
```

Then say: **"Deploy LinkedIn tracking for BLADE"**

The agent will handle everything automatically.

---

## Alternative: Manual Execution Prompt

If you prefer to paste a prompt instead of using the agent, paste this:

---

You are implementing LinkedIn Insight Tag for BLADE's GTM container. Execute ALL phases using GTM MCP tools - from template installation through publication.

### Configuration
```
GTM Account: 4702245012
Web Container: 42412215
Workspace: 86
LinkedIn Partner ID: [MUST BE PROVIDED BY USER]
```

### PHASE 0: Install Template from Community Gallery

Try creating the template with galleryReference:

```
Use gtm_template with:
- action: create
- accountId: 4702245012
- containerId: 42412215  
- workspaceId: 86
- createOrUpdateConfig:
    name: "LinkedIn InsightTag 2.0"
    galleryReference:
      host: "github.com"
      owner: "linkedin"
      repository: "linkedin-gtm-community-template"
      version: "c07099c0e0cf0ade2057ee4016d3da9f32959169"
```

### PHASE 1: Create Variables

1. CONST - LinkedIn Partner ID (type: c)
2. CJS - LinkedIn Event ID (type: jsm)
3. Cookie - li_fat_id (type: k)

### PHASE 2: Create Tags

1. LinkedIn - Insight Tag Base (All Pages trigger)
2. LinkedIn - Lead Conversion (CompleteRegistration trigger)

### PHASE 3: Verify Workspace

Check for conflicts and errors.

### PHASE 4: Test & Publish

4A: Validate workspace status
4B: Generate quick preview URL
4C: Create container version
4D: Publish to live
4E: Verify live version

---

## REQUIRED USER INPUT

Before execution, user must provide:
- **LinkedIn Partner ID**: Get from Campaign Manager → Account Assets → Insight Tag

---

## SUCCESS OUTPUT

```
╔══════════════════════════════════════════════════════════╗
║     BLADE LINKEDIN INSIGHT TAG - DEPLOYMENT COMPLETE     ║
╠══════════════════════════════════════════════════════════╣
║ Phase 0: Template ✅  ID: cvt_42412215_XXX               ║
║ Phase 1: Variables ✅  Created: 3                        ║
║ Phase 2: Tags ✅  Created: 2                             ║
║ Phase 3: Validation ✅  No conflicts                     ║
║ Phase 4: Published ✅  Version: v47                      ║
╠══════════════════════════════════════════════════════════╣
║ 🚀 NO MANUAL GTM UI REQUIRED                             ║
╚══════════════════════════════════════════════════════════╝
```
