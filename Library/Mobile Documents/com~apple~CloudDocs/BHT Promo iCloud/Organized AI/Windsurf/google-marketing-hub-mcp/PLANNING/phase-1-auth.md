# Phase 1: Auth Layer Implementation

## Objective
Implement robust TokenManager with automatic refresh, multi-account support, and proper error handling.

## Commands
```bash
cd /Users/supabowl/Library/Mobile\ Documents/com~apple~CloudDocs/BHT\ Promo\ iCloud/Organized\ AI/Windsurf/google-marketing-hub-mcp/packages/mcp-server

claude --dangerously-skip-permissions
```

## Prompt for Claude Code

```
You are implementing the Auth Layer for the Google Marketing Hub Remote MCP Server.

## Context
- Remote MCP on Cloudflare Workers with D1 database
- Token pattern: ghub_xxx (prefix identifies this MCP server)
- OAuth 2.0 with Google APIs
- Must handle token refresh automatically before expiry

## Files to Create/Modify

### 1. Create: src/lib/token-manager.ts
Implement TokenManager class with:
- getToken(tokenId: string): Promise<TokenData | null>
- refreshToken(tokenId: string): Promise<TokenData>
- isTokenExpired(tokenData: TokenData): boolean
- getValidToken(tokenId: string): Promise<TokenData> (auto-refresh if needed)
- revokeToken(tokenId: string): Promise<void>

Token refresh logic:
- Refresh 5 minutes before expiry
- Use Google's token refresh endpoint
- Update D1 with new access_token and expires_at
- Handle refresh failures gracefully

### 2. Create: src/lib/google-client.ts
Implement GoogleApiClient class with:
- constructor(tokenManager: TokenManager, tokenId: string)
- request<T>(endpoint: string, options?: RequestInit): Promise<T>
- Automatic Authorization header injection
- Automatic token refresh on 401 responses
- Rate limiting awareness (429 handling)

### 3. Update: src/index.ts
Integrate TokenManager into the message handler:
- Validate token before processing tool calls
- Pass GoogleApiClient to tool handlers
- Handle token errors with proper MCP error responses

## D1 Schema Reference
```sql
CREATE TABLE tokens (
  id TEXT PRIMARY KEY,           -- ghub_xxx
  google_access_token TEXT NOT NULL,
  google_refresh_token TEXT NOT NULL,
  google_token_expiry INTEGER NOT NULL,
  scopes TEXT NOT NULL,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);
```

## Google Token Refresh Endpoint
POST https://oauth2.googleapis.com/token
Content-Type: application/x-www-form-urlencoded

client_id={CLIENT_ID}
client_secret={CLIENT_SECRET}
refresh_token={REFRESH_TOKEN}
grant_type=refresh_token

## Error Handling
- Token not found: Return MCP error with code -32001
- Token expired and refresh failed: Return MCP error with code -32002
- Google API error: Return MCP error with code -32003

## Validation
- [ ] TokenManager retrieves tokens from D1
- [ ] Token refresh works before expiry
- [ ] Auto-refresh on near-expiry tokens
- [ ] GoogleApiClient injects auth headers
- [ ] 401 responses trigger token refresh
- [ ] Proper error codes returned to MCP client
```

## Success Criteria
- All API calls automatically authenticated
- Token refresh happens transparently
- Expired tokens are refreshed before use
- Failed refresh returns clear error to user
