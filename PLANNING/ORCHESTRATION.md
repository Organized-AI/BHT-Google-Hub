# Build Orchestration Guide

## Component-to-Phase Mapping

This document maps all Claude components to their respective build phases, ensuring efficient orchestration.

---

## Agents Matrix

| Agent | Phase 0 | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 | When to Invoke |
|-------|---------|---------|---------|---------|---------|---------|----------------|
| `mcp-builder` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | TypeScript implementation, MCP protocol issues |
| `auth-specialist` | ⚪ | ✅ | ⚪ | ⚪ | ⚪ | ⚪ | OAuth flows, token management, D1 operations |
| `qa-tester` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | After each phase, tool validation |
| `google-api-expert` | ⚪ | ⚪ | ✅ | ✅ | ✅ | ✅ | API errors, rate limits, schema design |

**Legend:** ✅ Primary use | ⚪ Not applicable

---

## Commands Matrix

| Command | Phase 0 | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 | Purpose |
|---------|---------|---------|---------|---------|---------|---------|---------|
| `/deploy` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Deploy to Cloudflare Workers |
| `/status` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Check current phase progress |
| `/add-tool` | ⚪ | ⚪ | ✅ | ✅ | ✅ | ✅ | Generate tool boilerplate |
| `/test-tool` | ⚪ | ✅ | ✅ | ✅ | ✅ | ✅ | Test individual tools |

---

## Skills Relevance

### Build-Time Skills (Use During Build)

| Skill | Phase | Use Case |
|-------|-------|----------|
| `phased-planning` | Pre-build | ✅ Already used to create phase prompts |
| `phase-0-template` | Phase 0 | ✅ Already used for setup structure |
| `tech-stack-orchestrator` | Phase 0 | Cloudflare Workers component selection |
| `organized-codebase-applicator` | Phase 0 | Apply consistent folder structure |
| `repo-manager` | All | GitHub operations, version management |
| `skill-creator` | Post-build | Package knowledge as new skills |

### Post-Build Skills (Use After Completion)

| Skill | Purpose | When |
|-------|---------|------|
| `gtm-debug-agent` | Debug GTM implementations | After Phase 4, when users report GTM issues |
| `data-audit` | Audit Meta Ads accounts | NOT for this project (wrong domain) |

---

## Phase Execution Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                       PRE-BUILD                                  │
│  ✓ phased-planning skill created phase prompts                  │
│  ✓ RECOMMENDATIONS.md reviewed                                   │
│  ✓ ORCHESTRATION.md (this doc) created                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 0: Project Setup                                          │
│─────────────────────────────────────────────────────────────────│
│ Agents: mcp-builder, qa-tester                                  │
│ Commands: /deploy, /status                                       │
│ Skills: tech-stack-orchestrator, organized-codebase-applicator  │
│─────────────────────────────────────────────────────────────────│
│ Tasks:                                                          │
│  [ ] Create wrangler.toml                                       │
│  [ ] Create package.json with dependencies                      │
│  [ ] Create tsconfig.json                                       │
│  [ ] Create D1 database (ghub-tokens)                           │
│  [ ] Create KV namespace (sessions)                             │
│  [ ] Set secrets (CLIENT_ID, CLIENT_SECRET)                     │
│  [ ] Apply migrations/0001_initial.sql                          │
│  [ ] Verify wrangler dev starts                                 │
│  [ ] Verify /sse endpoint responds                              │
│─────────────────────────────────────────────────────────────────│
│ Exit Criteria: PHASE-0-COMPLETE.md + wrangler dev works         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 1: Auth Layer (4 tools)                                   │
│─────────────────────────────────────────────────────────────────│
│ Agents: mcp-builder, auth-specialist, qa-tester                 │
│ Commands: /deploy, /status, /test-tool                          │
│─────────────────────────────────────────────────────────────────│
│ Tools to Implement:                                             │
│  [ ] ghub_auth_init                                             │
│  [ ] ghub_auth_callback                                         │
│  [ ] ghub_auth_status                                           │
│  [ ] ghub_auth_revoke                                           │
│─────────────────────────────────────────────────────────────────│
│ Key Classes: TokenManager, GoogleApiClient                      │
│ Exit Criteria: OAuth flow works end-to-end                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 2: GCP Tools (8 tools)                                    │
│─────────────────────────────────────────────────────────────────│
│ Agents: mcp-builder, google-api-expert, qa-tester               │
│ Commands: /deploy, /add-tool, /test-tool, /status               │
│─────────────────────────────────────────────────────────────────│
│ Tools to Implement:                                             │
│  [ ] ghub_gcp_list_projects                                     │
│  [ ] ghub_gcp_get_project                                       │
│  [ ] ghub_gcp_list_service_accounts                             │
│  [ ] ghub_gcp_list_services                                     │
│  [ ] ghub_gcp_enable_service                                    │
│  [ ] ghub_gcp_list_iam_roles                                    │
│  [ ] ghub_gcp_get_project_iam                                   │
│  [ ] ghub_gcp_set_project_iam                                   │
│─────────────────────────────────────────────────────────────────│
│ API Base: cloudresourcemanager.googleapis.com/v1                │
│ Exit Criteria: All 8 tools pass /test-tool validation           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 3: GA4 Tools (11 tools)                                   │
│─────────────────────────────────────────────────────────────────│
│ Agents: mcp-builder, google-api-expert, qa-tester               │
│ Commands: /deploy, /add-tool, /test-tool, /status               │
│─────────────────────────────────────────────────────────────────│
│ Tools to Implement:                                             │
│  [ ] ghub_ga4_list_properties                                   │
│  [ ] ghub_ga4_get_property                                      │
│  [ ] ghub_ga4_run_report                                        │
│  [ ] ghub_ga4_run_realtime_report                               │
│  [ ] ghub_ga4_list_audiences                                    │
│  [ ] ghub_ga4_create_audience                                   │
│  [ ] ghub_ga4_list_conversions                                  │
│  [ ] ghub_ga4_create_conversion                                 │
│  [ ] ghub_ga4_list_custom_dimensions                            │
│  [ ] ghub_ga4_create_custom_dimension                           │
│  [ ] ghub_ga4_get_data_retention                                │
│─────────────────────────────────────────────────────────────────│
│ APIs: analyticsdata.googleapis.com, analyticsadmin.googleapis.com│
│ Exit Criteria: All 11 tools pass /test-tool validation          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 4: GTM Tools (19 tools)                                   │
│─────────────────────────────────────────────────────────────────│
│ Agents: mcp-builder, google-api-expert, qa-tester               │
│ Commands: /deploy, /add-tool, /test-tool, /status               │
│─────────────────────────────────────────────────────────────────│
│ Tools to Implement:                                             │
│  Account/Container: list_accounts, list_containers, get_container│
│  Workspace: list_workspaces, create_workspace, sync, preview    │
│  Tags: list_tags, get_tag, create_tag, update_tag, delete_tag   │
│  Triggers: list_triggers, create_trigger                        │
│  Variables: list_variables, create_variable                     │
│  Versions: list_versions, create_version, publish_version       │
│─────────────────────────────────────────────────────────────────│
│ API: tagmanager.googleapis.com/tagmanager/v2                    │
│ Exit Criteria: All 19 tools pass /test-tool validation          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 5: Google Ads Tools (12 tools)                            │
│─────────────────────────────────────────────────────────────────│
│ Agents: mcp-builder, google-api-expert, qa-tester               │
│ Commands: /deploy, /add-tool, /test-tool, /status               │
│─────────────────────────────────────────────────────────────────│
│ Tools to Implement:                                             │
│  Customer: list_customers, get_customer                         │
│  Campaigns: list_campaigns, get_campaign, update_campaign       │
│  Ad Groups: list_ad_groups, list_ads, get_ad_metrics            │
│  Keywords: list_keywords, get_search_terms                      │
│  Other: list_conversions, gaql_query                            │
│─────────────────────────────────────────────────────────────────│
│ API: googleads.googleapis.com/v17                               │
│ Note: Requires developer-token header in addition to Bearer     │
│ Exit Criteria: All 12 tools pass /test-tool validation          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       POST-BUILD                                 │
│  [ ] Final deployment with wrangler deploy                      │
│  [ ] Update CHECKLIST.md with completion                        │
│  [ ] Create BUILD-COMPLETE.md summary                           │
│  [ ] Consider creating skills from learnings                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Efficiency Optimizations

### 1. Reuse Patterns Across Phases

Phase 1 establishes patterns that MUST be reused in Phases 2-5:

```typescript
// Pattern: Tool definition (from Phase 1)
{
  name: "ghub_<service>_<action>",
  description: "...",
  inputSchema: { type: "object", properties: {...}, required: [...] }
}

// Pattern: Handler structure
async function handle<ToolName>(args: ToolArgs, client: GoogleApiClient): Promise<MCPResponse>
```

### 2. Parallel Work Opportunities

Phases 2-5 are **independent** after Phase 1 completes. If using multiple agents:

```
Phase 1 (Auth) ─┬─► Phase 2 (GCP)
                ├─► Phase 3 (GA4)    ← Can run in parallel
                ├─► Phase 4 (GTM)
                └─► Phase 5 (Google Ads)
```

### 3. Command Shortcuts

| Instead of... | Use... |
|--------------|--------|
| Manual curl testing | `/test-tool <tool_name>` |
| Checking wrangler.toml | `/status` |
| Manual deployment | `/deploy` |
| Writing tool boilerplate | `/add-tool <tool_name>` |

### 4. Agent Invocation Triggers

Automatically invoke agents when you encounter:

| Trigger | Agent |
|---------|-------|
| TypeScript compilation errors | `mcp-builder` |
| OAuth 401/403 errors | `auth-specialist` |
| Google API 400/429 errors | `google-api-expert` |
| Tool not returning expected format | `qa-tester` |

---

## Gap Analysis

### Identified Gaps

| Gap | Impact | Resolution |
|-----|--------|------------|
| No pre-commit hooks | Manual linting | Add eslint hook in Phase 0 |
| No integration tests | Manual testing only | Add `tests/` directory in Phase 0 |
| CLAUDE.md was wrong | Confusion | ✅ Fixed in RECOMMENDATIONS |
| `packages/mcp-server/` path | Phase prompts reference wrong path | Use flat `src/` structure |

### Recommended Additions

1. **Add ESLint Hook** (Phase 0)
```bash
# .claude/hooks/pre-commit.sh
npx eslint src/ --fix
```

2. **Add Health Check Route** (Phase 0)
```typescript
// src/index.ts - add alongside /sse and /message
router.get('/health', () => new Response('OK', { status: 200 }));
```

3. **Add Error Code Constants** (Phase 1)
```typescript
// src/lib/errors.ts
export const MCP_ERRORS = {
  TOKEN_NOT_FOUND: -32001,
  TOKEN_REFRESH_FAILED: -32002,
  GOOGLE_API_ERROR: -32003,
  RATE_LIMITED: -32004,
  INVALID_PARAMS: -32600
};
```

---

## Verification Checklist Per Phase

Run after completing each phase:

```bash
# 1. TypeScript compiles
npx tsc --noEmit

# 2. Wrangler runs locally
npx wrangler dev

# 3. Test specific tool (replace tool_name)
/test-tool ghub_auth_status

# 4. Deploy to staging
/deploy

# 5. Mark phase complete
# Create PHASE-X-COMPLETE.md
```

---

## Quick Reference: MCP Tool IDs Available

These MCP tools from connected servers may assist during build:

| Tool | Use Case |
|------|----------|
| `mcp__repomix__pack_codebase` | Package code for review |
| `mcp__MCP_DOCKER__get-library-docs` | Fetch up-to-date library docs |
| `mcp__MCP_DOCKER__firecrawl_scrape` | Scrape Google API documentation |
| `mcp__MCP_DOCKER__git_*` | Git operations |

---

## Start Command

When ready to begin Phase 0:

```
Read PLANNING/phase-0-setup.md and execute all tasks. Use flat src/ structure (not packages/mcp-server/). Create PHASE-0-COMPLETE.md when done and proceed to Phase 1.
```
