# Google Marketing Hub MCP

Remote MCP Server for Google Marketing APIs on Cloudflare Workers.

## Overview

This project implements a Remote MCP Server with 54 tools for:
- **GCP** (8 tools): Project management, IAM, service accounts
- **GA4** (11 tools): Analytics reporting, audiences, conversions
- **GTM** (19 tools): Tag management, containers, workspaces
- **Google Ads** (12 tools): Campaigns, ad groups, GAQL queries
- **Auth** (4 tools): OAuth 2.0 flow with token management

## Quick Start

### ⚠️ MUST USE AUTONOMOUS MODE

```bash
# Navigate to project
cd /Users/supabowl/Library/Mobile\ Documents/com~apple~CloudDocs/BHT\ Promo\ iCloud/Organized\ AI/Windsurf/google-marketing-hub-mcp

# Launch Claude Code in AUTONOMOUS MODE (required!)
claude --dangerously-skip-permissions
```

### Autonomous Build Prompt (Copy-Paste This)

```
Read PLANNING/phase-0-setup.md and execute all tasks.
After completing each phase, AUTOMATICALLY proceed to the next phase prompt.
Create PLANNING/PHASE-X-COMPLETE.md after each phase and git commit.
Do NOT wait for user approval between phases - continue autonomously until all phases complete.
If approval prompts appear, STOP and remind me to restart with: claude --dangerously-skip-permissions
```

### Permissions Check

**Claude must verify autonomous mode before each phase:**
- If approval prompts appear → NOT in autonomous mode → STOP and warn user
- Expected: All operations execute without user interaction
- User can leave and return to find the build complete

## Project Structure

```
├── .claude/              # Claude Code configuration
│   ├── agents/           # Build specialists (mcp-builder, auth-specialist, etc.)
│   ├── commands/         # Slash commands (/deploy, /status, /test-tool)
│   ├── hooks/            # Pre-commit hooks
│   └── skills/           # Reusable skills
├── PLANNING/             # Implementation phases
│   ├── ORCHESTRATION.md  # Master build guide
│   ├── phase-0-setup.md  # Project setup
│   ├── phase-1-auth.md   # Auth layer
│   ├── phase-2-gcp.md    # GCP tools
│   ├── phase-3-ga4.md    # GA4 tools
│   ├── phase-4-gtm.md    # GTM tools
│   └── phase-5-gads.md   # Google Ads tools
├── src/                  # Source code (created in Phase 0)
│   ├── index.ts          # Main entry point
│   ├── handlers/         # Tool handlers by service
│   └── lib/              # Shared utilities
├── migrations/           # D1 database migrations
├── wrangler.toml         # Cloudflare Workers config
└── package.json          # Dependencies
```

## Key Documents

| Document | Purpose |
|----------|---------|
| `PLANNING/ORCHESTRATION.md` | Build flow, agent matrix, commands |
| `PLANNING/IMPLEMENTATION-MASTER-PLAN.md` | Full implementation roadmap |
| `PLANNING/phase-*.md` | Per-phase implementation prompts |

## Development Commands

```bash
npm run dev          # Local development (wrangler dev)
npm run deploy       # Deploy to Cloudflare
npm run d1:migrate   # Run D1 migrations
npm run logs         # View worker logs
```

## Slash Commands

| Command | Purpose |
|---------|---------|
| `/deploy` | Deploy to Cloudflare Workers |
| `/status` | Check project status and current phase |
| `/add-tool <name>` | Generate tool boilerplate |
| `/test-tool <name>` | Test a specific tool |

## Agents

| Agent | When to Use |
|-------|-------------|
| `mcp-builder` | TypeScript implementation, MCP protocol |
| `auth-specialist` | OAuth flows, token management |
| `google-api-expert` | API errors, rate limits, schemas |
| `qa-tester` | Tool validation, testing |

## Architecture

```
Claude Desktop → SSE (/sse) → Cloudflare Workers → Google APIs
                  ↓
              POST (/message)
                  ↓
              D1 (tokens) + KV (sessions)
```

## Token Pattern

All user tokens follow the pattern: `ghub_xxxxxxxxxxxxxx`

## Build Order

```
Phase 0 (Setup) → Phase 1 (Auth) → Phases 2-5 (can run parallel)
```

## Git Workflow

After each phase:
```bash
git add -A
git commit -m "feat(phase-X): [Phase Name] complete"
git push origin main
```

## Build Behavior

**Autonomous Mode Requirements:**
1. All `PHASE-X-COMPLETE.md` files go in `PLANNING/` directory
2. After completing a phase, immediately read and execute the next phase
3. Do NOT wait for user approval between phases
4. If approval prompts appear, STOP and display:
   ```
   ⚠️ NOT IN AUTONOMOUS MODE
   Please restart with: claude --dangerously-skip-permissions
   ```
