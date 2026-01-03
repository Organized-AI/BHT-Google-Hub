# BLADE LinkedIn Insight Tag

## Project Overview

Implementation project for deploying LinkedIn Insight Tag alongside existing server-side CAPI tracking for BLADE's Westchester LinkedIn campaign.

## Project Structure

```
.claude/                    # Claude Code configuration
├── agents/                 # Agent definitions
│   └── gtm-linkedin-automation-agent.md
├── commands/               # Slash commands
│   ├── blade-deploy.md
│   ├── blade-linkedin.md
│   ├── blade-rollback.md
│   └── blade-status.md
├── hooks/                  # Pre/post phase hooks
│   ├── hooks.json
│   ├── post-phase.md
│   └── pre-phase.md
├── skills/                 # Skills
│   ├── gtm-linkedin/       # GTM LinkedIn skill
│   ├── linkedin-capi-setup/# CAPI setup skill
│   ├── organized-codebase-applicator/
│   ├── phase-0-template/
│   ├── phased-planning/
│   └── repo-manager/
└── settings.json           # Claude settings

PLANNING/                   # Implementation planning
├── implementation-phases/  # Phase prompts
└── IMPLEMENTATION-MASTER-PLAN.md

CONFIG/                     # Configuration files
DOCUMENTATION/              # Technical documentation
ARCHITECTURE/               # System architecture
SPECIFICATIONS/             # Specs
AGENT-HANDOFF/              # Agent handoff docs
scripts/                    # Automation scripts
.archive/                   # Archived content
```

---

## 🚀 Quick Start Options

### Option 1: Autonomous Agent (Recommended)

```bash
cd '/Users/supabowl/Library/Mobile Documents/com~apple~CloudDocs/BHT Promo iCloud/Organized AI/Windsurf/BLADE LinkedIn CAPI'
claude --dangerously-skip-permissions
```

Then say:
```
Deploy LinkedIn tracking for BLADE
```

The agent executes all phases automatically:
- ✅ Template installation from Community Gallery
- ✅ Variable and tag creation
- ✅ Workspace validation
- ✅ Quick preview generation
- ✅ Version creation & publish
- ✅ Rollback if needed

**No manual GTM UI clicks required!**

### Option 2: Phased Execution

For step-by-step control:

```bash
claude --dangerously-skip-permissions
"Read PLANNING/implementation-phases/PHASE-0-PROMPT.md and execute all tasks"
```

Then proceed through each phase:
- Phase 0 → Phase 1 → Phase 2 → Phase 3 → Phase 4

---

## Trigger Phrases (Agent Mode)

Say any of these to activate the agent:
- `"Deploy LinkedIn tracking"`
- `"Install LinkedIn Insight Tag"`
- `"Run GTM automation"`
- `"Execute BLADE LinkedIn"`
- `"Start LinkedIn implementation"`

---

## Implementation Phases

| Phase | Name | Components | Prompt File |
|-------|------|------------|-------------|
| 0 | Template Installation | LinkedIn InsightTag 2.0 | `PHASE-0-PROMPT.md` |
| 1 | Variable Creation | Partner ID, Event ID, Cookie | `PHASE-1-PROMPT.md` |
| 2 | Tag Creation | Base Tag, Lead Conversion | `PHASE-2-PROMPT.md` |
| 3 | Validation | Workspace status check | `PHASE-3-PROMPT.md` |
| 4 | Test & Publish | Preview, Version, Publish | `PHASE-4-PROMPT.md` |

---

## GTM Configuration

| Setting | Value |
|---------|-------|
| Account ID | `4702245012` |
| Web Container | `42412215` (GTM-W9S77T7) |
| Server Container | `175099610` (GTM-KJHX6KJ7) |
| Workspace | `86` (Default) |

### Triggers (Existing - Reuse)

| Trigger | ID |
|---------|-----|
| All Pages | `2147479553` |
| CompleteRegistration | `305` |
| Purchase | `10` |

---

## Architecture

**Dual-Tracking Strategy:**
- **Client-Side (Insight Tag)**: Pageviews, audience building, basic conversions
- **Server-Side (CAPI)**: Enhanced matching, ad-blocker bypass, high-fidelity data

```
User Action → event_id generated → Client Insight Tag ┐
                                                      ├→ LinkedIn (deduped)
                   Same event_id → Server CAPI       ┘
```

---

## Required MCP Servers

| MCP | Purpose | Required |
|-----|---------|----------|
| google-tag-manager-mcp-server | GTM CRUD operations | ✅ Yes |
| stape-mcp-server | Verify Stape config | ⚠️ Optional |

---

## Key Files

| File | Purpose |
|------|---------|
| `CLAUDE-CODE-PHASE-0.md` | Quick start for Phase 0 |
| `PLANNING/IMPLEMENTATION-MASTER-PLAN.md` | Complete implementation roadmap |
| `PLANNING/implementation-phases/` | Individual phase prompts |
| `.claude/agents/gtm-linkedin-automation-agent.md` | Autonomous agent definition |
| `.claude/commands/` | Slash commands (blade-deploy, blade-status, etc.) |
| `.claude/skills/` | Skills (gtm-linkedin, linkedin-capi-setup, etc.) |
| `CONFIG/config.json` | GTM and LinkedIn configuration |
| `AGENT-HANDOFF/HANDOFF.md` | Context for agent continuity |

---

## Required User Input

Before execution, you need:
- **LinkedIn Partner ID**: Get from Campaign Manager → Account Assets → Insight Tag

---

## Success Criteria

- [ ] LinkedIn Partner ID configured
- [ ] Template installed (cvt_42412215_XXX)
- [ ] 3 variables created
- [ ] 2 tags created with correct triggers
- [ ] No workspace conflicts
- [ ] Version published to live
- [ ] LinkedIn Campaign Manager shows conversions

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| GTM MCP auth expired | `rm -rf ~/.mcp-auth` + restart Claude Desktop |
| Template exists error | List templates, use existing ID |
| Merge conflict | Run `gtm_workspace action=sync` |
| Fingerprint mismatch | Re-fetch version details |
