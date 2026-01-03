# BLADE LinkedIn Insight Tag - Implementation Master Plan

**Created:** 2024-12-29
**Project Path:** `/Users/supabowl/Library/Mobile Documents/com~apple~CloudDocs/BHT Promo iCloud/Organized AI/Windsurf/BLADE LinkedIn CAPI`
**Runtime:** Claude Code + GTM MCP Server

---

## Pre-Implementation Checklist

### ✅ Documentation (Complete)
| Component | Location | Status |
|-----------|----------|--------|
| Project Overview | `CLAUDE.md` | ✅ |
| Agent Definition | `.claude/agents/gtm-linkedin-automation-agent.md` | ✅ |
| Configuration | `CONFIG/config.json` | ✅ |
| Architecture Diagram | `ARCHITECTURE/tracking-flow.md` | ✅ |
| Tag Specifications | `SPECIFICATIONS/tag-specs.md` | ✅ |
| Prerequisites | `DOCUMENTATION/PREREQUISITES.md` | ✅ |

### ⏳ GTM Implementation (To Build via Phases)
| Component | GTM Type | Status |
|-----------|----------|--------|
| LinkedIn InsightTag 2.0 Template | Template | ⏳ Phase 0 |
| CONST - LinkedIn Partner ID | Variable | ⏳ Phase 1 |
| CJS - LinkedIn Event ID | Variable | ⏳ Phase 1 |
| Cookie - li_fat_id | Variable | ⏳ Phase 1 |
| LinkedIn - Insight Tag Base | Tag | ⏳ Phase 2 |
| LinkedIn - Lead Conversion | Tag | ⏳ Phase 2 |
| Workspace Validation | Verification | ⏳ Phase 3 |
| Preview & Publish | Deployment | ⏳ Phase 4 |

---

## Implementation Phases Overview

| Phase | Name | GTM Components | Dependencies |
|-------|------|----------------|--------------|
| 0 | Template Installation | LinkedIn InsightTag 2.0 template | None |
| 1 | Variable Creation | 3 variables (Partner ID, Event ID, Cookie) | Phase 0 |
| 2 | Tag Creation | 2 tags (Base, Lead Conversion) | Phase 0, Phase 1 |
| 3 | Validation | Workspace status check | Phase 2 |
| 4 | Test & Publish | Preview, Version, Publish | Phase 3 |

---

## Phase Dependencies Graph

```
Phase 0: Template Installation
    │
    └──► Phase 1: Variable Creation
              │
              └──► Phase 2: Tag Creation ◄── (uses template ID from Phase 0)
                        │
                        └──► Phase 3: Validation
                                  │
                                  └──► Phase 4: Test & Publish
```

---

## Required User Input

Before Phase 0 execution:

| Input | Source | Format |
|-------|--------|--------|
| LinkedIn Partner ID | Campaign Manager → Account Assets → Insight Tag | 6-7 digit number |

---

## MCP Server Requirements

| Server | Required | Purpose |
|--------|----------|---------|
| `google-tag-manager-mcp-server` | ✅ Yes | GTM CRUD operations |
| `stape-mcp-server` | ⚠️ Optional | Verify Stape container config |

---

## GTM Configuration (Pre-Populated)

| Setting | Value |
|---------|-------|
| Account ID | `4702245012` |
| Web Container ID | `42412215` |
| Web Container Public ID | `GTM-W9S77T7` |
| Server Container ID | `175099610` |
| Server Container Public ID | `GTM-KJHX6KJ7` |
| Workspace ID | `86` |
| All Pages Trigger | `2147479553` |
| CompleteRegistration Trigger | `305` |
| Lead Conversion Rule | `25208314` |

---

## Execution Protocol

### Starting a Phase

```bash
cd '/Users/supabowl/Library/Mobile Documents/com~apple~CloudDocs/BHT Promo iCloud/Organized AI/Windsurf/BLADE LinkedIn CAPI'
claude --dangerously-skip-permissions

# In Claude Code:
"Read PLANNING/implementation-phases/PHASE-X-PROMPT.md and execute all tasks"
```

### Or Use Agent Mode (Recommended)

```bash
cd '/Users/supabowl/Library/Mobile Documents/com~apple~CloudDocs/BHT Promo iCloud/Organized AI/Windsurf/BLADE LinkedIn CAPI'
claude --dangerously-skip-permissions

# Say:
"Deploy LinkedIn tracking for BLADE"
```

The agent will execute all phases automatically.

---

## Success Criteria (Final)

- [ ] Template installed with ID format `cvt_42412215_XXX`
- [ ] 3 variables created and verified
- [ ] 2 tags created with correct triggers
- [ ] No workspace conflicts
- [ ] Preview URL generated
- [ ] Container version created
- [ ] Version published to live
- [ ] Live version verified

---

## Rollback Plan

If issues after publish:

```
gtm_version_header action=list accountId=4702245012 containerId=42412215
gtm_version action=publish accountId=4702245012 containerId=42412215 containerVersionId=[PREV_ID]
```
