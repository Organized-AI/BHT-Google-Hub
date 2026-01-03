# BLADE LinkedIn Insight Tag Implementation

Autonomous GTM implementation for LinkedIn Insight Tag using Claude Code with MCP tools.

## Overview

This project implements LinkedIn Insight Tag (client-side) alongside existing server-side CAPI tracking for BLADE's Westchester LinkedIn campaign. Features:

- **Zero Manual Clicks**: Entire GTM workflow via API
- **Phased Execution**: 5 distinct phases with hooks
- **Dual Tracking**: Client + Server-side for maximum data fidelity
- **Event Deduplication**: Shared event IDs prevent double-counting

## Quick Start

### Option 1: Agent Mode (Recommended)

```bash
cd '/Users/supabowl/Library/Mobile Documents/com~apple~CloudDocs/BHT Promo iCloud/Organized AI/Windsurf/BLADE LinkedIn CAPI'
./scripts/start-agent.sh
```

Then say: `"Deploy LinkedIn tracking for BLADE"`

### Option 2: Phase-by-Phase

```bash
claude --dangerously-skip-permissions
```

Then: `"Read PLANNING/implementation-phases/PHASE-0-PROMPT.md and execute all tasks"`

## Implementation Phases

| Phase | Name | What It Does |
|-------|------|--------------|
| 0 | Template Installation | Install LinkedIn InsightTag 2.0 from Community Gallery |
| 1 | Variable Creation | Create Partner ID, Event ID, Cookie variables |
| 2 | Tag Creation | Create Base and Lead Conversion tags |
| 3 | Validation | Verify workspace, check for conflicts |
| 4 | Test & Publish | Preview, version, publish to live |

## Project Structure

```
BLADE LinkedIn CAPI/
├── CLAUDE.md                    # Project overview (read first)
├── CLAUDE-CODE-PHASE-0.md       # Quick start for Phase 0
├── README.md                    # This file
├── .claude/
│   ├── agents/                  # Agent definitions
│   │   └── gtm-linkedin-automation-agent.md
│   ├── commands/                # Slash commands
│   │   ├── blade-deploy.md
│   │   ├── blade-linkedin.md
│   │   ├── blade-rollback.md
│   │   └── blade-status.md
│   ├── hooks/                   # Pre/post phase hooks
│   │   ├── hooks.json
│   │   ├── pre-phase.md
│   │   └── post-phase.md
│   ├── skills/                  # Skills
│   │   ├── gtm-linkedin/
│   │   ├── linkedin-capi-setup/
│   │   └── ...
│   └── settings.json            # Claude Code configuration
├── CONFIG/
│   ├── config.json              # GTM and LinkedIn config
│   └── phase-state.json         # Execution state tracking
├── PLANNING/
│   ├── IMPLEMENTATION-MASTER-PLAN.md
│   └── implementation-phases/
│       ├── PHASE-0-PROMPT.md    # Template installation
│       ├── PHASE-1-PROMPT.md    # Variables
│       ├── PHASE-2-PROMPT.md    # Tags
│       ├── PHASE-3-PROMPT.md    # Validation
│       ├── PHASE-4-PROMPT.md    # Publish
│       └── PHASE-COMPLETE-TEMPLATE.md
├── DOCUMENTATION/               # Technical references
├── ARCHITECTURE/                # System diagrams
├── SPECIFICATIONS/              # Tag/variable specs
├── AGENT-HANDOFF/              # Handoff instructions
├── .archive/                   # Archived content
└── scripts/
    ├── start-agent.sh           # Launch agent mode
    ├── execute-phase.sh         # Run specific phase
    └── git-commit-templates.md  # Commit message templates
```

## Requirements

### MCP Servers
- `google-tag-manager-mcp-server` (required)
- `stape-mcp-server` (optional)

### User Input
- LinkedIn Partner ID (from Campaign Manager → Account Assets → Insight Tag)

## GTM Configuration

| Setting | Value |
|---------|-------|
| Account | 4702245012 |
| Web Container | 42412215 (GTM-W9S77T7) |
| Server Container | 175099610 (GTM-KJHX6KJ7) |
| Workspace | 86 |

## Troubleshooting

| Issue | Solution |
|-------|----------|
| MCP auth error | `rm -rf ~/.mcp-auth` + restart Claude Desktop |
| Template exists | Use existing template ID |
| Merge conflict | Run `gtm_workspace action=sync` |

## License

Internal use - BHT Promo / BLADE
