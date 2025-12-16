# Google Marketing Hub MCP Orchestrator Agent

Orchestrates the phased build of the Google Marketing Hub Remote MCP Server on Cloudflare Workers.

## Trigger Phrases
- "build google hub", "start mcp server", "execute phases"
- "google marketing hub", "ghub build", "mcp orchestrator"
- "deploy google apis", "cloudflare mcp"

---

## Project Overview

| Component | Tools | Phase | Status |
|-----------|-------|-------|--------|
| Auth | 4 | Phase 1 | ⏳ |
| GCP | 8 | Phase 2 | ⏳ |
| GA4 | 11 | Phase 3 | ⏳ |
| GTM | 19 | Phase 4 | ⏳ |
| Google Ads | 12 | Phase 5 | ⏳ |
| **Total** | **54** | | |

## Architecture

```
Claude Desktop → SSE (/sse) → Cloudflare Workers → Google APIs
                  ↓
              POST (/message)
                  ↓
              D1 (tokens) + KV (sessions)
```

---

## Phase Execution Protocol

### Before Starting Any Phase

1. Check current status: `/status`
2. Read the phase prompt from `PLANNING/phase-X-*.md`
3. Verify prerequisites from previous phase complete

### Phase 0: Project Setup (First!)

```bash
# Read the setup guide
Read PLANNING/phase-0-setup.md

# Key tasks
wrangler login
wrangler d1 create ghub-tokens
wrangler kv:namespace create sessions
wrangler secret put GOOGLE_CLIENT_ID
wrangler secret put GOOGLE_CLIENT_SECRET
npm install
wrangler dev
```

**Exit Criteria:**
- [ ] D1 database created
- [ ] KV namespace created
- [ ] Secrets set
- [ ] `wrangler dev` starts successfully
- [ ] Create `PHASE-0-COMPLETE.md`

### Phase 1: Auth Layer (4 tools)

```
Read PLANNING/phase-1-auth.md
```

**Tools:**
- `ghub_auth_init` - Start OAuth flow
- `ghub_auth_callback` - Handle OAuth callback
- `ghub_auth_status` - Check token status
- `ghub_auth_revoke` - Revoke tokens

**Key Classes:**
- `TokenManager` - D1 operations for ghub_xxx tokens
- `GoogleApiClient` - Authenticated API calls with auto-refresh

**Exit Criteria:**
- [ ] OAuth flow works end-to-end
- [ ] Tokens stored in D1 with `ghub_xxx` pattern
- [ ] Auto-refresh works
- [ ] Create `PHASE-1-COMPLETE.md`

### Phase 2: GCP Tools (8 tools)

```
Read PLANNING/phase-2-gcp.md
```

**Tools:**
- `ghub_gcp_list_projects`
- `ghub_gcp_get_project`
- `ghub_gcp_list_service_accounts`
- `ghub_gcp_list_services`
- `ghub_gcp_enable_service`
- `ghub_gcp_list_iam_roles`
- `ghub_gcp_get_project_iam`
- `ghub_gcp_set_project_iam`

**API Base:** `cloudresourcemanager.googleapis.com/v1`

### Phase 3: GA4 Tools (11 tools)

```
Read PLANNING/phase-3-ga4.md
```

**Tools:**
- `ghub_ga4_list_properties`
- `ghub_ga4_get_property`
- `ghub_ga4_run_report`
- `ghub_ga4_run_realtime_report`
- `ghub_ga4_list_audiences`
- `ghub_ga4_create_audience`
- `ghub_ga4_list_conversions`
- `ghub_ga4_create_conversion`
- `ghub_ga4_list_custom_dimensions`
- `ghub_ga4_create_custom_dimension`
- `ghub_ga4_get_data_retention`

**APIs:**
- `analyticsdata.googleapis.com` (reporting)
- `analyticsadmin.googleapis.com` (admin)

### Phase 4: GTM Tools (19 tools)

```
Read PLANNING/phase-4-gtm.md
```

**Tool Categories:**
- **Account/Container:** list_accounts, list_containers, get_container
- **Workspace:** list_workspaces, create_workspace, sync, preview
- **Tags:** list_tags, get_tag, create_tag, update_tag, delete_tag
- **Triggers:** list_triggers, create_trigger
- **Variables:** list_variables, create_variable
- **Versions:** list_versions, create_version, publish_version

**API:** `tagmanager.googleapis.com/tagmanager/v2`

### Phase 5: Google Ads Tools (12 tools)

```
Read PLANNING/phase-5-gads.md
```

**Tools:**
- **Customer:** list_customers, get_customer
- **Campaigns:** list_campaigns, get_campaign, update_campaign
- **Ad Groups:** list_ad_groups, list_ads, get_ad_metrics
- **Keywords:** list_keywords, get_search_terms
- **Other:** list_conversions, gaql_query

**API:** `googleads.googleapis.com/v17`

**Note:** Requires `developer-token` header in addition to Bearer token

---

## Sub-Agents

Invoke these specialized agents when needed:

| Agent | When to Use |
|-------|-------------|
| `mcp-builder` | TypeScript implementation, MCP protocol issues |
| `auth-specialist` | OAuth flows, token management, D1 operations |
| `google-api-expert` | API errors, rate limits, schema issues |
| `qa-tester` | Tool validation, testing |

---

## Commands Reference

| Command | Purpose |
|---------|---------|
| `/deploy` | Deploy to Cloudflare Workers |
| `/status` | Check current phase progress |
| `/add-tool <name>` | Generate tool boilerplate |
| `/test-tool <name>` | Test individual tool |

---

## Tool Pattern

All tools follow this naming convention:

```
ghub_<service>_<action>

Examples:
- ghub_auth_status
- ghub_gcp_list_projects
- ghub_ga4_run_report
- ghub_gtm_create_tag
- ghub_gads_list_campaigns
```

---

## Token Pattern

```
ghub_xxxxxxxxxxxxxx
```

- 16-character alphanumeric
- Stored in D1 with encrypted Google tokens
- Sessions cached in KV (1-hour TTL)

---

## Development Commands

```bash
# Local development
npm run dev

# Deploy to Cloudflare
npm run deploy

# Run D1 migrations
npm run d1:migrate

# View worker logs
npm run logs

# Test specific tool
/test-tool ghub_auth_status
```

---

## Git Workflow

After each phase completion:

```bash
git add -A
git commit -m "Phase X: [description]"
git push origin main
```

---

## Endpoints Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/sse` | GET | SSE connection (MCP transport) |
| `/message` | POST | JSON-RPC messages |
| `/oauth/authorize` | GET | Start OAuth flow |
| `/oauth/callback` | GET | OAuth redirect handler |
| `/health` | GET | Health check |

---

## Claude Desktop Configuration

After completing Phase 1 (Auth), configure Claude Desktop:

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

## Quick Start

### ⚠️ CRITICAL: Autonomous Mode Required

**MUST run with `--dangerously-skip-permissions` for hands-free builds.**

```bash
cd google-marketing-hub-mcp
claude --dangerously-skip-permissions
```

### Autonomous Build Prompt (Copy-Paste)

```
Read PLANNING/phase-0-setup.md and execute all tasks.
Use flat src/ structure (not packages/mcp-server/).
Create PLANNING/PHASE-0-COMPLETE.md when done and proceed to Phase 1.
After completing each phase, AUTOMATICALLY proceed to the next phase.
Create PLANNING/PHASE-X-COMPLETE.md after each phase and git commit.
Do NOT wait for user approval between phases - continue autonomously.
If you encounter approval prompts, STOP and remind user to restart with:
  claude --dangerously-skip-permissions
```

### Permissions Check Protocol

**Before each phase, verify autonomous mode:**
- If tool calls require approval → NOT in autonomous mode
- Display warning and stop execution
- User must restart with `--dangerously-skip-permissions`

**Expected behavior in autonomous mode:**
- All file operations execute without prompts
- All bash commands execute without prompts
- Phase transitions happen automatically
- User can leave and return to find build complete

---

## Troubleshooting

### OAuth Errors
- Verify redirect URI in Google Cloud Console matches worker URL
- Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET secrets are set
- Invoke `auth-specialist` agent

### API Errors
- 401: Token expired - check TokenManager auto-refresh
- 403: Insufficient scopes - update OAuth scopes in auth flow
- 429: Rate limited - implement exponential backoff
- Invoke `google-api-expert` agent

### Deployment Issues
- Run `wrangler whoami` to verify auth
- Check D1 and KV bindings in wrangler.toml
- Verify migrations applied: `wrangler d1 execute ghub-tokens --command "SELECT * FROM tokens LIMIT 1"`

---

## Files Reference

```
google-marketing-hub-mcp/
├── src/
│   ├── index.ts              # Main entry point
│   ├── lib/
│   │   ├── token-manager.ts  # D1 token operations
│   │   ├── google-client.ts  # Authenticated API client
│   │   └── errors.ts         # Error constants
│   ├── handlers/
│   │   ├── auth.ts           # Auth tools
│   │   ├── gcp.ts            # GCP tools
│   │   ├── ga4.ts            # GA4 tools
│   │   ├── gtm.ts            # GTM tools
│   │   └── gads.ts           # Google Ads tools
│   └── types/
│       └── mcp.ts            # MCP types
├── migrations/
│   └── 0001_initial.sql      # D1 schema
├── wrangler.toml             # Cloudflare config
├── package.json
├── tsconfig.json
└── PLANNING/
    ├── LAUNCH.md
    ├── ORCHESTRATION.md
    └── phase-*.md            # Phase prompts
```
