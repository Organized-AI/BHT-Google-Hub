# Google Marketing Hub MCP

A Remote MCP (Model Context Protocol) Server for Google Marketing APIs, deployed on Cloudflare Workers.

## Overview

Google Marketing Hub MCP provides **54 tools** for interacting with Google's marketing and cloud services through a unified MCP interface. It enables AI assistants to manage your Google marketing stack programmatically.

### Supported Services

| Service | Tools | Description |
|---------|-------|-------------|
| **Auth** | 4 | OAuth 2.0 flow with token management |
| **GCP** | 8 | Project management, IAM, service accounts, billing |
| **GA4** | 11 | Analytics reporting, audiences, conversions, data streams |
| **GTM** | 19 | Tag management, containers, workspaces, versions |
| **Google Ads** | 12 | Campaigns, ad groups, GAQL queries, performance reports |

## Architecture

```
Claude/AI Assistant → SSE (/sse) → Cloudflare Workers → Google APIs
                        ↓
                   POST (/message)
                        ↓
                   D1 (tokens) + KV (sessions)
```

### Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/sse` | GET | SSE connection for MCP protocol |
| `/message` | POST | JSON-RPC message handling |
| `/oauth/authorize` | GET | Start OAuth flow |
| `/oauth/callback` | GET | OAuth callback handler |
| `/health` | GET | Health check endpoint |

## Quick Start

### Prerequisites

- Node.js 18+
- Cloudflare account
- Google Cloud project with OAuth 2.0 credentials

### 1. Clone and Install

```bash
git clone <repository-url>
cd google-marketing-hub-mcp
npm install
```

### 2. Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create an OAuth 2.0 Client ID (Web Application)
3. Add authorized redirect URIs:
   - `https://google-marketing-hub-mcp.<your-subdomain>.workers.dev/oauth/callback`
   - `http://localhost:8787/oauth/callback` (for local dev)

### 3. Set Up Cloudflare Resources

```bash
# Create D1 database
wrangler d1 create ghub-tokens

# Create KV namespace
wrangler kv:namespace create sessions

# Update wrangler.toml with the IDs from above commands
```

### 4. Configure Secrets

```bash
wrangler secret put GOOGLE_CLIENT_ID
wrangler secret put GOOGLE_CLIENT_SECRET
```

### 5. Run Migrations

```bash
npm run d1:migrate        # Production
npm run d1:migrate:local  # Local development
```

### 6. Deploy

```bash
npm run dev     # Local development
npm run deploy  # Production deployment
```

## Tools Reference

### Auth Tools

| Tool | Description |
|------|-------------|
| `ghub_auth_init` | Initialize OAuth flow, returns authorization URL |
| `ghub_auth_status` | Check authentication status for a user |
| `ghub_auth_revoke` | Revoke authentication tokens |
| `ghub_auth_list` | List all authenticated users (admin) |

### GCP Tools

| Tool | Description |
|------|-------------|
| `gcp_list_projects` | List all GCP projects |
| `gcp_get_project` | Get details for a specific project |
| `gcp_list_service_accounts` | List service accounts in a project |
| `gcp_get_service_account` | Get service account details |
| `gcp_list_enabled_apis` | List enabled APIs for a project |
| `gcp_enable_api` | Enable an API for a project |
| `gcp_get_billing_info` | Get billing info for a project |
| `gcp_list_billing_accounts` | List available billing accounts |

### GA4 Tools

| Tool | Description |
|------|-------------|
| `ga4_list_properties` | List all GA4 properties |
| `ga4_get_property` | Get property details |
| `ga4_list_data_streams` | List data streams for a property |
| `ga4_get_data_stream` | Get data stream details |
| `ga4_run_report` | Run an analytics report |
| `ga4_run_realtime_report` | Run a realtime report |
| `ga4_get_metadata` | Get metadata (dimensions/metrics) |
| `ga4_list_audiences` | List audiences for a property |
| `ga4_get_audience` | Get audience details |
| `ga4_list_conversion_events` | List conversion events |
| `ga4_get_conversion_event` | Get conversion event details |

### GTM Tools

| Tool | Description |
|------|-------------|
| `gtm_list_accounts` | List GTM accounts |
| `gtm_get_account` | Get account details |
| `gtm_list_containers` | List containers in an account |
| `gtm_get_container` | Get container details |
| `gtm_list_workspaces` | List workspaces in a container |
| `gtm_get_workspace` | Get workspace details |
| `gtm_list_tags` | List tags in a workspace |
| `gtm_get_tag` | Get tag details |
| `gtm_create_tag` | Create a new tag |
| `gtm_update_tag` | Update an existing tag |
| `gtm_list_triggers` | List triggers in a workspace |
| `gtm_get_trigger` | Get trigger details |
| `gtm_create_trigger` | Create a new trigger |
| `gtm_list_variables` | List variables in a workspace |
| `gtm_get_variable` | Get variable details |
| `gtm_create_variable` | Create a new variable |
| `gtm_list_versions` | List container versions |
| `gtm_create_version` | Create a new version |
| `gtm_publish_version` | Publish a version |

### Google Ads Tools

| Tool | Description |
|------|-------------|
| `gads_list_accounts` | List accessible Google Ads accounts |
| `gads_get_account` | Get account details |
| `gads_list_campaigns` | List campaigns in an account |
| `gads_get_campaign` | Get campaign details |
| `gads_update_campaign_status` | Update campaign status (enable/pause) |
| `gads_update_campaign_budget` | Update campaign budget |
| `gads_run_report` | Run a custom GAQL report |
| `gads_get_campaign_performance` | Get campaign performance metrics |
| `gads_get_keyword_performance` | Get keyword performance metrics |
| `gads_get_search_terms_report` | Get search terms report |
| `gads_get_change_history` | Get account change history |
| `gads_get_recommendations` | Get Google Ads recommendations |

## Authentication Flow

1. Call `ghub_auth_init` to get an authorization URL
2. User visits the URL and authorizes access
3. Callback stores tokens with a `ghub_xxx` token ID
4. Use the token ID in subsequent API calls via `user_id` parameter

```javascript
// Example: Initialize auth
const result = await callTool('ghub_auth_init', {});
// Returns: { user_id: "ghub_abc123...", auth_url: "https://..." }

// After user authorizes, check status
const status = await callTool('ghub_auth_status', {
  user_id: "ghub_abc123..."
});

// Use token for API calls
const projects = await callTool('gcp_list_projects', {
  user_id: "ghub_abc123..."
});
```

## Project Structure

```
├── src/
│   ├── index.ts              # Main entry point & routing
│   ├── lib/
│   │   ├── token-manager.ts  # OAuth token management
│   │   └── google-api-client.ts  # Google API wrapper
│   └── tools/
│       ├── gcp/              # GCP tools (8 tools)
│       ├── ga4/              # GA4 tools (11 tools)
│       ├── gtm/              # GTM tools (19 tools)
│       └── gads/             # Google Ads tools (12 tools)
├── migrations/
│   └── 0001_initial.sql      # D1 database schema
├── wrangler.toml             # Cloudflare Workers config
├── package.json
└── tsconfig.json
```

## Configuration

### Environment Variables

| Variable | Description |
|----------|-------------|
| `GOOGLE_CLIENT_ID` | OAuth 2.0 Client ID |
| `GOOGLE_CLIENT_SECRET` | OAuth 2.0 Client Secret |
| `ENVIRONMENT` | `development` or `production` |
| `MCP_SERVER_NAME` | Server name for MCP protocol |
| `MCP_SERVER_VERSION` | Server version |

### Required OAuth Scopes

The server requests the following Google OAuth scopes:

- `https://www.googleapis.com/auth/adwords`
- `https://www.googleapis.com/auth/tagmanager.readonly`
- `https://www.googleapis.com/auth/tagmanager.edit.containers`
- `https://www.googleapis.com/auth/tagmanager.edit.containerversions`
- `https://www.googleapis.com/auth/tagmanager.publish`
- `https://www.googleapis.com/auth/analytics.readonly`
- `https://www.googleapis.com/auth/analytics.edit`
- `https://www.googleapis.com/auth/cloud-platform.read-only`
- `https://www.googleapis.com/auth/cloud-platform`
- `https://www.googleapis.com/auth/cloud-billing.readonly`

## Development

### Commands

```bash
npm run dev          # Start local development server
npm run deploy       # Deploy to Cloudflare Workers
npm run d1:migrate   # Run D1 migrations (production)
npm run d1:migrate:local  # Run D1 migrations (local)
npm run logs         # View worker logs
npm run typecheck    # TypeScript type checking
```

### Local Testing

```bash
# Start the dev server
npm run dev

# Test health endpoint
curl http://localhost:8787/health

# Test MCP initialize
curl -X POST http://localhost:8787/message \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize"}'

# List available tools
curl -X POST http://localhost:8787/message \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list"}'
```

## Token Pattern

All user tokens follow the pattern: `ghub_xxxxxxxxxxxxxx`

This allows easy identification of tokens belonging to this MCP server.

## Error Handling

The server uses standard JSON-RPC error codes with custom extensions:

| Code | Description |
|------|-------------|
| `-32600` | Invalid request |
| `-32601` | Method not found |
| `-32602` | Invalid params |
| `-32001` | Token not found |
| `-32002` | Token refresh failed |
| `-32003` | Google API error |
| `-32004` | Rate limited |

## License

MIT
