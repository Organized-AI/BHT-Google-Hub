# Google Marketing Hub MCP - Master Launch Prompt

## Quick Start
```bash
# Navigate to project
cd /Users/supabowl/Library/Mobile\ Documents/com~apple~CloudDocs/BHT\ Promo\ iCloud/Organized\ AI/Windsurf/google-marketing-hub-mcp

# Launch Claude Code with permissions
claude --dangerously-skip-permissions
```

## Project Overview
Remote MCP Server for Google Marketing APIs on Cloudflare Workers.

| Component | Tools | Status |
|-----------|-------|--------|
| GCP | 8 | Phase 2 |
| GA4 | 11 | Phase 3 |
| GTM | 19 | Phase 4 |
| Google Ads | 12 | Phase 5 |
| **Total** | **50** | |

## Architecture
```
Claude Desktop → SSE (/sse) → Cloudflare Workers → Google APIs
                  ↓
              POST (/message)
                  ↓
              D1 (tokens) + KV (sessions)
```

## Phase Execution Order

### Phase 0: Setup (Required First)
```
Read PLANNING/phase-0-setup.md
Tasks: wrangler login, D1 create, KV create, secrets, deploy
```

### Phase 1: Auth Layer
```
Read PLANNING/phase-1-auth.md
Tasks: TokenManager, GoogleApiClient, auto-refresh
```

### Phase 2: GCP Tools (8)
```
Read PLANNING/phase-2-gcp.md
Tasks: Projects, Service Accounts, APIs, Billing
```

### Phase 3: GA4 Tools (11)
```
Read PLANNING/phase-3-ga4.md
Tasks: Properties, Streams, Reports, Audiences, Conversions
```

### Phase 4: GTM Tools (19)
```
Read PLANNING/phase-4-gtm.md
Tasks: Accounts, Containers, Workspaces, Tags, Triggers, Variables, Versions
```

### Phase 5: Google Ads Tools (12)
```
Read PLANNING/phase-5-gads.md
Tasks: Accounts, Campaigns, Reports, Health
```

## Claude Code Session Prompt

```
You are developing the Google Marketing Hub Remote MCP Server.

## Project Location
/Users/supabowl/Library/Mobile Documents/com~apple~CloudDocs/BHT Promo iCloud/Organized AI/Windsurf/google-marketing-hub-mcp

## Key Files
- src/index.ts - Main server entry
- wrangler.toml - Cloudflare config
- PLANNING/*.md - Phase implementation guides
- .claude/agents/google-hub-orchestrator.md - Build orchestrator

## Current Phase
[READ THE APPROPRIATE PHASE FILE BEFORE STARTING]

## Development Commands
npm run dev          # Local development
npm run deploy       # Deploy to Cloudflare
npm run d1:migrate   # Run D1 migrations
npm run logs         # View worker logs

## Git Workflow
After each phase:
1. git add -A
2. git commit -m "Phase X: [description]"
3. git push origin main

## Key Patterns
- All API calls through GoogleApiClient
- Tool prefix determines handler (gcp_, ga4_, gtm_, gads_)
- Token pattern: ghub_xxx
- SSE for connection, POST for messages
```

## Quick Reference

### Token Pattern
```
ghub_xxxxxxxxxxxxxx
```

### Claude Desktop Config
```json
{
  "mcpServers": {
    "google-marketing-hub": {
      "url": "https://google-marketing-hub-mcp.<subdomain>.workers.dev/sse",
      "headers": {
        "X-MCP-Token": "ghub_xxxxxxxxxxxxxx"
      }
    }
  }
}
```

### Endpoints
| Endpoint | Method | Purpose |
|----------|--------|---------|
| /sse | GET | SSE connection |
| /message | POST | JSON-RPC messages |
| /oauth/authorize | GET | Start OAuth |
| /oauth/callback | GET | OAuth redirect |

## GitHub
- Organization: https://github.com/Organized-AI
- Repo: BHT-Google-Hub
