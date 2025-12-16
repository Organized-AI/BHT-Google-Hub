# Phase 0: Project Setup and Remote MCP Deployment

## Objective
Set up the Google Marketing Hub Remote MCP Server on Cloudflare Workers with D1 database and KV namespace.

## Prerequisites
- Cloudflare account with Workers enabled
- wrangler CLI installed (`npm install -g wrangler`)
- Google Cloud Console project with OAuth 2.0 credentials

## Commands
```bash
cd /Users/supabowl/Library/Mobile\ Documents/com~apple~CloudDocs/BHT\ Promo\ iCloud/Organized\ AI/Windsurf/google-marketing-hub-mcp

claude --dangerously-skip-permissions
```

## Prompt for Claude Code

```
You are setting up the Google Marketing Hub Remote MCP Server on Cloudflare Workers.

## Context
- Remote MCP Server with SSE transport (not local stdio)
- Endpoints: /sse (GET), /message (POST), /oauth/authorize, /oauth/callback
- D1 database for token storage (ghub_xxx pattern)
- KV namespace for session cache (1-hour TTL)
- Pure TypeScript implementation (no MCP SDK, no Hono)

## Tasks
1. Login to Cloudflare:
   wrangler login

2. Create D1 database:
   wrangler d1 create ghub-tokens
   # Copy the database_id to wrangler.toml [[d1_databases]] section

3. Create KV namespace:
   wrangler kv:namespace create sessions
   # Copy the id to wrangler.toml [[kv_namespaces]] section

4. Set Google OAuth secrets:
   wrangler secret put GOOGLE_CLIENT_ID
   # Enter your Google OAuth client ID when prompted
   
   wrangler secret put GOOGLE_CLIENT_SECRET
   # Enter your Google OAuth client secret when prompted

5. Run D1 migrations:
   wrangler d1 execute ghub-tokens --file=./migrations/0001_initial.sql

6. Install dependencies:
   npm install

7. Test locally:
   npm run dev
   # Visit http://localhost:8787/oauth/authorize to test OAuth flow

8. Deploy to Cloudflare:
   npm run deploy
   # Note the workers.dev URL: https://google-marketing-hub-mcp.<subdomain>.workers.dev

9. Update Google Cloud Console OAuth redirect URIs:
   - Add: https://google-marketing-hub-mcp.<subdomain>.workers.dev/oauth/callback

10. Test the deployed server:
    - Visit /oauth/authorize to complete OAuth flow
    - Copy the ghub_xxx token
    - Configure Claude Desktop with the SSE URL

## Validation
- [ ] D1 database created and ID added to wrangler.toml
- [ ] KV namespace created and ID added to wrangler.toml
- [ ] Secrets set (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)
- [ ] Migrations applied to D1
- [ ] Local dev server works (wrangler dev)
- [ ] Deployed to workers.dev
- [ ] OAuth flow completes and returns ghub_xxx token
- [ ] Claude Desktop can connect via SSE

## Claude Desktop Configuration
After getting your ghub_xxx token, add to Claude Desktop:

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

## Success Criteria
- Cloudflare Worker deployed and accessible
- OAuth flow works end-to-end
- Claude Desktop connects via SSE
- tools/list returns tool definitions
