# Google Marketing Hub MCP - Implementation Master Plan

**Created:** December 2024
**Runtime:** TypeScript on Cloudflare Workers (Remote MCP Server)

---

## Project Overview

Remote MCP Server providing 54 tools for Google Marketing APIs:
- **Auth:** OAuth 2.0 flow with automatic token refresh
- **GCP:** Project management, IAM, service accounts
- **GA4:** Analytics reporting, audiences, conversions
- **GTM:** Tag management, containers, workspaces
- **Google Ads:** Campaigns, ad groups, GAQL queries

## Architecture

```
Claude Desktop → SSE (/sse) → Cloudflare Workers → Google APIs
                  ↓
              POST (/message)
                  ↓
              D1 (tokens) + KV (sessions)
```

---

## Pre-Implementation Checklist

### ✅ Documentation (Complete)
| Component | Location | Status |
|-----------|----------|--------|
| Phase Prompts | `PLANNING/phase-*.md` | ✅ |
| Orchestration Guide | `PLANNING/ORCHESTRATION.md` | ✅ |
| Agent Definitions | `.claude/agents/*.md` | ✅ |
| Commands | `.claude/commands/*.md` | ✅ |

### ⏳ Code Implementation (To Build)
| Component | Location | Status |
|-----------|----------|--------|
| Project Setup | `wrangler.toml`, `package.json` | ⏳ Phase 0 |
| Auth Layer | `src/handlers/auth.ts` | ⏳ Phase 1 |
| GCP Tools | `src/handlers/gcp.ts` | ⏳ Phase 2 |
| GA4 Tools | `src/handlers/ga4.ts` | ⏳ Phase 3 |
| GTM Tools | `src/handlers/gtm.ts` | ⏳ Phase 4 |
| Google Ads Tools | `src/handlers/gads.ts` | ⏳ Phase 5 |

---

## Implementation Phases Overview

| Phase | Name | Tools | Key Files |
|-------|------|-------|-----------|
| 0 | Project Setup | 0 | wrangler.toml, package.json, tsconfig.json |
| 1 | Auth Layer | 4 | src/handlers/auth.ts, src/lib/token-manager.ts |
| 2 | GCP Tools | 8 | src/handlers/gcp.ts |
| 3 | GA4 Tools | 11 | src/handlers/ga4.ts |
| 4 | GTM Tools | 19 | src/handlers/gtm.ts |
| 5 | Google Ads Tools | 12 | src/handlers/gads.ts |
| **Total** | | **54** | |

---

## Environment Configuration

### Required Secrets (set via wrangler secret put)

```bash
wrangler secret put GOOGLE_CLIENT_ID
wrangler secret put GOOGLE_CLIENT_SECRET
```

### Required OAuth Scopes

```
# Google Ads
https://www.googleapis.com/auth/adwords

# Google Tag Manager
https://www.googleapis.com/auth/tagmanager.readonly
https://www.googleapis.com/auth/tagmanager.edit.containers
https://www.googleapis.com/auth/tagmanager.edit.containerversions
https://www.googleapis.com/auth/tagmanager.publish

# Google Analytics 4
https://www.googleapis.com/auth/analytics.readonly
https://www.googleapis.com/auth/analytics.edit

# Google Cloud Platform
https://www.googleapis.com/auth/cloud-platform.read-only
```

---

## Tool Naming Convention

All tools follow this pattern:
```
ghub_<service>_<action>

Services: auth, gcp, ga4, gtm, gads
Actions: list, get, create, update, delete, run
```

Examples:
- `ghub_auth_init` - Start OAuth flow
- `ghub_gcp_list_projects` - List GCP projects
- `ghub_ga4_run_report` - Run GA4 report
- `ghub_gtm_create_tag` - Create GTM tag
- `ghub_gads_gaql_query` - Execute GAQL query

---

## API Endpoints Reference

| API | Base URL | Auth |
|-----|----------|------|
| GCP | `cloudresourcemanager.googleapis.com/v1` | Bearer |
| GA4 Data | `analyticsdata.googleapis.com/v1beta` | Bearer |
| GA4 Admin | `analyticsadmin.googleapis.com/v1beta` | Bearer |
| GTM | `tagmanager.googleapis.com/tagmanager/v2` | Bearer |
| Google Ads | `googleads.googleapis.com/v17` | Bearer + developer-token |

---

## Claude Desktop Configuration

After completing OAuth flow and receiving a `ghub_xxx` token:

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

---

## Git Commit Strategy

Each phase completion should use this format:

```
feat(phase-X): [Phase Name] complete

- [Implementation detail 1]
- [Implementation detail 2]

Tools implemented: X
Success criteria verified.
```

---

## Success Metrics

| Metric | Target |
|--------|--------|
| OAuth Flow | < 30 seconds |
| Tool Response | < 2 seconds |
| Token Refresh | Automatic, 5-min buffer |
| Error Handling | Proper MCP error codes |

---

## Development Commands

```bash
npm run dev          # Local development (wrangler dev)
npm run deploy       # Deploy to Cloudflare
npm run d1:migrate   # Run D1 migrations
npm run logs         # View worker logs
```

---

## Phase Dependencies

```
Phase 0 (Setup)
    │
    ▼
Phase 1 (Auth) ─┬─► Phase 2 (GCP)
                ├─► Phase 3 (GA4)     ← Can run in parallel
                ├─► Phase 4 (GTM)
                └─► Phase 5 (Google Ads)
```

Phases 2-5 can be developed in parallel after Phase 1 completes.
