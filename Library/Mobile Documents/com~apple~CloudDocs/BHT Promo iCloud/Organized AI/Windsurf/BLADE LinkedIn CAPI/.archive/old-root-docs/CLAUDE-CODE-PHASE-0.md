# BLADE LinkedIn Insight Tag - Phase 0 Quick Start

## Quick Start

```bash
cd '/Users/supabowl/Library/Mobile Documents/com~apple~CloudDocs/BHT Promo iCloud/Organized AI/Windsurf/BLADE LinkedIn CAPI'
claude --dangerously-skip-permissions
```

Then paste this prompt:

---

## Phase 0 Execution Prompt

Read `PLANNING/implementation-phases/PHASE-0-PROMPT.md` and execute all tasks.

**Configuration:**
- GTM Account: `4702245012`
- Container: `42412215` (GTM-W9S77T7)
- Workspace: `86`

**Tasks:**
1. Verify MCP connection with `gtm_workspace action=getStatus`
2. Check if LinkedIn template already exists
3. Install LinkedIn InsightTag 2.0 from Community Gallery via `galleryReference`
4. If gallery method fails, fallback to `templateData` method
5. Capture template ID (format: `cvt_42412215_XXX`)

**After completion:**
- Create `PHASE-0-COMPLETE.md` with template ID
- Proceed to Phase 1

---

## Alternative: Full Agent Mode

Instead of phase-by-phase execution, use the autonomous agent:

```
Deploy LinkedIn tracking for BLADE
```

The agent will execute all phases (0-4) automatically.

---

## Phase Sequence

| Phase | Prompt File | What It Does |
|-------|-------------|--------------|
| 0 | `PHASE-0-PROMPT.md` | Install template |
| 1 | `PHASE-1-PROMPT.md` | Create 3 variables |
| 2 | `PHASE-2-PROMPT.md` | Create 2 tags |
| 3 | `PHASE-3-PROMPT.md` | Validate workspace |
| 4 | `PHASE-4-PROMPT.md` | Preview, version, publish |

---

## Required User Input

Before starting, have ready:
- **LinkedIn Partner ID** from Campaign Manager → Account Assets → Insight Tag

---

## MCP Authentication

If you see auth errors:

```bash
rm -rf ~/.mcp-auth
# Restart Claude Desktop
```
